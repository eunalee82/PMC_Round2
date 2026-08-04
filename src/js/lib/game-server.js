// 게임 상태 — 서버(Supabase) 구현. games 단일 로우를 읽고 Realtime 으로 변경을 받는다.
// 설계: docs/supabase-minimum-design.md §8(Realtime+폴링) §9(서버 시간)
//
//  · 부팅 시 game_state() 1회 → Realtime 을 기다리지 않고 즉시 정확한 상태를 얻는다.
//  · Realtime(games) 구독 성공 → 폴링 중지 / 실패·타임아웃·끊김 → 5초 폴링으로 내려간다(양방향).
//  · 시간은 서버 기준: server_now 로 오프셋을 잡고 ends_at 과 비교한다. 기기 시계가 틀려도 같다.
//  · 게임 시작/종료는 관리자 전용 RPC — 클라이언트가 상태를 직접 만들지 않는다(서버 권위).
import { supabase, rpc } from './supabase.js'

const POLL_MS = 5000
const SUBSCRIBE_TIMEOUT_MS = 5000
// 감시 주기 — Realtime 이 살아 있다고 믿는 동안에도 주기적으로 (a) 소켓 생존을 확인하고
// (b) 서버 상태를 한 번 맞춘다. 구독 상태 콜백이 오지 않는 방식으로 소켓이 죽는 경우가 있어
// (실측: 채널이 제거된 뒤 소켓 disconnect → CLOSED 콜백 없음) 콜백만 믿으면 신호를 영구히 놓친다.
const WATCH_MS = 15000

const state = {
  status: 'scheduled',
  startedAt: null, // ms
  endsAt: null, // ms
  durationMinutes: 60,
  offset: 0, // serverNow - Date.now()
  loaded: false
}

const listeners = new Set()
function emit () { listeners.forEach((fn) => fn(state.status)) }

// ── 연결 상태 — 화면(헤더·대기실·관리자)이 실제 상태를 보여줄 수 있게 노출한다.
//    'connecting' → 첫 조회 중 · 'realtime' → 구독 성공 · 'polling' → 폴백 중 · 'offline' → 조회 실패
const conn = { mode: 'connecting' }
const connListeners = new Set()
function setConn (mode) {
  if (conn.mode === mode) return
  conn.mode = mode
  connListeners.forEach((fn) => fn(mode))
}
export function getConnection () { return conn.mode }
export function subscribeConnection (fn) { connListeners.add(fn); return () => connListeners.delete(fn) }

const toMs = (iso) => (iso ? Date.parse(iso) : null)

function applyState (row, serverNowIso) {
  if (!row) return
  const next = {
    status: row.status || 'scheduled',
    startedAt: toMs(row.started_at),
    endsAt: toMs(row.ends_at),
    durationMinutes: row.duration_minutes || state.durationMinutes
  }
  if (serverNowIso) state.offset = Date.parse(serverNowIso) - Date.now()
  const changed = next.status !== state.status || next.startedAt !== state.startedAt || next.endsAt !== state.endsAt
  Object.assign(state, next, { loaded: true })
  if (changed) emit()
}

// ── 서버 조회 (폴링도 이걸 쓴다) ──
export async function loadGameState () {
  try {
    const data = await rpc('game_state')
    applyState(data, data && data.server_now)
    // REST 조회 성공이 'Realtime 연결'을 뜻하지는 않는다 — realtime 은 SUBSCRIBED 에서만 세운다.
    // (offline 이었다면 통신이 살아난 것이므로 폴링/연결중으로 되돌린다)
    if (conn.mode === 'offline') setConn(pollId ? 'polling' : 'connecting')
    return state
  } catch (err) {
    setConn('offline')
    throw err
  }
}

// ── 5초 폴링 (Realtime 폴백) ──
let pollId = null
function startPolling (reason) {
  if (pollId) return
  console.info('[game] 폴링 시작 (5초) —', reason)
  setConn('polling')
  pollId = setInterval(() => { loadGameState().catch(() => {}) }, POLL_MS)
}
function stopPolling () {
  if (!pollId) return
  clearInterval(pollId)
  pollId = null
  console.info('[game] Realtime 연결 — 폴링 중지')
}

