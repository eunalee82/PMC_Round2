// 콘텐츠 정합성 검증 — `npm run validate` (Node만 사용, 추가 패키지 없음).
// 무엇을 보는가:
//   1) 사건 데이터: id 유일성, stage/caseNo 순번, 보기 개수, 정답 인덱스 범위, 스테이지별 사건 수, 만점 100점
//   2) 다국어(ko/en): en 필드 존재 여부, ko와 보기 개수 일치, 해설 en 존재 여부
//   3) 미디어 경로: evidence의 이미지·오디오가 public/ 에 실제로 있는지 (Vercel/Linux 대소문자 구분)
//   4) UI 문구 키: 코드가 t('키')로 찾는 키가 COPY.ko에 있는지, en 누락 키 목록
// 실패(오류)가 있으면 종료 코드 1. 경고는 0으로 통과시키되 목록을 남긴다.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const pub = join(root, 'public')

// localStorage가 없는 Node에서 lib/i18n.js가 안전하게 동작하도록 최소 스텁을 둔다.
globalThis.localStorage = { getItem: () => null, setItem: () => {} }

const { CASES } = await import('../src/js/data/cases.js')
const { SOLUTIONS } = await import('../src/js/dev/solutions.js') // 정답은 DEV 전용 모듈
const { COPY } = await import('../src/js/constants/copy.js')
const { STAGE_TOTALS, STAGE_POINTS, SCORE_MAX } = await import('../src/js/lib/progress.js')

const errors = []
const warnings = []
const fail = (msg) => errors.push(msg)
const warn = (msg) => warnings.push(msg)

// ── 1) 사건 데이터 ──────────────────────────────────────────────
const ids = new Set()
const byStage = { 1: [], 2: [], 3: [] }

for (const c of CASES) {
  const at = `${c.id || '(id 없음)'} (Stage ${c.stage} · ${c.fileNo})`
  if (!c.id) fail(`${at}: id가 없다`)
  if (ids.has(c.id)) fail(`${at}: id 중복 — 제출/점수 키가 겹친다`)
  ids.add(c.id)
  if (![1, 2, 3].includes(c.stage)) fail(`${at}: stage가 1~3이 아니다`)
  else byStage[c.stage].push(c)
  if (!c.title || !c.brief || !c.prompt) fail(`${at}: title/brief/prompt 중 빈 필드가 있다`)
  if (!Array.isArray(c.choices) || c.choices.length < 2) fail(`${at}: 보기(choices)가 2개 미만이다`)

  const sol = SOLUTIONS[c.id]
  if (!sol) { fail(`${at}: SOLUTIONS에 정답이 없다`); continue }
  if (!Number.isInteger(sol.answerIndex)) fail(`${at}: answerIndex가 정수가 아니다`)
  else if (sol.answerIndex < 0 || sol.answerIndex >= c.choices.length) {
    fail(`${at}: answerIndex ${sol.answerIndex}가 보기 범위(0~${c.choices.length - 1})를 벗어난다`)
  }
  if (!sol.analysis) fail(`${at}: 해설(analysis)이 없다`)

  // ── 2) 다국어 ──
  if (!c.en) warn(`${at}: en 번역이 없다 (ko로 폴백)`)
  else {
    for (const key of ['title', 'brief', 'prompt']) {
      if (!c.en[key]) warn(`${at}: en.${key} 누락`)
    }
    if (!Array.isArray(c.en.choices)) warn(`${at}: en.choices 누락`)
    else if (c.en.choices.length !== c.choices.length) {
      fail(`${at}: en 보기 수(${c.en.choices.length}) ≠ ko 보기 수(${c.choices.length}) — 정답 인덱스가 어긋난다`)
    }
    // 보기 형태(문자열 / {label,desc})가 ko·en에서 같아야 화면이 같은 모양으로 그려진다.
    if (Array.isArray(c.en.choices)) {
      c.choices.forEach((ko, i) => {
        const en = c.en.choices[i]
        if (typeof ko !== typeof en) fail(`${at}: 보기 ${i + 1}의 ko/en 형식이 다르다`)
      })
    }
  }
  if (sol && !(sol.en && sol.en.analysis)) warn(`${at}: 해설 en 번역이 없다 (ko로 폴백)`)

  // ── 3) 미디어 경로 ──
  const evidences = [c.evidence, c.en && c.en.evidence].filter(Boolean)
  for (const ev of evidences) {
    for (const im of ev.images || []) {
      if (!im.src) { fail(`${at}: 단서 이미지 src가 비어 있다`); continue }
      if (!existsSync(join(pub, im.src))) fail(`${at}: 이미지 파일 없음 — public${im.src}`)
    }
    for (const au of ev.audios || []) {
      if (!au.src) { fail(`${at}: 단서 오디오 src가 비어 있다`); continue }
      if (!existsSync(join(pub, au.src))) fail(`${at}: 오디오 파일 없음 — public${au.src}`)
    }
  }
}

