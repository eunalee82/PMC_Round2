// 진행/점수 — 서버(Supabase) 구현. 설계: docs/supabase-minimum-design.md §6.1 §10
//
// 구조: **서버가 권위, 이 모듈은 캐시**다.
//   · hydrate(teamId)  → my_progress RPC 로 캐시를 채운다(부팅·사건 화면 진입 시)
//   · applySubmit(...)  → submit_answer 응답으로 캐시를 갱신한다(제출 직후)
//   · recordFinale(...) → record_milestone RPC (종반부 저장 지점)
//   · getProgress/getFinale/getRanking 은 **동기**로 캐시를 읽는다 → 화면 계약 유지
//
// 점수·정답 판정은 절대 여기서 하지 않는다. 서버 응답만 반영한다(CLAUDE.md §2 §7).
import { supabase, rpc } from './supabase.js'
import { getClaimToken } from './entries.js'
import { STAGE_TOTALS } from '../constants/scoring.js'

// 배점 표시는 constants/scoring.js, 실제 배점 판정은 서버 submit_answer 가 한다(둘은 같은 값을 유지).
export { STAGE_TOTALS }

function blankFinale () {
  return { appointedAt: null, raidStartedAt: null, raidEndedAt: null, raidHits: 0, raidDamage: 0, badgeAt: null, endedAt: null }
}
function blank () {
  return {
    solved: [], score: 0, stage: { 1: 0, 2: 0, 3: 0 },
    submitted: [], submittedStage: { 1: 0, 2: 0, 3: 0 },
    lastSubmitAt: null, finale: blankFinale()
  }
}

let cache = blank()
let hydratedFor = null // 캐시가 어느 팀 것인지
let ranking = [] // scoreboard 뷰 캐시

const listeners = new Set()
function emit () { listeners.forEach((fn) => fn(cache)) }
export function subscribeProgress (fn) { listeners.add(fn); return () => listeners.delete(fn) }

// ── 서버 → 캐시 ───────────────────────────────────────────────
function fromServer (d) {
  return {
    solved: Array.isArray(d.solved) ? d.solved : [],
    score: d.score || 0,
    stage: { 1: (d.stage && d.stage['1']) || 0, 2: (d.stage && d.stage['2']) || 0, 3: (d.stage && d.stage['3']) || 0 },
    submitted: Array.isArray(d.submitted) ? d.submitted : [],
    submittedStage: {
      1: (d.submittedStage && d.submittedStage['1']) || 0,
      2: (d.submittedStage && d.submittedStage['2']) || 0,
      3: (d.submittedStage && d.submittedStage['3']) || 0
    },
    lastSubmitAt: d.lastSubmitAt ? Date.parse(d.lastSubmitAt) : null,
    finale: {
      appointedAt: d.finale?.appointedAt ? Date.parse(d.finale.appointedAt) : null,
      raidStartedAt: d.finale?.raidStartedAt ? Date.parse(d.finale.raidStartedAt) : null,
      raidEndedAt: d.finale?.raidEndedAt ? Date.parse(d.finale.raidEndedAt) : null,
      raidHits: d.finale?.raidHits || 0,
      raidDamage: d.finale?.raidDamage || 0,
      badgeAt: d.finale?.badgeAt ? Date.parse(d.finale.badgeAt) : null,
      endedAt: d.finale?.endedAt ? Date.parse(d.finale.endedAt) : null
    }
  }
}

// 새로고침·기기 인계 복구의 핵심 — 서버의 마지막 저장 지점으로 캐시를 채운다 (CLAUDE.md §2)
export async function hydrate (teamId, { force = false } = {}) {
  if (!teamId) { cache = blank(); hydratedFor = null; return cache }
  if (!force && hydratedFor === teamId) return cache
  const token = getClaimToken(teamId)
  if (!token) { cache = blank(); hydratedFor = null; return cache } // 점유가 없으면 볼 진행도 없다
  const data = await rpc('my_progress', { p_team_id: teamId, p_token: token })
  cache = fromServer(data)
  hydratedFor = teamId
  emit()
  return cache
}

