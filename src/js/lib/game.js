// Game state (단일 상태 로우) — MOCK, localStorage 기반. 저장 형태: { status, startedAt }.
// 관리자 Start/Reset을 흉내낸다: entries.js와 동일하게 storage 이벤트로 다른 탭(=다른 기기 대역)과
// 동기화하고, 같은 탭에서도 emit으로 즉시 반영한다. 대기실(SCR-005)이 구독해 'started'가 되면
// Stage 1로 자동 전환한다 (CLAUDE.md §8). startedAt = 관리자 시작 시각(ms) → 미션 타이머 기준.
// 서버 연결 시(Step 3): 이 모듈 내부를 game 테이블 + Realtime 구독으로 교체 (CLAUDE.md §10, docs/game-flow.md §4).
// status enum(참고): scheduled | pledge_open | waiting_room | started | final_raid | ended

const KEY = 'pmb.game.v2' // v2 — 저장 형태를 문자열 → { status, startedAt } 객체로 변경
const SCHEDULED = 'scheduled'
const STARTED = 'started'
const DURATION_MS = 60 * 60 * 1000 // 게임 제한시간 60분 — 서버 연동 시 관리자 설정값으로 교체

function read () {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    if (v && typeof v === 'object') return { status: v.status || SCHEDULED, startedAt: v.startedAt || null }
  } catch { /* ignore */ }
  return { status: SCHEDULED, startedAt: null }
}

let state = read()
const listeners = new Set()
function emit () { listeners.forEach((fn) => fn(state.status)) }

function persist () {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage off — run in-memory */ }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = read()
    emit()
  })
}

export function getStatus () { state = read(); return state.status }
export function getStartedAt () { state = read(); return state.startedAt }
export function isStarted () { return getStatus() === STARTED }
export function subscribe (fn) { listeners.add(fn); return () => listeners.delete(fn) }

// 미션 타이머용 — 게임 종료까지 남은 초. 시작 전이면 전체 제한시간을 돌려준다.
export function remainingSeconds () {
  const startedAt = getStartedAt()
  if (!startedAt) return Math.floor(DURATION_MS / 1000)
  return Math.max(0, Math.round((startedAt + DURATION_MS - Date.now()) / 1000))
}

// 미션 타이머 기준 시각 보장 — 문제 입장 시점에 아직 시작 안 됐으면 지금부터 흐르게 한다.
// (관리자 Start로 이미 startedAt이 있으면 그 값을 유지 = 게임 시작 = 문제 입장 시점)
export function ensureStarted () {
  state = read()
  if (!state.startedAt) { state = { status: STARTED, startedAt: Date.now() }; persist() }
  return state.startedAt
}

// 관리자 액션 (MOCK). 서버 연결 시 관리자 전용 RPC로 교체 (권한 확인은 서버, CLAUDE.md §11).
export function startGame () { state = { status: STARTED, startedAt: Date.now() }; persist() }
export function resetGame () { state = { status: SCHEDULED, startedAt: null }; persist() }
