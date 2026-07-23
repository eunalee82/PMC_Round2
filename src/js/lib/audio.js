// AudioManager — single owner of BGM playback, mute, and browser autoplay policy.
// Audio only starts after unlock() (called on a user gesture). Mute state is persisted by the flow.
// see CLAUDE.md §13, game-flow.md §6.2 / §22.

export function createAudioManager ({ muted = false } = {}) {
  const bgm = new Audio()
  bgm.loop = true
  bgm.preload = 'auto'
  bgm.muted = muted

  let isMuted = muted
  let unlocked = false
  let desiredSrc = null

  function tryPlay () {
    if (!desiredSrc || !unlocked) return
    if (!bgm.src.endsWith(desiredSrc)) bgm.src = desiredSrc
    bgm.muted = isMuted
    // Play may still reject on strict policies — fail silently, game continues.
    const p = bgm.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
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
