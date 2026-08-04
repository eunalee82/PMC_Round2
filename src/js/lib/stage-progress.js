// 스테이지 진행 판정 — "이 팀이 Stage N을 마쳤는가"의 단일 출처.
// 라우터 가드(constants/flow.js를 호출하는 flow.js)와 게임플레이 컨트롤러(screens/gameplay/case.js)가
// 같은 기준을 써야 "다 풀었는데 잠김" / "안 풀었는데 종반부 진입" 같은 불일치가 생기지 않는다.
// 판정 기준(운영정책 §8.3): 스테이지의 '제작된 모든 사건'을 제출하면 완료(점수 무관).
// 서버 연결 시(Step 3): 제출 목록을 서버에서 받아온 progress 캐시로 읽게 되므로 이 모듈은 그대로 쓴다.
import { CASES } from '../data/cases.js'
import { getProgress, STAGE_TOTALS } from './progress.js'

export const STAGES = [1, 2, 3]

// 스테이지의 사건 목록 — 화면 순서(caseNo) 기준.
export function stageCases (stage) {
  return CASES.filter((c) => c.stage === stage).sort((a, b) => a.caseNo - b.caseNo)
}

// 실제로 제작된 사건 수. Stage 점수의 max는 계획값(STAGE_TOTALS = 15문항)을 보여주되,
// 완료·아이템 해제 판정은 이 값을 쓴다.
export function builtTotal (stage) {
  return stageCases(stage).length || STAGE_TOTALS[stage]
}

export function submittedCount (teamId, stage, progress) {
  const p = progress || getProgress(teamId)
  return stageCases(stage).filter((c) => p.submitted.includes(c.id)).length
}

export function isStageComplete (teamId, stage, progress) {
  const cases = stageCases(stage)
  return cases.length > 0 && submittedCount(teamId, stage, progress) >= cases.length
}

// 종반부(감독관 임명 → Final Raid → 엔딩) 진입 조건 — 세 스테이지 모두 완료.
export function allStagesCleared (teamId) {
  const p = getProgress(teamId)
  return STAGES.every((s) => isStageComplete(teamId, s, p))
}

export function firstIncompleteStage (teamId) {
  const p = getProgress(teamId)
  for (const s of STAGES) if (!isStageComplete(teamId, s, p)) return s
  return 3
}
