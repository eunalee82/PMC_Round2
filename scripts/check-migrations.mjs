// 마이그레이션 적용 여부 확인 — `node scripts/check-migrations.mjs`
//
// 서버에 실제로 무엇이 적용됐는지 **읽기 전용**으로 확인한다. anon 키만 쓰고, 키는 출력하지 않는다.
// 적용 순서: 0009 → 0010 → 0011 → 0003 (0003 이 0009 가 만든 컬럼을 쓴다).
// see docs/handoff.md §10.1
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env.local')
if (!existsSync(envPath)) {
  console.error('.env.local 이 없다 — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 필요하다')
  process.exit(1)
}
const env = {}
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const URL = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_ANON_KEY
if (!URL || !KEY) { console.error('env 에 Supabase URL/ANON_KEY 가 없다'); process.exit(1) }

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
const results = []

// ── 0010: games.duration_minutes ──────────────────────────────
let duration = null
try {
  const r = await fetch(`${URL}/rest/v1/rpc/game_state`, { method: 'POST', headers: H, body: '{}' })
  const d = await r.json()
  duration = d.duration_minutes
  results.push(['0010_duration_80min', duration === 80, `duration_minutes = ${duration}`])
} catch (e) {
  results.push(['0010_duration_80min', false, `게임 상태 조회 실패 — ${e.message}`])
}

// ── 0009: submit_answer 가 p_choice_indexes 를 받는가 ─────────
// 없으면 PostgREST 가 PGRST202(함수 못 찾음). 있으면 토큰/권한 거부가 나므로 '적용됨'이다.
try {
  const r = await fetch(`${URL}/rest/v1/rpc/submit_answer`, {
    method: 'POST',
    headers: H,
    body: JSON.stringify({
      p_team_id: '__probe__', p_token: '00000000-0000-0000-0000-000000000000',
      p_case_id: '__probe__', p_stage: 2, p_choice_index: null,
      p_choice_indexes: [0, 1, 2], p_locale: 'ko'
    })
  })
  const b = await r.json().catch(() => ({}))
  const missing = b.code === 'PGRST202' || /Could not find the function/i.test(b.message || '')
  results.push(['0009_multi_answer', !missing, missing ? '함수 시그니처 없음' : '함수 존재(권한/토큰 거부는 정상)'])
} catch (e) {
  results.push(['0009_multi_answer', false, `조회 실패 — ${e.message}`])
}

// ── 0011: admin_team_status.last_submit_at ────────────────────
// anon 은 이 뷰를 읽을 수 없다 → 권한 거부(401/403)면 컬럼 존재 여부는 알 수 없지만,
// 42703(컬럼 없음)이 오면 확실히 미적용이다.
try {
  const r = await fetch(`${URL}/rest/v1/admin_team_status?select=last_submit_at&limit=1`, { headers: H })
  const t = await r.text()
  const colMissing = /42703/.test(t) && /last_submit_at/.test(t)
  results.push(['0011_team_status_last_submit', !colMissing, colMissing ? '컬럼 없음' : `HTTP ${r.status} (권한 거부면 관리자 로그인으로 확인)`])
} catch (e) {
  results.push(['0011_team_status_last_submit', false, `조회 실패 — ${e.message}`])
}

// ── 0003: 정답 시드 (anon 은 case_answers 를 못 읽는다) ────────
// scoreboard 로 팀 수만 확인하고, 정답은 관리자 로그인 후 SQL 로 세라고 안내한다.
console.log('\n[check-migrations] 서버에 적용된 마이그레이션')
let allOk = true
for (const [name, ok, detail] of results) {
  if (!ok) allOk = false
  console.log(`  ${ok ? '✔' : '✖'} ${name.padEnd(30)} ${detail}`)
}
console.log('\n  · 0003_seed_answers 는 anon 으로 확인할 수 없다 (정답 테이블은 어떤 역할도 읽지 못한다).')
console.log('    SQL Editor 에서: select count(*) from public.case_answers;  → 15 여야 한다')

if (!allOk) {
  console.log('\n적용 순서(이 순서를 지켜야 한다 — 0003 이 0009 가 만든 컬럼을 쓴다):')
  console.log('  1) supabase/migrations/0009_multi_answer.sql')
  console.log('  2) supabase/migrations/0010_duration_80min.sql')
  console.log('  3) supabase/migrations/0011_team_status_last_submit.sql')
  console.log('  4) node scripts/export-seed.mjs → 0003_seed_answers.sql 실행 후 파일 삭제')
  process.exit(1)
}
console.log('\n✔ 0009·0010·0011 적용 확인')
