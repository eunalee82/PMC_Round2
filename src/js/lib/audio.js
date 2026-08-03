// AudioManager — single owner of BGM playback, mute, and browser autoplay policy.
// Audio starts on unlock() (an explicit user gesture) OR, if playback is blocked
// (dev-jump / refresh-resume straight into Oath/Waiting with no prior gesture this
// session), it re-arms on the next interaction so BGM is never silently lost.
// see CLAUDE.md §2 (resumable), §13, game-flow.md §6.2 / §22.

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

  return {
    unlock () { unlocked = true; tryPlay() },
    setMuted (value) { isMuted = value; bgm.muted = value; if (!value) tryPlay() },
    playBgm (src) { desiredSrc = src; tryPlay() },
    stopBgm () { desiredSrc = null; bgm.pause(); try { bgm.currentTime = 0 } catch {} },
    get muted () { return isMuted },
    get unlocked () { return unlocked }
  }
}
