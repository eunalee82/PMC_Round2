// 사건 본문 → 서버 시드 + 클라이언트 매니페스트 생성기 (추가 패키지 없음)
//   · src/js/data/case-manifest.js            ← 비민감 구조 메타 (커밋 O · 번들 포함)
//   · supabase/migrations/0013_seed_cases.sql ← 본문 ko/en (커밋 X · .gitignore · 적용 후 삭제)
//
// 본문 원본(진실의 원천)은 src/js/dev/cases-content.js (DEV 전용, 프로덕션 번들 제외).
// 정답·해설은 여기에 없다 → case_answers(0003_seed_answers.sql) 가 담당한다.
// see docs/handoff.md · docs/supabase-minimum-design.md §1(제외였던 문제 CRUD 는 여전히 안 만든다)
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

// data/cases.js → lib/i18n.js 가 localStorage 를 만지므로 Node 용 스텁을 둔다
globalThis.localStorage = { getItem: () => null, setItem: () => {} }

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const { CASES } = await import('../src/js/dev/cases-content.js')

const q = (s) => `'${String(s).replace(/'/g, "''")}'`           // SQL 문자열 이스케이프
const jb = (obj) => (obj == null ? 'null' : `${q(JSON.stringify(obj))}::jsonb`)

// 본문(민감) — 로케일별로 서버가 고른다. evidence(이미지/오디오 경로)는 그대로 유지한다.
const pickKo = (c) => ({ title: c.title, brief: c.brief, prompt: c.prompt, evidence: c.evidence, choices: c.choices })
const pickEn = (c) => (c.en ? { title: c.en.title, brief: c.en.brief, prompt: c.en.prompt, evidence: c.en.evidence, choices: c.en.choices } : null)

// ── 클라이언트 매니페스트 (구조만 · 번들 포함 · 비민감) ──
const manifestRows = CASES.map((c) =>
  `  { id: '${c.id}', stage: ${c.stage}, caseNo: ${c.caseNo}, fileNo: '${c.fileNo}', ` +
  `choiceCount: ${c.choices.length}, multi: ${!!c.multi}, selectCount: ${c.selectCount || 1} }`
).join(',\n')

const manifest = `// AUTO-GENERATED — scripts/export-cases.mjs. 손으로 편집하지 말 것 (본문을 고치면 재생성).
// 비민감 구조 메타만 담는다: 정답·본문·선택지 텍스트가 없다(브라우저 유출 방지).
//   · 본문(제목·brief·prompt·evidence·choices) = 서버 public.cases + get_cases RPC (로케일 반영)
//   · 정답·해설 = 서버 public.case_answers + submit_answer RPC
// 이 배열이 data/cases.js 에서 CASES 로 재노출되어 stage-progress·progress-mock 이 그대로 쓴다.
export const CASE_MANIFEST = [
${manifestRows}
]
`
writeFileSync(join(root, 'src/js/data/case-manifest.js'), manifest, 'utf8')

// ── 서버 본문 시드 ──
const seedRows = CASES.map((c) =>
  `  (${q(c.id)}, ${c.stage}, ${c.caseNo}, ${q(c.fileNo)}, ${c.choices.length}, ${!!c.multi}, ${c.selectCount || 1}, ${jb(pickKo(c))}, ${jb(pickEn(c))})`
).join(',\n')

const seed = `-- 0013_seed_cases.sql — 사건 본문 시드 (생성: scripts/export-cases.mjs)
-- ⚠️ 커밋 금지(.gitignore 등록). 적용 후 이 파일을 삭제한다. 본문 원본은 src/js/dev/cases-content.js.
-- ⚠️ public.cases 테이블은 0012_cases_content.sql 이 만든다 — 0012 를 먼저 적용해야 이 시드가 돈다.
-- 정답·해설은 여기 없다 → case_answers(0003_seed_answers.sql) 가 담당.

insert into public.cases (case_id, stage, case_no, file_no, choice_count, multi, select_count, content_ko, content_en) values
${seedRows}
on conflict (case_id) do update
  set stage        = excluded.stage,
      case_no      = excluded.case_no,
      file_no      = excluded.file_no,
      choice_count = excluded.choice_count,
      multi        = excluded.multi,
      select_count = excluded.select_count,
      content_ko   = excluded.content_ko,
      content_en   = excluded.content_en;

-- 사건 목록에 없는 옛 본문 정리 (cases.js/dev 가 정본 · 유령 행 방지, 0003 과 같은 패턴)
delete from public.cases where case_id <> all (array[${CASES.map((c) => q(c.id)).join(', ')}]);
`
writeFileSync(join(root, 'supabase/migrations/0013_seed_cases.sql'), seed, 'utf8')

console.log(`✔ src/js/data/case-manifest.js       — 구조 메타 ${CASES.length}건 (커밋 O)`)
console.log(`✔ supabase/migrations/0013_seed_cases.sql — 본문 ${CASES.length}건 (커밋 금지 · 적용 후 삭제)`)