// 사이드바 랭킹용 점수판 (anon 이 읽을 수 있는 컬럼만: 팀명·점수·정답수·완료시각·타수)
export async function refreshRanking () {
  if (!supabase) return ranking
  const { data, error } = await supabase
    .from('scoreboard')
    .select('team_id,name,score,solved_count,last_submit_at,raid_hits')
  if (error || !data) return ranking
  ranking = data
    .map((r) => ({
      teamId: r.team_id,
      name: r.name,
      score: r.score || 0,
      solved: r.solved_count || 0,
      lastSubmitAt: r.last_submit_at ? Date.parse(r.last_submit_at) : null,
      raidHits: r.raid_hits || 0
    }))
    // 순위 기준은 서버와 같다: 총점 → 정답 수 → 제출 완료 시각 → Raid 기여도 (game-flow.md §15.1)
    .sort((a, b) => (b.score - a.score) || (b.solved - a.solved) ||
      ((a.lastSubmitAt ?? Infinity) - (b.lastSubmitAt ?? Infinity)) || (b.raidHits - a.raidHits))
    .map((r, i) => ({ ...r, rank: i + 1 }))
  emit()
  return ranking
}

// ── 동기 조회 (화면 계약) ─────────────────────────────────────
export function getProgress (teamId) {
  if (teamId && hydratedFor && teamId !== hydratedFor) return blank() // 다른 팀 진행은 알 수 없다
  return cache
}
export function getFinale (teamId) { return getProgress(teamId).finale }
export function getRanking () { return ranking }
export function isHydrated (teamId) { return hydratedFor === teamId }

// ── 제출 (grade.js 의 submitCase 가 호출) ─────────────────────
// 서버 응답으로 캐시를 갱신한다. 정답 여부·점수는 서버 값만 쓴다.
export function applySubmit (caseId, stage, result) {
  if (!cache.submitted.includes(caseId)) {
    cache.submitted = [...cache.submitted, caseId]
    cache.submittedStage = { ...cache.submittedStage, [stage]: (cache.submittedStage[stage] || 0) + 1 }
  }
  if (result.is_correct && !cache.solved.includes(caseId)) {
    cache.solved = [...cache.solved, caseId]
    cache.stage = { ...cache.stage, [stage]: (cache.stage[stage] || 0) + 1 }
  }
  if (typeof result.score === 'number') cache.score = result.score // 서버 총점으로 확정
  cache.lastSubmitAt = Date.now()
  emit()
  refreshRanking().catch(() => {}) // 사이드바 랭킹도 갱신(실패는 무시)
  return cache
}

// mock 과 시그니처를 맞추기 위한 자리 — 서버 모드에서는 submit_answer 가 이미 기록했다.
export function recordSubmission () { return cache }

// ── 종반부 저장 지점 → record_milestone ───────────────────────
// mock 의 recordFinale(teamId, patch) 형태를 유지하고, 내부에서 마일스톤으로 변환한다.
const MILESTONE_OF = {
  appointedAt: 'appointed',
  raidStartedAt: 'raid_started',
  raidEndedAt: 'raid_ended',
  badgeAt: 'badge',
  endedAt: 'finished'
}
export async function recordFinale (teamId, patch = {}) {
  const token = getClaimToken(teamId)
  if (!token) return cache.finale
  const key = Object.keys(patch).find((k) => MILESTONE_OF[k])
  if (!key) return cache.finale
  try {
    const data = await rpc('record_milestone', {
      p_team_id: teamId,
      p_token: token,
      p_milestone: MILESTONE_OF[key],
      p_hits: patch.raidHits ?? null,
      p_damage: patch.raidDamage ?? null
    })
    const f = data.finale || {}
    cache.finale = {
      appointedAt: f.appointedAt ? Date.parse(f.appointedAt) : null,
      raidStartedAt: f.raidStartedAt ? Date.parse(f.raidStartedAt) : null,
      raidEndedAt: f.raidEndedAt ? Date.parse(f.raidEndedAt) : null,
      raidHits: f.raidHits || 0,
      raidDamage: f.raidDamage || 0,
      badgeAt: f.badgeAt ? Date.parse(f.badgeAt) : null,
      endedAt: f.endedAt ? Date.parse(f.endedAt) : null
    }
    emit()
  } catch (err) {
    console.warn('[progress] 종반부 기록 실패', patch, err.code || err)
  }
  return cache.finale
}

// 초기화는 관리자 전용(admin_reset_game) — 클라이언트에서는 캐시만 비운다.
export function resetProgress () { cache = blank(); hydratedFor = null; emit() }
export function resetAllProgress () { resetProgress() }
