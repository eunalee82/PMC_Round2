// SCR-001 Entry Gate — first contact. Sets the tone and enters the bureau.
// see docs/screen-list.md SCR-001, docs/game-flow.md §6.1.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { t, copyEl, bindCopy } from '../../lib/copy.js'
import { getLocale, setLocale } from '../../lib/i18n.js'
import { isSoloMode } from '../../lib/mode.js'
import { createButton } from '../../../components/primitives/button.js'
import { createSoundTest } from '../../../components/shell/sound-test.js'

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

  // [이어서 계속하기] — 사건 화면에서 [처음으로]로 나왔다 돌아온 경우. 진행은 로컬에 남아 있으므로
  // 오프닝·서약을 다시 거치지 않고 그 자리로 복귀한다(연습 모드 자유 이동, 2026-08-19).
  // 가드가 최종 판정하므로 저장된 지점이 더 이상 유효하지 않으면 알맞은 화면으로 되돌려 준다.
  const resumeStep = isSoloMode() && ctx.session.pledgedAt ? ctx.session.resumeStep : null
  const resumeBtn = resumeStep
    ? createButton({
      label: t('entry.resume'),
      variant: 'gold',
      size: 'lg',
      icon: 'crosshair',
      onClick: () => {
        ctx.audio.unlock()
        ctx.goTo(resumeStep)
      }
    })
    : null
  if (resumeBtn) bindCopy(resumeBtn.el.querySelector('.btn__label'), 'entry.resume')

  const audioBtn = el('button', { class: 'ghost-chip', type: 'button', 'aria-label': '음향 켜기 또는 음소거' }, [
    icon(muted ? 'volumeOff' : 'volume', { size: 18 }),
    el('span', { text: muted ? t('entry.muted') : t('entry.sound') })
  ])
  function paintAudioBtn () {
    audioBtn.replaceChildren(icon(muted ? 'volumeOff' : 'volume', { size: 18 }), el('span', { text: muted ? t('entry.muted') : t('entry.sound') }))
  }
  function setSessionMuted (value) {
    if (muted === value) return
    muted = value
    ctx.audio.setMuted(muted)
    ctx.update({ muted })
    paintAudioBtn()
  }
  audioBtn.addEventListener('click', () => {
    ctx.audio.unlock()
    setSessionMuted(!muted)
  })

  // 음향 점검 — 사건 단서에 녹취가 있어, 소리가 나오는지 입장 전에 확인할 수 있어야 한다.
  // 테스트를 누르면 음소거 상태를 자동으로 풀고 칩 표시도 함께 되돌린다(참가자가 이유 모를 무음을 겪지 않게).
  const soundTest = createSoundTest({ audio: ctx.audio, onUnmute: () => setSessionMuted(false) })

  const fsBtn = el('button', { class: 'ghost-chip', type: 'button', 'aria-label': '전체 화면 전환' }, [
    icon('maximize', { size: 18 }),
    el('span', { text: t('entry.fullscreen') })
  ])
  fsBtn.addEventListener('click', toggleFullscreen)

  // 언어 선택(국문/영문) — 팀별로 첫 화면에서 한 번 선택. 저장 후 재렌더(선택 언어로 전체 진행).
  const locale = getLocale()
  const langOpt = (code, label) => {
    const b = el('button', {
      class: code === locale ? 'lang-select__opt is-active' : 'lang-select__opt',
      type: 'button', 'aria-pressed': code === locale ? 'true' : 'false'
    }, [label])
    b.addEventListener('click', () => { if (code !== getLocale()) setLocale(code, { reload: true }) })
    return b
  }
  const langSelect = el('div', { class: 'lang-select' }, [
    el('span', { class: 'lang-select__label mono caps', text: '언어 · Language' }),
    el('div', { class: 'lang-select__opts' }, [langOpt('ko', '한국어'), langOpt('en', 'English')])
  ])

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
      langSelect,
      soundTest.el,
      el('div', { class: 'entry__cta' }, [resumeBtn ? resumeBtn.el : null, enterBtn.el])
    ]),
    copyEl('span', { class: 'entry__foot mono' }, 'entry.foot')
  ])

  return {
    el: node,
    destroy () {
      soundTest.destroy()
      enterBtn.destroy()
      if (resumeBtn) resumeBtn.destroy()
    }
  }
}
