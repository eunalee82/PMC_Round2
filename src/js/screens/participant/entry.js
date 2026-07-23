// SCR-001 Entry Gate — first contact. Sets the tone and enters the bureau.
// see docs/screen-list.md SCR-001, docs/game-flow.md §6.1.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { t, copyEl, bindCopy } from '../../lib/copy.js'
import { createButton } from '../../../components/primitives/button.js'

function toggleFullscreen () {
  if (!document.fullscreenElement) {
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {})
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

export function createEntryScreen (ctx) {
  let muted = ctx.session.muted

  const enterBtn = createButton({
    label: t('entry.enter'),
    variant: 'primary',
    size: 'lg',
    icon: 'logIn',
    onClick: () => {
      ctx.audio.unlock() // user gesture — unlock audio for later screens
      ctx.goTo(FLOW.OPENING)
    }
  })
  bindCopy(enterBtn.el.querySelector('.btn__label'), 'entry.enter')

  const audioBtn = el('button', { class: 'ghost-chip', type: 'button', 'aria-label': '음향 켜기 또는 음소거' }, [
    icon(muted ? 'volumeOff' : 'volume', { size: 18 }),
    el('span', { text: muted ? '음소거' : '음향' })
  ])
  audioBtn.addEventListener('click', () => {
    muted = !muted
    ctx.audio.unlock()
    ctx.audio.setMuted(muted)
    ctx.update({ muted })
    audioBtn.replaceChildren(icon(muted ? 'volumeOff' : 'volume', { size: 18 }), el('span', { text: muted ? '음소거' : '음향' }))
  })

  const fsBtn = el('button', { class: 'ghost-chip', type: 'button', 'aria-label': '전체 화면 전환' }, [
    icon('maximize', { size: 18 }),
    el('span', { text: '전체 화면' })
  ])
  fsBtn.addEventListener('click', toggleFullscreen)

  const node = el('div', { class: 'screen screen--entry' }, [
    el('div', { class: 'entry__topbar' }, [
      copyEl('span', { class: 'entry__brandline mono' }, 'entry.brandline'),
      el('div', { class: 'entry__controls' }, [audioBtn, fsBtn])
    ]),
    el('div', { class: 'entry__hero' }, [
      el('div', { class: 'entry__badge' }, [
        el('img', { src: ASSETS.logos.badgeGold, alt: 'PM보호국 배지', class: 'entry__badge-img' })
      ]),
      copyEl('span', { class: 'entry__eyebrow mono' }, 'entry.eyebrow'),
      copyEl('h1', { class: 'entry__title' }, 'entry.title'),
      copyEl('p', { class: 'entry__subtitle' }, 'entry.subtitle'),
      el('div', { class: 'entry__alert' }, [
        icon('alert', { size: 16 }),
        copyEl('span', {}, 'entry.alert')
      ]),
      el('div', { class: 'entry__cta' }, [enterBtn.el])
    ]),
    copyEl('span', { class: 'entry__foot mono' }, 'entry.foot')
  ])

  return { el: node, destroy () { enterBtn.destroy() } }
}
