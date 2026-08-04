// 시드 SQL 생성기 — `node scripts/export-seed.mjs` (추가 패키지 없음)
//   · supabase/migrations/0002_seed_teams.sql   ← src/js/mocks/teams.js (커밋 O)
//   · supabase/migrations/0003_seed_answers.sql ← cases.js 의 SOLUTIONS (커밋 X · .gitignore)
//
// 정답 시드는 저장소에 남기지 않는다: 생성 → 대시보드 SQL Editor 적용 → 파일 삭제.
// see docs/supabase-minimum-design.md §11
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outDir = join(root, 'supabase', 'migrations')
mkdirSync(outDir, { recursive: true })

// data/cases.js → lib/i18n.js 가 localStorage 를 만지므로 Node 용 스텁을 둔다
globalThis.localStorage = { getItem: () => null, setItem: () => {} }

const { BASE_TEAMS } = await import('../src/js/mocks/teams.js')
const { CASES, SOLUTIONS } = await import('../src/js/data/cases.js')

const q = (s) => `'${String(s).replace(/'/g, "''")}'` // SQL 문자열 이스케이프

// ── 0002 팀 33개 ───────────────────────────────────────────────
const teamRows = BASE_TEAMS.map((t, i) =>
  `  (${q(t.id)}, ${q(t.name)}, ${q(t.color)}, ${i}, ${t.test ? 'true' : 'false'})`
).join(',\n')

const teamsSql = `-- 0002_seed_teams.sql — 팀 로스터 시드 (생성: scripts/export-seed.mjs)
-- 원본: src/js/mocks/teams.js · id 는 기존 세션과 호환되도록 그대로 유지한다.
-- 멱등: 이름·색·순서만 갱신하고 점유 정보(claim_token 등)는 건드리지 않는다.

insert into public.teams (id, name, color, sort_order, is_test) values
${teamRows}
on conflict (id) do update
  set name = excluded.name,
      color = excluded.color,
      sort_order = excluded.sort_order,
      is_test = excluded.is_test,
      updated_at = now();

-- 진행 로우 미리 생성 (점수판이 0점으로 보이도록)
insert into public.team_progress (team_id)
select id from public.teams on conflict (team_id) do nothing;
`
writeFileSync(join(outDir, '0002_seed_teams.sql'), teamsSql, 'utf8')

// ── 0003 정답·해설 ─────────────────────────────────────────────
const missing = CASES.filter((c) => !SOLUTIONS[c.id]).map((c) => c.id)
if (missing.length) {
  console.error('정답이 없는 사건:', missing.join(', '))
  process.exit(1)
}

const answerRows = CASES.map((c) => {
  const sol = SOLUTIONS[c.id]
  const en = sol.en && sol.en.analysis ? q(sol.en.analysis) : 'null'
  return `  (${q(c.id)}, ${c.stage}, ${sol.answerIndex}, ${q(sol.analysis)}, ${en})`
}).join(',\n')

const answersSql = `-- 0003_seed_answers.sql — 정답·해설 시드 (생성: scripts/export-seed.mjs)
-- ⚠️ 커밋 금지. 적용 후 이 파일을 삭제한다 (.gitignore 에 등록되어 있다).
-- 사건 본문은 src/js/data/cases.js 에 남아 있고, 여기에는 정답 인덱스와 해설만 있다.

insert into public.case_answers (case_id, stage, answer_index, analysis_ko, analysis_en) values
${answerRows}
on conflict (case_id) do update
  set stage        = excluded.stage,
      answer_index = excluded.answer_index,
      analysis_ko  = excluded.analysis_ko,
      analysis_en  = excluded.analysis_en;
`
writeFileSync(join(outDir, '0003_seed_answers.sql'), answersSql, 'utf8')

console.log(`✔ 0002_seed_teams.sql   — 팀 ${BASE_TEAMS.length}개`)
console.log(`✔ 0003_seed_answers.sql — 정답 ${CASES.length}개 (커밋 금지 · 적용 후 삭제)`)
