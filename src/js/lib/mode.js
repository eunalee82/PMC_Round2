// 플레이 모드 — 'solo'(공개 연습 · 기본) | 'event'(행사 팀 대항).
//
// 왜 두 개인가 (운영 결정 2026-08-19): 상시 공개 URL 로 들어온 누구나 팀 없이 바로 사건을 풀 수
// 있어야 한다. 그렇다고 행사용 흐름(팀 선택·팀 점유·관리자 Start·서버 랭킹)을 지우면 되돌릴 수
// 없으므로, **기본을 연습 모드로 바꾸고 행사 모드는 플래그로 남긴다.**
//
// 두 모드의 차이(이 파일이 스위치, 판단은 각 모듈이 한다):
//   solo  — 팀 선택(SCR-003)·대기실(SCR-005) 없음 · 진행/점수는 이 기기(localStorage)에만 · 랭킹 없음
//   event — 기존 그대로 (팀 점유 + Supabase 진행/점수/랭킹 + 관리자 시작·종료)
//
// 결정 순서: ?admin → event(저장하지 않음) → ?event / ?solo → 저장 → 저장값 → 기본 solo
// URL 플래그를 저장하는 이유: 참가자가 주소를 다시 치거나 북마크로 들어와도 같은 모드로
// 복귀해야 한다. ?solo 로 언제든 되돌릴 수 있다.
const KEY = 'pmb.mode.v1'

export const MODE = { SOLO: 'solo', EVENT: 'event' }

function readStored () {
  try {
    const v = localStorage.getItem(KEY)
    return v === MODE.EVENT || v === MODE.SOLO ? v : null
  } catch { return null }
}

function store (mode) {
  try { localStorage.setItem(KEY, mode) } catch { /* storage off — 이번 세션만 유지된다 */ }
}

function resolve () {
  // Node 스크립트(scripts/validate.mjs)에서도 이 모듈이 딸려 들어온다 — 화면이 없으면 기본값.
  if (typeof window === 'undefined' || !window.location) return MODE.SOLO
  const params = new URLSearchParams(window.location.search)
  // 관리자 콘솔은 언제나 행사 백엔드(서버 진행·랭킹)를 본다. 참가자 모드를 바꾸지는 않는다.
  if (params.has('admin')) return MODE.EVENT
  if (params.has('event')) { store(MODE.EVENT); return MODE.EVENT }
  if (params.has('solo') || params.has('practice')) { store(MODE.SOLO); return MODE.SOLO }
  return readStored() || MODE.SOLO
}

// 부팅 시 한 번 결정한다 — 실행 중에 모드가 바뀌면 라우터 가드와 백엔드 라우터가 어긋난다.
const mode = resolve()

export function getMode () { return mode }
export function isSoloMode () { return mode === MODE.SOLO }
export function isEventMode () { return mode === MODE.EVENT }
