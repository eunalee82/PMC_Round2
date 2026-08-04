// 전역 오디오 설정 — 볼륨(0~1) + 음소거. localStorage 지속(§8: 음소거는 게임 내내 유지).
// 듣기평가(녹취) 등 사건 오디오와 헤더 소리 컨트롤이 이 단일 소스를 공유한다.
// 헤더(app-header)의 볼륨 컨트롤이 값을 바꾸면 구독 중인 오디오 요소들이 즉시 반영한다.
const KEY = 'pmb.audio.v1'

function read () {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    if (v && typeof v === 'object') {
      return { muted: !!v.muted, volume: typeof v.volume === 'number' ? Math.max(0, Math.min(1, v.volume)) : 1 }
    }
  } catch { /* ignore */ }
  return { muted: false, volume: 1 }
}

let state = read()
const listeners = new Set()
function emit () { listeners.forEach((fn) => fn(getAudioSettings())) }
function persist () {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* storage off */ }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY) { state = read(); emit() } })
}

export function getAudioSettings () { state = read(); return { ...state } }
export function isMuted () { return getAudioSettings().muted }
export function getVolume () { return getAudioSettings().volume }
export function setMuted (muted) { state = { ...state, muted: !!muted }; persist() }
export function setVolume (volume) { state = { ...state, volume: Math.max(0, Math.min(1, volume)) }; persist() }
export function subscribeAudio (fn) { listeners.add(fn); return () => listeners.delete(fn) }
