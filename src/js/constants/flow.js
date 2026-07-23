// Participant entry flow — step machine (game-flow.md §2, screen-list.md SCR-001~005).
// Entry → Opening → Team → Oath → Waiting. Gameplay (Stage 1+) is out of scope here.

export const FLOW = {
  ENTRY: 'entry',
  OPENING: 'opening',
  TEAM: 'team',
  OATH: 'oath',
  WAITING: 'waiting'
}

export const FLOW_ORDER = [FLOW.ENTRY, FLOW.OPENING, FLOW.TEAM, FLOW.OATH, FLOW.WAITING]

export const FLOW_LABELS = {
  [FLOW.ENTRY]: 'Entry Gate',
  [FLOW.OPENING]: 'Opening',
  [FLOW.TEAM]: 'Team Selection',
  [FLOW.OATH]: 'Oath',
  [FLOW.WAITING]: 'Waiting Room'
}

// Access control (screen-list.md §9): don't let a resumed/deep-linked step outrun its prerequisites.
// Returns the highest step actually reachable for the given session.
export function resolveStep (step, session) {
  if (!FLOW_ORDER.includes(step)) return FLOW.ENTRY
  if (step === FLOW.WAITING && !(session.teamId && session.pledgedAt)) {
    return session.teamId ? FLOW.OATH : FLOW.TEAM
  }
  if (step === FLOW.OATH && !session.teamId) return FLOW.TEAM
  return step
}