// ── Realtime (games.status 우선 적용) ──
let channel = null
let subscribeTimer = null

function startRealtime () {
  if (!supabase || channel) return
  channel = supabase
    .channel('pmb-game')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, (payload) => {
      applyState(payload.new, null) // 서버시간 오프셋은 폴링/초기 로드에서만 갱신
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        clearTimeout(subscribeTimer)
        stopPolling()
        setConn('realtime')
        loadGameState().catch(() => {}) // 구독 공백 동안의 변경을 메운다
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        startPolling(`구독 상태 ${status}`)
      }
    })
  // 안전망: 5초 안에 SUBSCRIBED 가 오지 않으면 폴링으로 내려간다
  subscribeTimer = setTimeout(() => startPolling('구독 타임아웃'), SUBSCRIBE_TIMEOUT_MS)
}

// 백그라운드 탭에서 타이머가 스로틀되면 폴링도 늦어진다 → 복귀 시 즉시 1회 보정
function onVisible () {
  if (document.visibilityState === 'visible') loadGameState().catch(() => {})
}

// ── 감시 타이머 — Realtime 의 '조용한 죽음'을 잡는 안전망 ──
let watchId = null
function startWatchdog () {
  if (watchId) return
  watchId = setInterval(() => {
    const live = !!(supabase && supabase.realtime && supabase.realtime.isConnected())
    if (!live && conn.mode === 'realtime') {
      startPolling('소켓 끊김 감지(구독 콜백 없음)') // 5초 폴링으로 강등
      return
    }
    // Realtime 이 살아 있어도 주기적으로 서버와 한 번 맞춘다(놓친 변경·오프셋 보정).
    if (conn.mode === 'realtime') loadGameState().catch(() => {})
  }, WATCH_MS)
}
function stopWatchdog () {
  if (!watchId) return
  clearInterval(watchId)
  watchId = null
}

export async function initGame () {
  await loadGameState() // 실패는 호출자(main.js)가 재시도 화면으로 처리
  startRealtime()
  startWatchdog()
  document.addEventListener('visibilitychange', onVisible)
  window.addEventListener('focus', onVisible)
  return state
}

export function teardownGame () {
  setConn('connecting')
  stopWatchdog()
  stopPolling()
  clearTimeout(subscribeTimer)
  if (channel && supabase) { supabase.removeChannel(channel); channel = null }
  document.removeEventListener('visibilitychange', onVisible)
  window.removeEventListener('focus', onVisible)
}

// ── 동기 getter (화면·라우터 가드가 그대로 쓴다) ──
export function getStatus () { return state.status }
export function getStartedAt () { return state.startedAt }
export function isStarted () { return state.status === 'started' }
export function isEnded () { return state.status === 'ended' }
export function subscribe (fn) { listeners.add(fn); return () => listeners.delete(fn) }

// 서버 기준 현재 시각
export function serverNow () { return Date.now() + state.offset }

// 남은 초 — 종료 시각이 정해지기 전에는 전체 제한시간을 보여준다
export function remainingSeconds () {
  if (!state.endsAt) return state.durationMinutes * 60
  return Math.max(0, Math.round((state.endsAt - serverNow()) / 1000))
}

// ── 관리자 액션 (서버에서 is_admin() 검증 · 실패 시 'forbidden') ──
export async function startGame (durationMinutes = null) {
  const data = await rpc('admin_start_game', { p_duration_minutes: durationMinutes })
  applyState(data, data && data.server_now)
  return state
}
export async function endGame () {
  const data = await rpc('admin_end_game')
  applyState(data, data && data.server_now)
  return state
}
export async function resetGame (wipeProgress = false) {
  const data = await rpc('admin_reset_game', { p_wipe_progress: wipeProgress })
  applyState(data, data && data.server_now)
  return state
}
