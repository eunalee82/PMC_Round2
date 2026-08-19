// 플레이어 식별 — "이 진행 기록은 누구 것인가"의 단일 출처.
//
// event 모드: 팀(teams.js)이 주체다 → session.teamId · 팀명.
// solo  모드: 팀이 없다 → 고정 키(SOLO_PLAYER_ID)로 이 기기의 진행을 저장하고, 화면에는 서약에
//             적은 성명을 쓴다. 진행/점수 API(progress·stage-progress)는 그대로 teamId 자리에
//             이 키를 받으므로 게임플레이 코드는 두 모드에서 같은 모양으로 돈다.
import { isSoloMode } from './mode.js'
import { findTeam } from './teams.js'
import { t } from './copy.js'

export const SOLO_PLAYER_ID = 'solo'

// 진행/점수 저장 키. 화면은 ctx.session.teamId 를 그대로 써도 되지만(flow.js 가 solo 에서 이 값을
// 채워 둔다), 세션 없이 판정해야 하는 곳은 이 함수를 쓴다.
export function playerId (session = {}) {
  return isSoloMode() ? SOLO_PLAYER_ID : (session.teamId || null)
}

// 화면에 보이는 이름. solo 는 서약 서명, event 는 팀명.
export function playerName (session = {}) {
  if (isSoloMode()) {
    const signed = (session.signerName || '').trim()
    return signed || t('agent.rankRookie')
  }
  const team = findTeam(session.teamId)
  return team ? team.name : 'UNASSIGNED'
}
