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
export function resolveStep (step, session) {
  if (!FLOW_ORDER.includes(step)) return FLOW.ENTRY
  const registered = isRegistered(session)
  if (step === FLOW.WAITING && !(registered && session.pledgedAt)) {
    return registered ? FLOW.OATH : FLOW.TEAM
  }
  if (step === FLOW.OATH && !registered) return FLOW.TEAM
  return step
}
