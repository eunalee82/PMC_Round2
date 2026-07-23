// SCR-002 Opening Video — plays the world-intro. Native muted autoplay (attributes set explicitly),
// a click-to-play overlay shown until playback starts, and a text-briefing fallback on real errors.
// see docs/screen-list.md SCR-002, docs/game-flow.md §6.2 / §19.2.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { t, copyEl, bindCopy } from '../../lib/copy.js'
import { createButton } from '../../../components/primitives/button.js'

export function createOpeningScreen (ctx) {
  // Build the video with explicit attributes so muted autoplay is honored across browsers.
  const video = el('video', { class: 'opening__video' })
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.preload = 'auto'
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('autoplay', '')
  video.src = ASSETS.videos.opening

  const stage = el('div', { class: 'opening__stage' }, [video])

  let destroyed = false
  let fallbackShown = false
  function toTeam () { if (!destroyed) ctx.goTo(FLOW.TEAM) }

  const playOverlay = el('button', { class: 'opening__play', type: 'button', 'aria-label': '영상 재생' }, [icon('play', { size: 40 })])
  const showOverlay = () => playOverlay.classList.remove('is-hidden')
  const hideOverlay = () => playOverlay.classList.add('is-hidden')

  function userPlay () {
    video.muted = ctx.audio.muted
    if (!video.muted) ctx.audio.unlock()
    const p = video.play()
    if (p && typeof p.catch === 'function') p.catch(() => showOverlay())
  }
  playOverlay.addEventListener('click', userPlay)

  const playPause = el('button', { class: 'ghost-chip', type: 'button', 'aria-label': '재생/일시정지' }, [icon('pause', { size: 18 })])
  playPause.addEventListener('click', () => { if (video.paused) video.play().catch(() => {}); else video.pause() })

  const muteBtn = el('button', { class: 'ghost-chip', type: 'button', 'aria-label': '음소거' }, [icon(video.muted ? 'volumeOff' : 'volume', { size: 18 })])
  muteBtn.addEventListener('click', () => {
    video.muted = !video.muted
    ctx.audio.unlock()
    ctx.audio.setMuted(video.muted)
    ctx.update({ muted: video.muted })
    muteBtn.replaceChildren(icon(video.muted ? 'volumeOff' : 'volume', { size: 18 }))
  })

  const skipBtn = createButton({ label: t('opening.skip'), variant: 'ghost', size: 'sm', icon: 'skipForward', onClick: toTeam })
  bindCopy(skipBtn.el.querySelector('.btn__label'), 'opening.skip')

  const controls = el('div', { class: 'opening__controls' }, [playPause, muteBtn, el('div', { class: 'opening__spacer' }), skipBtn.el])

  function showFallback () {
    if (destroyed || fallbackShown) return
    fallbackShown = true
    hideOverlay()
    controls.style.display = 'none'

    const proceed = createButton({ label: t('opening.fallbackProceed'), variant: 'primary', icon: 'logIn', onClick: toTeam })
    bindCopy(proceed.el.querySelector('.btn__label'), 'opening.fallbackProceed')
    const retry = createButton({
      label: t('opening.fallbackRetry'), variant: 'secondary', icon: 'refresh',
      onClick: () => { fallbackShown = false; controls.style.display = ''; stage.replaceChildren(video); video.currentTime = 0; userPlay() }
    })
    bindCopy(retry.el.querySelector('.btn__label'), 'opening.fallbackRetry')

    stage.replaceChildren(el('div', { class: 'opening__fallback' }, [
      copyEl('span', { class: 'stamp' }, 'opening.briefingStamp'),
      el('div', { class: 'opening__briefing' }, [
        copyEl('p', {}, 'opening.briefing1'),
        copyEl('p', {}, 'opening.briefing2'),
        copyEl('p', {}, 'opening.briefing3')
      ]),
      el('div', { class: 'opening__fallback-cta' }, [retry.el, proceed.el])
    ]))
  }

  video.addEventListener('playing', () => { hideOverlay(); playPause.replaceChildren(icon('pause', { size: 18 })) })
  video.addEventListener('pause', () => { if (!video.ended) { showOverlay(); playPause.replaceChildren(icon('play', { size: 18 })) } })
  video.addEventListener('ended', toTeam)
  video.addEventListener('error', showFallback)

  const node = el('div', { class: 'screen screen--opening' }, [stage, playOverlay, controls])

  return {
    el: node,
    mounted () {
      const p = video.play()
      if (p && typeof p.catch === 'function') p.catch(() => showOverlay()) // autoplay blocked → show play button
    },
    destroy () {
      destroyed = true
      video.pause()
      video.removeAttribute('src')
      video.load()
      skipBtn.destroy()
    }
  }
}
