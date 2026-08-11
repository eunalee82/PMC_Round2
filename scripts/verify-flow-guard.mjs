// 참가자 흐름 가드 회귀 검증 — `npm run validate` (Node만 사용, 추가 패키지 없음).
//
// 왜 이 스크립트가 있는가: 운영 문서(docs/operation-checklist.md §8.10)의 재시작 절차가
// resolveStep()의 판정 결과를 **전제로** 쓰여 있다. 예를 들어 "실수로 [게임 종료]를 누른 뒤
// SQL로 status='started'를 되돌리고 참가자가 새로고침하면 원래 사건으로 돌아온다"는 안내는
// 이 함수가 그렇게 판정할 때만 참이다. 가드를 고치면 문서가 조용히 틀려지므로 여기서 고정한다.
//
// resolveStep()은 순수 함수라(상태 모듈을 import 하지 않는다 — CLAUDE.md §7) 브라우저 없이 돌아간다.
// facts는 실제로는 flow.js의 guardFacts()가 읽어 넘긴다:
//   gameStarted   = isStarted()
//   gameEnded     = isEnded() || isTimeUp()   ← 타임오버도 종료로 본다
//   stagesCleared = allStagesCleared(teamId)
//   finale        = getFinale(teamId)
import { FLOW, resolveStep } from '../src/js/constants/flow.js'

// 입장·서약을 마친 정상 세션. 개별 케이스에서 필요한 필드만 덮어쓴다.
const session = (over = {}) => ({
  teamId: 'team07',
  memberEmails: ['a@example.com', 'b@example.com', 'c@example.com'],
  pledgedAt: '2026-08-11T01:00:00Z',
  ...over
})

// [설명, 저장된 step, 세션, facts, 기대 복귀 화면]
const CASES = [
  // ── 정상 진행 중 새로고침 (CLAUDE.md §2 재진입 가능)
  ['사건 화면에서 새로고침 → 제자리',
    FLOW.CASE, session(), { gameStarted: true }, FLOW.CASE],
  ['대기실에서 새로고침 → 제자리',
    FLOW.WAITING, session(), { gameStarted: false }, FLOW.WAITING],

  // ── 게임 종료 후에는 마지막 화면으로 고정한다 (운영 요청 2026-08-07)
  ['종료 후 새로고침 → 종료 안내로 고정',
    FLOW.ENDING, session(), { gameStarted: true, gameEnded: true }, FLOW.ENDING],
  ['종료 후 사건 화면에서 새로고침 → 사건으로 돌아가지 않는다',
    FLOW.CASE, session(), { gameStarted: true, gameEnded: true }, FLOW.ENDING],
  ['타임오버도 종료와 동일하게 다룬다 (gameEnded = isEnded() || isTimeUp())',
    FLOW.CASE, session(), { gameStarted: true, gameEnded: true }, FLOW.ENDING],

  // ── ⭐ 실수로 [게임 종료] → SQL로 status='started' 복구 → 새로고침
  //    운영 문서 §8.10 (5)의 "복귀 지점" 표가 이 4줄이다. 함께 고쳐야 한다.
  ['복구 후: 사건이 남은 팀 → 사건 화면',
    FLOW.ENDING, session(), { gameStarted: true, gameEnded: false, stagesCleared: false }, FLOW.CASE],
  ['복구 후: 15사건 완주 · 임명 전 → 감독관 임명',
    FLOW.ENDING, session(), { gameStarted: true, gameEnded: false, stagesCleared: true, finale: {} }, FLOW.APPOINT],
  ['복구 후: 임명 완료 · 레이드 전 → Final Raid',
    FLOW.ENDING, session(), { gameStarted: true, gameEnded: false, stagesCleared: true, finale: { appointedAt: 1 } }, FLOW.RAID],
  ['복구 후: 레이드까지 완료 → 원래 자리(금배지·종료 안내)',
    FLOW.ENDING, session(), { gameStarted: true, gameEnded: false, stagesCleared: true, finale: { appointedAt: 1, raidEndedAt: 2 } }, FLOW.ENDING],

  // ── 관리자가 대기 상태로 되돌렸을 때 (§8.10 (4))
  ['리셋 후 세션이 남아 있으면 → 대기실',
    FLOW.CASE, session(), { gameStarted: false }, FLOW.WAITING],
  ['리셋 후 로컬이 지워졌으면 → 팀 선택 (flow.js가 clearParticipantState + reload)',
    FLOW.CASE, { teamId: null, memberEmails: [], pledgedAt: null }, { gameStarted: false }, FLOW.TEAM],

  // ── 점유·서약이 깨진 상태로 게임플레이 진입 시도 (§8.10 (3))
  ['팀 점유를 잃으면 → 팀 선택',
    FLOW.CASE, { teamId: null, memberEmails: [] }, { gameStarted: true }, FLOW.TEAM],
  ['인계 직후 서약 전이면 → 서약',
    FLOW.CASE, session({ pledgedAt: null }), { gameStarted: true }, FLOW.OATH],
  ['종반부도 서약을 건너뛸 수 없다',
    FLOW.RAID, session({ pledgedAt: null }), { gameStarted: true, stagesCleared: true }, FLOW.OATH],

  // ── 순차 진행 (docs/game-flow.md §3.2) — URL 직접 접근·이전 상태 잔재 차단
  ['사건이 남았는데 임명으로 건너뛰기 → 사건으로 되돌린다',
    FLOW.APPOINT, session(), { gameStarted: true, stagesCleared: false }, FLOW.CASE],
  ['임명 전에 레이드로 건너뛰기 → 임명으로 되돌린다',
    FLOW.RAID, session(), { gameStarted: true, stagesCleared: true, finale: {} }, FLOW.APPOINT],
  ['레이드 전에 금배지로 건너뛰기 → 레이드로 되돌린다',
    FLOW.ENDING, session(), { gameStarted: true, stagesCleared: true, finale: { appointedAt: 1 } }, FLOW.RAID],
  ['게임 시작 전에는 사건에 접근할 수 없다',
    FLOW.CASE, session(), { gameStarted: false }, FLOW.WAITING],
  ['서약 전에는 대기실에 들어갈 수 없다',
    FLOW.WAITING, session({ pledgedAt: null }), {}, FLOW.OATH],
  ['등록 전에는 서약할 수 없다',
    FLOW.OATH, { teamId: null, memberEmails: [] }, {}, FLOW.TEAM],
  ['알 수 없는 step은 첫 화면으로',
    'nonsense-step', session(), { gameStarted: true }, FLOW.ENTRY]
]

const failures = []
for (const [name, step, sess, facts, expected] of CASES) {
  const got = resolveStep(step, sess, facts)
  if (got !== expected) failures.push(`${name}\n      ${step} → ${got} (기대: ${expected})`)
}

console.log(`\n[verify-flow-guard] resolveStep() 시나리오 ${CASES.length}개 검사`)
if (failures.length) {
  console.log(`\n✖ 오류 ${failures.length}`)
  failures.forEach((f) => console.log(`  · ${f}`))
  console.log('\n가드를 의도적으로 바꿨다면 docs/operation-checklist.md §8.10 의 재시작 절차도 함께 고칠 것.\n')
  process.exit(1)
}
console.log('\n✔ 오류 없음\n')
