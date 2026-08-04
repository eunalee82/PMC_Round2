// Participant entry flow — step machine (game-flow.md §2, screen-list.md SCR-001~005).
// Entry → Opening → Team → Oath → Waiting. Gameplay (Stage 1+) is out of scope here.

export const FLOW = {
  ENTRY: 'entry',
  OPENING: 'opening',
  TEAM: 'team',
  OATH: 'oath',
  WAITING: 'waiting',
  // 게임플레이 — 참가자 선형 흐름(FLOW_ORDER) 밖에 둔다. DEV 점프/이후 Stage 진행 연결용.
  CASE: 'case'
}

export const FLOW_ORDER = [FLOW.ENTRY, FLOW.OPENING, FLOW.TEAM, FLOW.OATH, FLOW.WAITING]

export const FLOW_LABELS = {
  [FLOW.ENTRY]: 'Entry Gate',
  [FLOW.OPENING]: 'Opening',
  [FLOW.TEAM]: 'Team Selection',
  [FLOW.OATH]: 'Oath',
  [FLOW.WAITING]: 'Waiting Room',
  [FLOW.CASE]: 'Case · Stage 1'
}

// 입장 성립 조건 — 팀 선택 + 수사관 3명 등록 (팀별 비번 폐지, SCR-003).
export const REQUIRED_MEMBERS = 3

export function isRegistered (session) {
  return !!session.teamId && Array.isArray(session.memberEmails) && session.memberEmails.length === REQUIRED_MEMBERS
}

// Access control (screen-list.md §9): don't let a resumed/deep-linked step outrun its prerequisites.
// Returns the highest step actually reachable for the given session.
// FLOW.CASE는 FLOW_ORDER 밖이지만 재진입 대상이다 — 사건 화면에서 새로고침하면 사건 화면으로
// 복구되어야 한다(CLAUDE.md §2). 선행 조건(등록·서약·게임 시작)이 깨졌으면 알맞은 이전 화면으로 돌린다.
// gameStarted는 flow.js가 lib/game.js에서 읽어 넘긴다(constants는 상태 모듈을 import하지 않는다).
export function resolveStep (step, session, { gameStarted = false } = {}) {
  const registered = isRegistered(session)
  if (step === FLOW.CASE) {
    if (!registered) return FLOW.TEAM
    if (!session.pledgedAt) return FLOW.OATH
    return gameStarted ? FLOW.CASE : FLOW.WAITING // 관리자가 대기로 되돌렸으면 대기실로
  }
  if (!FLOW_ORDER.includes(step)) return FLOW.ENTRY
  if (step === FLOW.WAITING && !(registered && session.pledgedAt)) {
    return registered ? FLOW.OATH : FLOW.TEAM
  }
  if (step === FLOW.OATH && !registered) return FLOW.TEAM
  return step
}
