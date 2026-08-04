// MOCK 채점 — 서버(채점 RPC/Edge Function)로 이관 예정 (CLAUDE.md §10 §11, docs/game-flow.md §7.3).
// 지금은 정답 판정을 클라이언트에서 하지만, View는 절대 스스로 정답을 확정하지 않는다:
// 반드시 이 함수의 반환값으로만 결과를 표시한다(단방향 흐름 유지, CLAUDE.md §7).
// 해설은 현재 로케일에 맞춰 반환한다(en 없으면 ko 폴백). 서버 연결 시 내부만 supabase.rpc로 교체.
import { SOLUTIONS, localizeAnalysis } from '../data/cases.js'

// gradeCase(caseId, choiceIndex) -> { ok, isCorrect, correctIndex, analysis }
export function gradeCase (caseId, choiceIndex) {
  const sol = SOLUTIONS[caseId]
  if (!sol) return { ok: false, isCorrect: false, correctIndex: -1, analysis: '' }
  return {
    ok: true,
    isCorrect: choiceIndex === sol.answerIndex,
    correctIndex: sol.answerIndex,
    analysis: localizeAnalysis(sol)
  }
}
