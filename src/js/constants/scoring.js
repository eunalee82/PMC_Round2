// 배점 모델 — 총점 100점의 단일 출처. (확정, 2026-08-05)
//   Stage 1 · Mindset            7점 × 3사건 = 21
//   Stage 2 · Performance Domain 7점 × 7사건 = 49
//   Stage 3 · AI Use Case        6점 × 5사건 = 30
//                                   합계 15사건 = 100점
// 스테이지마다 사건 수가 달라 '사건당 균등 배점'으로는 100점이 맞지 않는다 → 스테이지별 배점을 둔다.
// 이 표를 고치면 사이드바(/100)·Stage Result·관리자 랭킹 표시가 함께 따라온다.
// 서버 배점(supabase/migrations/0008_stage_points.sql 의 submit_answer)과 **반드시 같은 값**을 유지한다 —
// 실제 점수는 서버가 판정하고(CLAUDE.md §2 §11) 클라이언트는 표시만 한다.

// 스테이지별 사건 수 (LayOut 0/3 · 0/7 · 0/5)
export const STAGE_TOTALS = { 1: 3, 2: 7, 3: 5 }

// 스테이지별 사건 1건 배점
export const STAGE_POINTS = { 1: 7, 2: 7, 3: 6 }

// 스테이지 만점 (21 · 49 · 30)
export const STAGE_SCORE_MAX = {
  1: STAGE_POINTS[1] * STAGE_TOTALS[1],
  2: STAGE_POINTS[2] * STAGE_TOTALS[2],
  3: STAGE_POINTS[3] * STAGE_TOTALS[3]
}

// 총점 만점 = 100
export const SCORE_MAX = STAGE_SCORE_MAX[1] + STAGE_SCORE_MAX[2] + STAGE_SCORE_MAX[3]

// 사건 1건 배점 — 알 수 없는 stage 는 0점(점수를 임의로 만들지 않는다).
export function pointsFor (stage) { return STAGE_POINTS[stage] || 0 }
