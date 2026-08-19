// Participant flow — step machine (game-flow.md §2, screen-list.md SCR-001~023).
// 입장 흐름: Entry → Opening → Team → Oath → Waiting (FLOW_ORDER).
// 게임플레이: Case(Stage 1~3) → Appoint → Raid → Ending → Ranking (FLOW_ORDER 밖, 진행 상태로 가드).

export const FLOW = {
  ENTRY: 'entry',
  OPENING: 'opening',
  TEAM: 'team',
  OATH: 'oath',
  WAITING: 'waiting',
  // 게임플레이 — 참가자 선형 흐름(FLOW_ORDER) 밖에 둔다. 진입 자격은 서버(지금은 MOCK progress)가 정한다.
  CASE: 'case',
  APPOINT: 'appoint', // SCR-015 감독관 임명
  RAID: 'raid', // SCR-016 긴급 경보 → SCR-017 준비 → SCR-018 레이드 → SCR-019 격퇴
  ENDING: 'ending' // SCR-020 금배지 수여(정식 임명) → SCR-023 종료 안내 = 참가자 흐름의 끝
  // ※ 최종 랭킹(SCR-022)은 참가자 흐름에 없다 — 감독관(운영진)이 관리자 콘솔(?admin)에서 발표한다.
}

export const FLOW_ORDER = [FLOW.ENTRY, FLOW.OPENING, FLOW.TEAM, FLOW.OATH, FLOW.WAITING]
// 공개 연습 모드(solo)의 입장 흐름 — 팀 선택(SCR-003)·대기실(SCR-005)이 없다.
// 서약에 이름만 적으면 곧장 사건으로 간다 (운영 결정 2026-08-19, see lib/mode.js).
export const SOLO_ORDER = [FLOW.ENTRY, FLOW.OPENING, FLOW.OATH]
// 종반부 순서 — Stage 3까지 마친 팀만 진입하고, 앞 단계를 건너뛸 수 없다(§3.2 순차 진행).
export const FINALE_ORDER = [FLOW.APPOINT, FLOW.RAID, FLOW.ENDING]

export const FLOW_LABELS = {
  [FLOW.ENTRY]: 'Entry Gate',
  [FLOW.OPENING]: 'Opening',
  [FLOW.TEAM]: 'Team Selection',
  [FLOW.OATH]: 'Oath',
  [FLOW.WAITING]: 'Waiting Room',
  [FLOW.CASE]: 'Case · Stage',
  [FLOW.APPOINT]: 'Officer Appointment',
  [FLOW.RAID]: 'Final Raid',
  [FLOW.ENDING]: 'Badge · Finish'
}

// 입장 성립 조건 — 팀 선택 + 수사관 3명 등록 (팀별 비번 폐지, SCR-003).
export const REQUIRED_MEMBERS = 3

export function isRegistered (session) {
  return !!session.teamId && Array.isArray(session.memberEmails) && session.memberEmails.length === REQUIRED_MEMBERS
}

// Access control (screen-list.md §9): don't let a resumed/deep-linked step outrun its prerequisites.
// Returns the highest step actually reachable for the given session.
// 게임플레이 단계(CASE·종반부)는 FLOW_ORDER 밖이지만 재진입 대상이다 — 사건/레이드 화면에서 새로고침하면
// 그 자리로 복구되어야 한다(CLAUDE.md §2). 선행 조건이 깨졌으면 알맞은 이전 화면으로 되돌린다.
// facts는 flow.js가 상태 모듈(lib/game.js·lib/progress.js)에서 읽어 넘긴다
// (constants는 상태 모듈을 import하지 않는다).
//   gameStarted    — 관리자가 게임을 시작했는가
//   stagesCleared  — Stage 1~3 모든 사건을 제출했는가 (종반부 진입 조건, game-flow.md §11.1)
//   finale         — { appointedAt, raidEndedAt } 종반부 저장 지점
//   solo           — 공개 연습 모드인가 (팀·대기실 없는 흐름, lib/mode.js)
export function resolveStep (step, session, facts = {}) {
  const { gameStarted = false, gameEnded = false, stagesCleared = false, finale = {}, solo = false } = facts
  if (solo) return resolveStepSolo(step, session, facts)
  const registered = isRegistered(session)
  const isGameplay = step === FLOW.CASE || FINALE_ORDER.includes(step)

  // 게임 종료 후에는 서약을 마친 참가자를 마지막 화면(종료 안내)으로 고정한다 — 새로고침해도
  // 사건/레이드로 돌아가지 않는다(운영 요청 2026-08-07). ENDING 화면이 완주 여부에 따라
  // 금배지 수여 또는 종료 안내를 고른다. 입장·서약 전(pledgedAt 없음)이면 평소 흐름을 따른다.
  if (gameEnded && registered && session.pledgedAt && (isGameplay || step === FLOW.WAITING)) {
    return FLOW.ENDING
  }

  if (isGameplay) {
    if (!registered) return FLOW.TEAM
    if (!session.pledgedAt) return FLOW.OATH
    if (!gameStarted) return FLOW.WAITING // 관리자가 대기로 되돌렸으면 대기실로
    if (step === FLOW.CASE) return FLOW.CASE
    if (!stagesCleared) return FLOW.CASE // 아직 사건이 남았으면 종반부 진입 불가
    if (step === FLOW.APPOINT) return FLOW.APPOINT
    if (!finale.appointedAt) return FLOW.APPOINT // 임명 전에는 레이드/금배지 불가
    if (step === FLOW.RAID) return FLOW.RAID
    if (!finale.raidEndedAt) return FLOW.RAID // 레이드 완료 전에는 금배지 수여 불가
    return step // ENDING
  }

  if (!FLOW_ORDER.includes(step)) return FLOW.ENTRY
  if (step === FLOW.WAITING && !(registered && session.pledgedAt)) {
    return registered ? FLOW.OATH : FLOW.TEAM
  }
  if (step === FLOW.OATH && !registered) return FLOW.TEAM
  return step
}

// 공개 연습 모드의 가드 — 입장 자격은 "서약을 마쳤는가" 하나뿐이다(팀 등록·관리자 Start 없음).
// 종반부 순서(임명 → 레이드 → 금배지)는 행사 모드와 같은 기준으로 지킨다 — 앞 단계를 건너뛰면
// 연출이 통째로 사라져 무슨 일이 일어났는지 알 수 없다.
function resolveStepSolo (step, session, facts) {
  const { stagesCleared = false, finale = {} } = facts
  const pledged = !!session.pledgedAt

  // 이 모드에 없는 화면(팀 선택·대기실)으로의 요청 — 저장된 옛 세션이나 직접 URL 접근 — 은
  // 대응 지점으로 접는다(막다른 화면에 갇히지 않게).
  if (step === FLOW.TEAM || step === FLOW.WAITING) return pledged ? FLOW.CASE : FLOW.OATH

  if (step === FLOW.CASE || FINALE_ORDER.includes(step)) {
    if (!pledged) return FLOW.OATH
    if (step === FLOW.CASE) return FLOW.CASE
    if (!stagesCleared) return FLOW.CASE // 아직 사건이 남았으면 종반부 진입 불가
    if (step === FLOW.APPOINT) return FLOW.APPOINT
    if (!finale.appointedAt) return FLOW.APPOINT
    if (step === FLOW.RAID) return FLOW.RAID
    if (!finale.raidEndedAt) return FLOW.RAID
    return step // ENDING
  }

  if (!SOLO_ORDER.includes(step)) return FLOW.ENTRY
  return step
}
