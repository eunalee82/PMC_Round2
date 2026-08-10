// 시드 SQL 생성기 — `node scripts/export-seed.mjs` (추가 패키지 없음)
//   · supabase/migrations/0002_seed_teams.sql   ← src/js/mocks/teams.js (커밋 O)
//   · supabase/migrations/0003_seed_answers.sql ← src/js/dev/solutions.js 의 SOLUTIONS (커밋 X · .gitignore)
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

// dev/cases-content.js → lib/i18n.js 가 localStorage 를 만지므로 Node 용 스텁을 둔다
globalThis.localStorage = { getItem: () => null, setItem: () => {} }

const { BASE_TEAMS } = await import('../src/js/mocks/teams.js')
// 본문은 0012 에서 서버(public.cases)로 이관돼 브라우저 번들에 없다 → 진실의 원천인 DEV 본문 모듈에서 사건 목록을 읽는다.
// (data/cases.js 는 매니페스트 재노출 + get_cases 로더만 남은 얇은 파일이라 사건 목록의 출처가 아니다)
const { CASES } = await import('../src/js/dev/cases-content.js')
const { SOLUTIONS } = await import('../src/js/dev/solutions.js') // 정답은 DEV 전용 모듈

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

// 복수 정답 사건은 answer_index 가 null 이고 answer_indexes 배열을 채운다 (0009_multi_answer.sql).
const answerRows = CASES.map((c) => {
  const sol = SOLUTIONS[c.id]
  const en = sol.en && sol.en.analysis ? q(sol.en.analysis) : 'null'
  const multi = Array.isArray(sol.answerIndexes)
  const idx = multi ? 'null' : String(sol.answerIndex)
  const idxs = multi ? `array[${sol.answerIndexes.join(', ')}]::smallint[]` : 'null'
  return `  (${q(c.id)}, ${c.stage}, ${idx}, ${idxs}, ${q(sol.analysis)}, ${en})`
}).join(',\n')

const multiCount = CASES.filter((c) => Array.isArray(SOLUTIONS[c.id].answerIndexes)).length

const answersSql = `-- 0003_seed_answers.sql — 정답·해설 시드 (생성: scripts/export-seed.mjs)
-- ⚠️ 커밋 금지. 적용 후 이 파일을 삭제한다 (.gitignore 에 등록되어 있다).
-- 사건 본문은 0012 에서 서버(public.cases)로 옮겨졌다 → 본문 시드는 0013_seed_cases.sql 이 담당하고,
-- 이 파일에는 정답 인덱스와 해설만 있다. 원본은 src/js/dev/solutions.js (DEV 전용 · 번들 제외).

-- ⚠️ answer_indexes 컬럼은 0009_multi_answer.sql 이 만든다 — 0009 를 먼저 적용해야 이 시드가 돈다.
-- 순서를 놓치면 'column "answer_indexes" does not exist'(42703) 라는 알아보기 힘든 오류가 나므로,
-- 사전 검사로 무엇을 먼저 해야 하는지 알려준다.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'case_answers' and column_name = 'answer_indexes'
  ) then
    raise exception '적용 순서가 틀렸습니다. supabase/migrations/0009_multi_answer.sql 을 먼저 실행한 뒤 이 시드를 실행하십시오. (권장 순서: 0009 → 0010 → 0011 → 0003)';
  end if;
end $$;

insert into public.case_answers (case_id, stage, answer_index, answer_indexes, analysis_ko, analysis_en) values
${answerRows}
on conflict (case_id) do update
  set stage          = excluded.stage,
      answer_index   = excluded.answer_index,
      answer_indexes = excluded.answer_indexes,
      analysis_ko    = excluded.analysis_ko,
      analysis_en    = excluded.analysis_en;

-- 사건 목록에 없는 옛 정답 행 정리 — src/js/dev/cases-content.js 의 사건 목록이 정본이다.
-- upsert 는 사라진 사건을 지우지 않으므로, 사건 id 를 바꾸거나 사건을 교체하면 유령 행이 남는다
-- (2026-08-05 실측: case_answers 15행이어야 하는데 18행이었다). 배열 비교라 safeupdate 제약도 통과한다.
delete from public.case_answers
 where case_id <> all (array[${CASES.map((c) => q(c.id)).join(', ')}]);
`
writeFileSync(join(outDir, '0003_seed_answers.sql'), answersSql, 'utf8')

console.log(`✔ 0002_seed_teams.sql   — 팀 ${BASE_TEAMS.length}개`)
console.log(`✔ 0003_seed_answers.sql — 정답 ${CASES.length}개 (복수 정답 ${multiCount}개 · 커밋 금지 · 적용 후 삭제)`)
if (multiCount) console.log('  ↳ 복수 정답이 있으므로 0009_multi_answer.sql 을 먼저 적용해야 한다')
