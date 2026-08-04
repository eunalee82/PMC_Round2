// SCR-002 Opening — 세계관 인트로. 로컬 영상 재생 이슈로 YouTube 임베드로 대체한다.
// 유튜브 임베드는 종료 자동감지(IFrame API)를 붙이지 않고, 시청 후 [팀 선택으로]로 진행한다.
// see docs/screen-list.md SCR-002, docs/game-flow.md §6.2 / §19.2.
import { el } from '../../utils/dom.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { t, bindCopy } from '../../lib/copy.js'
import { createButton } from '../../../components/primitives/button.js'

// 임베드 URL — rel=0(관련영상 최소화), playsinline(모바일 인라인 재생). 소리는 사용자가 재생 시 켜진다.
const EMBED_SRC = `https://www.youtube.com/embed/${ASSETS.videos.openingEmbedId}?rel=0&modestbranding=1&playsinline=1`

export function createOpeningScreen (ctx) {
  let destroyed = false
  function toTeam () { if (!destroyed) ctx.goTo(FLOW.TEAM) }

  const iframe = el('iframe', {
    class: 'opening__video',
    src: EMBED_SRC,
    title: 'PM보호국 오프닝',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
    referrerpolicy: 'strict-origin-when-cross-origin'
  })
  iframe.setAttribute('allowfullscreen', '')
  iframe.setAttribute('frameborder', '0')

  const stage = el('div', { class: 'opening__stage' }, [
    el('div', { class: 'opening__yt' }, [iframe])
  ])

  const skipBtn = createButton({ label: t('opening.skip'), variant: 'ghost', size: 'sm', icon: 'skipForward', onClick: toTeam })
  bindCopy(skipBtn.el.querySelector('.btn__label'), 'opening.skip')
  const proceed = createButton({ label: t('opening.fallbackProceed'), variant: 'primary', size: 'sm', icon: 'logIn', onClick: toTeam })
  bindCopy(proceed.el.querySelector('.btn__label'), 'opening.fallbackProceed')

  const controls = el('div', { class: 'opening__controls' }, [
    el('div', { class: 'opening__spacer' }),
    skipBtn.el,
    proceed.el
  ])

  const node = el('div', { class: 'screen screen--opening' }, [stage, controls])

  return {
    el: node,
    destroy () {
      destroyed = true
      iframe.removeAttribute('src') // 재생 중지
      skipBtn.destroy()
      proceed.destroy()
    }
  }
}
