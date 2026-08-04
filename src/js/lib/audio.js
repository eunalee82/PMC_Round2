// AudioManager — single owner of BGM playback, mute, and browser autoplay policy.
// Audio starts on unlock() (an explicit user gesture) OR, if playback is blocked
// (dev-jump / refresh-resume straight into Oath/Waiting with no prior gesture this
// session), it re-arms on the next interaction so BGM is never silently lost.
// see CLAUDE.md §2 (resumable), §13, game-flow.md §6.2 / §22.
import { getAudioSettings } from './audio-settings.js'

export function createAudioManager ({ muted = false } = {}) {
  const bgm = new Audio()
  bgm.loop = true
  bgm.preload = 'auto'
  bgm.muted = muted

  let isMuted = muted
  let unlocked = false
  let desiredSrc = null
  let armed = false

  // Arm a one-shot gesture listener that retries playback on the next interaction.
  // Standard "unlock audio on first user gesture" fallback for browser autoplay policy.
  function armGesture () {
    if (armed) return
    armed = true
    const resume = () => {
      document.removeEventListener('pointerdown', resume)
      document.removeEventListener('keydown', resume)
      armed = false
      unlocked = true
      tryPlay()
    }
    document.addEventListener('pointerdown', resume)
    document.addEventListener('keydown', resume)
  }

  function tryPlay () {
    if (!desiredSrc) return
    if (!bgm.src.endsWith(desiredSrc)) bgm.src = desiredSrc
    bgm.muted = isMuted
    // Let the browser decide — succeed silently, or arm a gesture retry on rejection.
    const p = bgm.play()
    if (p && typeof p.catch === 'function') {
      p.then(() => { unlocked = true }).catch(() => armGesture())
    } else {
      unlocked = true
    }
  }

  // 단발 효과음(Stage 통과 · 수여식 등) — BGM과 별개 채널이라 BGM을 끊지 않는다.
  // 세션 음소거(entry의 음향 토글)와 헤더 소리 설정(볼륨/음소거) 둘 다 존중한다.
  // 재생 실패(자동재생 정책·파일 없음)는 조용히 무시한다 — 연출 실패가 진행을 막지 않는다 (CLAUDE.md §13).
  const sfxPool = []
  function playSfx (src, { volume = 1 } = {}) {
    if (!src || isMuted) return null
    const settings = getAudioSettings()
    if (settings.muted) return null
    try {
      const sfx = new Audio(src)
      sfx.volume = Math.max(0, Math.min(1, settings.volume * volume))
      sfxPool.push(sfx)
      sfx.addEventListener('ended', () => {
        const i = sfxPool.indexOf(sfx)
        if (i >= 0) sfxPool.splice(i, 1)
      })
      const p = sfx.play()
      if (p && typeof p.catch === 'function') p.catch(() => {})
      return sfx
    } catch { return null }
  }

  return {
    unlock () { unlocked = true; tryPlay() },
    setMuted (value) { isMuted = value; bgm.muted = value; if (!value) tryPlay() },
    playBgm (src) { desiredSrc = src; tryPlay() },
    stopBgm () { desiredSrc = null; bgm.pause(); try { bgm.currentTime = 0 } catch {} },
    playSfx,
    stopSfx () { sfxPool.splice(0).forEach((s) => { try { s.pause() } catch {} }) },
    get muted () { return isMuted },
    get unlocked () { return unlocked }
  }
}
