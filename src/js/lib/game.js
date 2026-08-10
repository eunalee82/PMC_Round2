// 게임 상태 — 백엔드 라우터. 화면·라우터는 이 파일만 import 한다(계약 유지).
//   VITE_BACKEND=supabase(기본) → game-server.js (Supabase RPC + Realtime + 5초 폴링)
//   VITE_BACKEND=mock 또는 env 없음 → game-mock.js (localStorage, 행사 당일 비상 경로)
// see docs/supabase-minimum-design.md §10
import { isServerMode } from './supabase.js'
import * as mock from './game-mock.js'
import * as server from './game-server.js'

const impl = isServerMode() ? server : mock

// ── 동기 조회 ──
export function getStatus () { return impl.getStatus() }
export function getStartedAt () { return impl.getStartedAt() }
export function isStarted () { return impl.isStarted() }
export function isEnded () { return impl.isEnded ? impl.isEnded() : false }
// 제한 시간 경과(타임오버). status='ended' 와 원인은 다르지만 참가자 화면에서는 같게 다룬다.
export function isTimeUp () { return impl.isTimeUp ? impl.isTimeUp() : false }
export function remainingSeconds () { return impl.remainingSeconds() }
export function subscribe (fn) { return impl.subscribe(fn) }

// ── 연결 상태 — 서버 모드만 실제 값을 갖는다. mock 은 항상 'local'(오프라인 진행) ──
export function getConnection () { return impl.getConnection ? impl.getConnection() : 'local' }
export function subscribeConnection (fn) {
  return impl.subscribeConnection ? impl.subscribeConnection(fn) : () => {}
}

// ── 부팅 (서버 모드에서만 실제 작업이 있다) ──
export async function initGame () {
  if (impl.initGame) return impl.initGame()
  return null
}
export function teardownGame () { if (impl.teardownGame) impl.teardownGame() }

// ── 관리자 액션 — 서버 모드에서는 로그인한 관리자만 성공한다('forbidden') ──
export async function startGame (durationMinutes = null) { return impl.startGame(durationMinutes) }
export async function endGame () { return impl.endGame ? impl.endGame() : null }
export async function resetGame (wipeProgress = false) { return impl.resetGame(wipeProgress) }