for (const s of [1, 2, 3]) {
  const cases = byStage[s]
  if (cases.length !== STAGE_TOTALS[s]) {
    warn(`Stage ${s}: 제작된 사건 ${cases.length}개 (계획 ${STAGE_TOTALS[s]}개)`)
  }
  const nos = cases.map((c) => c.caseNo).sort((a, b) => a - b)
  nos.forEach((n, i) => {
    if (n !== i + 1) fail(`Stage ${s}: caseNo가 1..${cases.length} 연속이 아니다 (${nos.join(',')})`)
  })
  const placeholders = cases.filter((c) => c.placeholder).length
  if (placeholders) warn(`Stage ${s}: 임시(placeholder) 사건 ${placeholders}/${cases.length}개 — 확정 콘텐츠로 교체 대상`)
}

// ── 3b) 배점 — 제작된 사건으로 실제 만점이 100점인지 (constants/scoring.js와 서버 배점이 어긋나면 랭킹이 깨진다)
const builtMax = [1, 2, 3].reduce((sum, s) => sum + byStage[s].length * STAGE_POINTS[s], 0)
if (builtMax !== SCORE_MAX) {
  fail(`배점 불일치: 제작된 사건 기준 만점 ${builtMax}점 ≠ 설계 만점 ${SCORE_MAX}점 ` +
    `(Stage별 ${[1, 2, 3].map((s) => `${byStage[s].length}×${STAGE_POINTS[s]}`).join(' + ')})`)
}

// SOLUTIONS에만 남은 고아 정답(사건 교체 후 잔재) 탐지
for (const id of Object.keys(SOLUTIONS)) {
  if (!ids.has(id)) warn(`SOLUTIONS['${id}']: 대응하는 사건이 없다 (잔재)`)
}

// ── 4) UI 문구 키 ──────────────────────────────────────────────
function walk (dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (name.endsWith('.js')) out.push(p)
  }
  return out
}
const sources = walk(join(root, 'src'))
const allSource = sources.map((f) => readFileSync(f, 'utf8')).join('\n')
const used = new Set()
// t('key') · copyEl(tag, attrs, 'key') · bindCopy(node, 'key') · 메타의 xxxKey: 'key'
const patterns = [
  /\bt\(\s*'([^']+)'\s*\)/g,
  /\bcopyEl\([^)]*?,\s*'([^']+)'\s*\)/g,
  /\bbindCopy\([^)]*?,\s*'([^']+)'\s*\)/g,
  /\b\w*Key:\s*'([^']+)'/g
]
for (const file of sources) {
  const src = readFileSync(file, 'utf8')
  for (const re of patterns) {
    for (const m of src.matchAll(re)) used.add(m[1])
  }
}
const ko = COPY.ko
const en = COPY.en
for (const key of [...used].sort()) {
  if (!(key in ko)) fail(`문구 키 '${key}'가 COPY.ko에 없다 — 화면에 빈 문자열이 출력된다`)
  else if (!(key in en)) warn(`문구 키 '${key}': en 번역 없음 (ko로 폴백)`)
}
// 미사용 키 — 위 패턴으로 못 잡는 동적 참조(예: MISSIONS의 key: '...', t(item.nextKey) 폴백)가 있으므로,
// 소스 어디에도 문자열 자체가 나타나지 않는 키만 미사용으로 본다(오탐 방지).
const unusedKo = Object.keys(ko).filter((k) => !used.has(k) && !allSource.includes(`'${k}'`))
if (unusedKo.length) warn(`COPY.ko에 있으나 코드에서 참조되지 않는 키 ${unusedKo.length}개: ${unusedKo.join(', ')}`)
const koOnly = Object.keys(ko).filter((k) => !(k in en))
if (koOnly.length) warn(`en 미번역 키 ${koOnly.length}개 (ko 폴백): ${koOnly.join(', ')}`)

// ── 결과 ───────────────────────────────────────────────────────
const summary = `사건 ${CASES.length}개 · Stage 1/2/3 = ${byStage[1].length}/${byStage[2].length}/${byStage[3].length} · 문구 키 ${used.size}개 검사`
console.log(`\n[validate] ${summary}`)
if (warnings.length) {
  console.log(`\n⚠ 경고 ${warnings.length}`)
  warnings.forEach((w) => console.log(`  · ${w}`))
}
if (errors.length) {
  console.log(`\n✖ 오류 ${errors.length}`)
  errors.forEach((e) => console.log(`  · ${e}`))
  process.exit(1)
}
console.log('\n✔ 오류 없음\n')
