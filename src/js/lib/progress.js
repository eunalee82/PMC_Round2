// 진행/점수 — 백엔드 라우터. 화면·라우터 가드는 이 파일만 import 한다.
//   solo 모드(공개 연습)         → progress-mock.js  (localStorage — 서버에 아무것도 남기지 않는다)
//   VITE_BACKEND=supabase(기본) → progress-server.js (my_progress · submit_answer · record_milestone)
//   VITE_BACKEND=mock 또는 env 없음 → progress-mock.js (localStorage)
//
// solo 가 mock 을 쓰는 이유(운영 결정 2026-08-19): 연습 플레이는 팀도 점유 토큰도 없어 서버 진행
// 테이블에 기록할 주체가 없다. 진행/점수는 이 기기에만 쌓이고 랭킹에는 나타나지 않는다.
//
// 동기 조회(getProgress/getFinale/getRanking)는 양쪽 모두 유지되므로 화면 코드가 바뀌지 않는다.
// 서버 모드에서는 hydrate()/refreshRanking() 이 캐시를 채우고, 제출은 lib/grade.js submitCase 가 맡는다.
// see docs/supabase-minimum-design.md §10
import { isServerMode } from './supabase.js'
import { isSoloMode } from './mode.js'
import * as mock from './progress-mock.js'
import * as server from './progress-server.js'

const impl = (isServerMode() && !isSoloMode()) ? server : mock

// 배점·사건 수는 백엔드와 무관한 게임 규칙이므로 constants/scoring.js 를 그대로 다시 내보낸다.
export { STAGE_TOTALS, STAGE_POINTS, STAGE_SCORE_MAX, SCORE_MAX, pointsFor } from '../constants/scoring.js'

// ── 동기 조회 ──
export function getProgress (teamId) { return impl.getProgress(teamId) }
export function getFinale (teamId) { return impl.getFinale(teamId) }
export function getRanking () { return impl.getRanking() }

// ── 기록 ──
export function recordSubmission (teamId, caseId, stage, isCorrect) {
  return impl.recordSubmission(teamId, caseId, stage, isCorrect)
}
export async function recordFinale (teamId, patch) { return impl.recordFinale(teamId, patch) }

// ── 서버 캐시 관리 (mock 에서는 no-op) ──
export async function hydrateProgress (teamId, opts) {
  return impl.hydrate ? impl.hydrate(teamId, opts) : null
}
export async function refreshRanking () { return impl.refreshRanking ? impl.refreshRanking() : null }
export function isHydrated (teamId) { return impl.isHydrated ? impl.isHydrated(teamId) : true }
export function applySubmit (caseId, stage, result) {
  return impl.applySubmit ? impl.applySubmit(caseId, stage, result) : null
}
// 진행/점수판 캐시가 갱신되면 알린다(서버 모드만). 화면은 이걸 받아 사이드바를 다시 그린다.
export function subscribeProgress (fn) {
  return impl.subscribeProgress ? impl.subscribeProgress(fn) : () => {}
}

// ── 초기화 (DEV·관리자) ──
export function resetProgress (teamId) { return impl.resetProgress(teamId) }
export function resetAllProgress () { return impl.resetAllProgress() }
