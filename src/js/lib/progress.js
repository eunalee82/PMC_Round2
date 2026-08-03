// 팀별 진행 상황 — MOCK, localStorage. 사건 해결 수 · Investigation Score · Stage별 정답 수 · 마지막 제출 시각.
// 서버 연결 시(Step 3): 제출·채점·점수·시각은 서버가 판정·저장(권위) → 이 모듈은 그 결과 캐시로 바뀐다
// (CLAUDE.md §8 저장 시점, §10 서버 권위, §11 중복 방지). 지금은 lib/grade.js(MOCK) 결과를 여기 기록.
import { getTeams } from './teams.js'

const KEY = 'pmb.progress.v1'
export const POINTS_PER_CASE = 20 // 20점 × 15사건 = 300점 만점 (LeftSidebar 기준)
export const STAGE_TOTALS = { 1: 3, 2: 7, 3: 5 } // 스테이지별 사건 수 (LayOut 0/3·0/7·0/5)

function readAll () {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : {} } catch { return {} }
}
function writeAll (all) { try { localStorage.setItem(KEY, JSON.stringify(all)) } catch { /* storage off */ } }
// stage = 스테이지별 '정답' 수 (점수용), submittedStage = 스테이지별 '제출' 수 (EVIDENCE 해제용).
function blank () {
  return { solved: [], score: 0, stage: { 1: 0, 2: 0, 3: 0 }, submitted: [], submittedStage: { 1: 0, 2: 0, 3: 0 }, lastSubmitAt: null }
}
function keyOf (teamId) { return teamId || 'preview' }

export function getProgress (teamId) {
  const p = readAll()[keyOf(teamId)]
  if (!p) return blank()
  return {
    solved: [...(p.solved || [])],
    score: p.score || 0,
    stage: { 1: 0, 2: 0, 3: 0, ...(p.stage || {}) },
    submitted: [...(p.submitted || [])],
    submittedStage: { 1: 0, 2: 0, 3: 0, ...(p.submittedStage || {}) },
    lastSubmitAt: p.lastSubmitAt || null
  }
}

// 사건 제출 기록 — 마지막 제출 시각(종료 시간 판정·랭킹 동점 처리용)을 남기고,
// 정답이면 점수·정답 수를 가산한다. 이미 푼 사건은 재가산하지 않는다 (중복 방지, CLAUDE.md §8).
export function recordSubmission (teamId, caseId, stage, isCorrect) {
  const all = readAll()
  const k = keyOf(teamId)
  const p = all[k] || blank()
  if (!p.submitted) p.submitted = []
  if (!p.submittedStage) p.submittedStage = { 1: 0, 2: 0, 3: 0 }
  p.lastSubmitAt = Date.now()
  // 제출 집계 (정답/오답 무관) — EVIDENCE 해제 판정용. 사건은 1회만 제출되므로 caseId로 중복 방지.
  if (!p.submitted.includes(caseId)) {
    p.submitted.push(caseId)
    p.submittedStage[stage] = (p.submittedStage[stage] || 0) + 1
  }
  // 정답 집계 — 점수/정답 수
  if (isCorrect && !p.solved.includes(caseId)) {
    p.solved.push(caseId)
    p.score += POINTS_PER_CASE
    p.stage[stage] = (p.stage[stage] || 0) + 1
  }
  all[k] = p
  writeAll(all)
  return getProgress(teamId)
}

// 랭킹 — 점수 내림차순, 동점이면 마지막 제출 시각이 빠른 순(먼저 끝낸 팀이 상위).
// 미제출(시각 없음)은 동점 그룹에서 최하위. 서버 연동 시 rankings 뷰로 교체.
export function getRanking () {
  const all = readAll()
  const rows = getTeams().map((team) => {
    const p = all[team.id]
    return {
      teamId: team.id,
      name: team.name,
      score: p ? (p.score || 0) : 0,
      lastSubmitAt: p ? (p.lastSubmitAt || null) : null
    }
  })
  rows.sort((a, b) => (b.score - a.score) || ((a.lastSubmitAt ?? Infinity) - (b.lastSubmitAt ?? Infinity)))
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

export function resetProgress (teamId) {
  const all = readAll()
  delete all[keyOf(teamId)]
  writeAll(all)
}
export function resetAllProgress () { writeAll({}) }
