// SCR-004 Oath Agreement — sign the confidentiality pledge. BGM loops here (opening.mp3).
// see docs/screen-list.md SCR-004, docs/game-flow.md §6.4.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { findTeam } from '../../lib/teams.js'
import { t, copyEl, bindCopy } from '../../lib/copy.js'
import { createButton } from '../../../components/primitives/button.js'

export function createOathScreen (ctx) {
  const team = findTeam(ctx.session.teamId)
  const agents = ctx.session.memberEmails || []

  const nameInput = el('input', {
    class: 'field', type: 'text', maxlength: '24', autocomplete: 'off', spellcheck: 'false',
    placeholder: '수사관 성명 또는 서명', value: ctx.session.signerName || ''
  })
  const checkbox = el('input', { class: 'checkbox', type: 'checkbox', id: 'oath-agree' })

  const submitBtn = createButton({
    label: t('oath.submit'),
    variant: 'gold',
    size: 'lg',
    icon: 'penLine',
    disabled: true,
    onClick: () => {
      const signerName = nameInput.value.trim()
      if (!signerName || !checkbox.checked) return
      ctx.update({ signerName, pledgedAt: Date.now() })
      ctx.goTo(FLOW.WAITING)
    }
  })
  bindCopy(submitBtn.el.querySelector('.btn__label'), 'oath.submit')

  // 팀을 잘못 골랐을 때 서약 전에 되돌아갈 수 있게 한다(SCR-004 → SCR-003). 점유·등록은 유지된다.
  const backBtn = createButton({
    label: t('oath.back'),
    variant: 'ghost',
    size: 'md',
    block: true,
    onClick: () => ctx.goTo(FLOW.TEAM)
  })
  bindCopy(backBtn.el.querySelector('.btn__label'), 'oath.back')

  function refresh () {
    submitBtn.update({ disabled: !(nameInput.value.trim() && checkbox.checked) })
  }
  nameInput.addEventListener('input', refresh)
  checkbox.addEventListener('change', refresh)

  const node = el('div', { class: 'screen screen--form screen--oath' }, [
    el('div', { class: 'form-screen__inner oath' }, [
      el('div', { class: 'oath__badge' }, [el('img', { src: ASSETS.logos.badgeGold, alt: 'PM보호국 금배지', class: 'oath__badge-img' })]),
      copyEl('span', { class: 'form-screen__step mono' }, 'oath.step'),
      copyEl('h1', { class: 'form-screen__title' }, 'oath.title'),
      team ? el('span', { class: 'oath__team' }, [el('span', { class: 'oath__team-dot', style: { background: team.color, color: team.color } }), el('span', { class: 'oath__team-name', text: team.name })]) : null,
      // 등록한 수사관 3명을 다시 보여준다 — 팀을 잘못 골랐다면 서약 전에 알아차릴 마지막 지점.
      agents.length ? el('div', { class: 'oath__agents' }, [
        copyEl('span', { class: 'oath__agents-label mono caps' }, 'oath.agents'),
        el('div', { class: 'team-roster__chips' }, agents.map((email) => el('span', { class: 'email-chip' }, [
          icon('check', { size: 13 }),
          el('span', { text: email })
        ])))
      ]) : null,
      copyEl('pre', { class: 'oath__text' }, 'oath.text'),
      el('label', { class: 'oath__field' }, [
        copyEl('span', { class: 'oath__field-label caps' }, 'oath.fieldLabel'),
        nameInput
      ]),
      el('label', { class: 'oath__agree', for: 'oath-agree' }, [
        checkbox,
        copyEl('span', {}, 'oath.agree')
      ]),
      el('div', { class: 'form-screen__actions' }, [submitBtn.el, backBtn.el])
    ])
  ])

  return {
    el: node,
    mounted () { ctx.audio.playBgm(ASSETS.bgm.opening) },
    destroy () { submitBtn.destroy(); backBtn.destroy() }
  }
}
