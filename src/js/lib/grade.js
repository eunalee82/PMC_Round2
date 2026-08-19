// 답안 제출 — 백엔드 라우터. 화면(case.js)은 `submitCase()` 하나만 호출한다.
//
//   서버 모드: submit_answer RPC 가 **한 트랜잭션에서** 채점 + 저장 + 진행 갱신을 하고
//             정답 인덱스·해설을 돌려준다. 클라이언트는 판정하지 않는다 (CLAUDE.md §2 §11).
//   solo 모드: check_answer RPC 가 채점만 한다(서버 저장 없음) → 진행은 progress-mock 에 기록.
//   mock 모드: cases.js 의 SOLUTIONS 로 채점하고 progress-mock 에 기록한다(비상 경로).
//
// 반환: { ok: true, isCorrect, correctIndex, analysis }
//     | { ok: false, reason: 'already_submitted'|'game_ended'|'game_not_started'|'not_owner'|'unknown_case'|'error' }
// see docs/supabase-minimum-design.md §6.1 §9.1
import { isServerMode, rpc } from './supabase.js'
import { isSoloMode } from './mode.js'
import { getLocale } from './i18n.js'
import { getClaimToken } from './entries.js'
import { applySubmit, recordSubmission } from './progress.js'
import { isEnded } from './game.js'

const SERVER_REASONS = ['already_submitted', 'game_ended', 'game_not_started', 'not_owner', 'unknown_case', 'no_backend']

// 복수 정답 사건(사건 #005)은 choiceIndexes(배열)로 온다 — 집합이 정확히 일치해야 정답이다(부분 점수 없음).
const sameSet = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
  const s = new Set(b)
  return a.every((v) => s.has(v))
}

// 공개 연습 모드 채점 — 서버는 **판정만** 하고 아무것도 저장하지 않는다(팀·점유·랭킹이 없다).
// 정답은 여전히 서버에만 있다(CLAUDE.md §11): check_answer 가 정답 인덱스와 해설을 돌려주고,
// 진행/점수는 이 기기(progress-mock, localStorage)에만 쌓인다. see 0015_practice_mode.sql
async function submitPractice ({ teamId, caseId, stage, choiceIndex, choiceIndexes }) {
  try {
    const args = {
      p_case_id: caseId,
      p_choice_index: choiceIndexes ? null : choiceIndex,
      p_locale: getLocale()
    }
    // 0009 와 같은 이유로 복수 정답 사건일 때만 넣는다(함수 시그니처 모호성 방지).
    if (choiceIndexes) args.p_choice_indexes = choiceIndexes
    const data = await rpc('check_answer', args)
    const isCorrect = !!data.is_correct
    recordSubmission(teamId, caseId, data.stage || stage, isCorrect)
    return {
      ok: true,
      isCorrect,
      correctIndex: data.correct_index,
      correctIndexes: data.correct_indexes || null,
      analysis: data.analysis || ''
    }
  } catch (err) {
    const reason = SERVER_REASONS.includes(err.code) ? err.code : 'error'
    console.warn('[grade] 연습 모드 채점 실패', caseId, reason, err)
    return { ok: false, reason }
  }
}

export async function submitCase ({ teamId, caseId, stage, choiceIndex, choiceIndexes = null }) {
  if (!isServerMode()) {
    // ── mock 채점 (비상 경로) ──
    // 정답은 DEV 전용 모듈에만 있고, 이 분기는 프로덕션 빌드에서 통째로 제거된다
    // (import.meta.env.DEV → false 로 치환 → 동적 import 도 번들에서 빠진다).
    // 따라서 비상용 mock 실행은 **개발 모드(npm run dev)** 로 해야 채점이 동작한다.
    if (!import.meta.env.DEV) return { ok: false, reason: 'no_backend' }
    const { SOLUTIONS, localizeAnalysis } = await import('../dev/solutions.js')
    const sol = SOLUTIONS[caseId]
    if (!sol) return { ok: false, reason: 'unknown_case' }
    const isMulti = Array.isArray(sol.answerIndexes)
    const isCorrect = isMulti ? sameSet(choiceIndexes, sol.answerIndexes) : choiceIndex === sol.answerIndex
    recordSubmission(teamId, caseId, stage, isCorrect)
    return {
      ok: true,
      isCorrect,
      correctIndex: isMulti ? undefined : sol.answerIndex,
      correctIndexes: isMulti ? sol.answerIndexes : undefined,
      analysis: localizeAnalysis(sol)
    }
  }

  if (isSoloMode()) return submitPractice({ teamId, caseId, stage, choiceIndex, choiceIndexes })

  const token = getClaimToken(teamId)
  if (!token) return { ok: false, reason: 'not_owner' }

  try {
    // p_choice_indexes 는 **복수 정답 사건일 때만** 넣는다. 항상 보내면 0009 미적용 서버에서
    // PostgREST 가 함수 시그니처를 못 찾아 단일 선택 사건의 제출까지 전부 실패한다.
    const args = {
      p_team_id: teamId,
      p_token: token,
      p_case_id: caseId,
      p_stage: stage,
      p_choice_index: choiceIndexes ? null : choiceIndex,
      p_locale: getLocale()
    }
    if (choiceIndexes) args.p_choice_indexes = choiceIndexes
    const data = await rpc('submit_answer', args)
    applySubmit(caseId, data.stage || stage, data) // 서버 응답으로 캐시 확정
    return {
      ok: true,
      isCorrect: !!data.is_correct,
      correctIndex: data.correct_index,
      correctIndexes: data.correct_indexes || null,
      analysis: data.analysis || ''
    }
  } catch (err) {
    let reason = SERVER_REASONS.includes(err.code) ? err.code : 'error'
    // 서버가 종료를 '미시작'으로 보고하는 구버전(0007 미적용) 대비 — 클라이언트가 아는 상태로 바로잡는다.
    if (reason === 'game_not_started' && isEnded()) reason = 'game_ended'
    console.warn('[grade] 제출 실패', caseId, reason, err)
    return { ok: false, reason }
  }
}
