// SCR-003 Team Selection — pick your squad and authenticate with the team password.
// Clicking a team opens a password prompt; the correct team password confirms selection.
// see docs/screen-list.md SCR-003, docs/game-flow.md §6.3.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { FLOW } from '../../constants/flow.js'
import { getTeams } from '../../lib/teams.js'
import { t, copyEl, bindCopy } from '../../lib/copy.js'
import { createButton } from '../../../components/primitives/button.js'
import { createModal } from '../../../components/primitives/modal.js'

export function createTeamScreen (ctx) {
  let selected = ctx.session.teamId
  let authModal = null

  const startBtn = createButton({
    label: t('team.start'),
    variant: 'primary',
    size: 'lg',
    icon: 'crosshair',
    disabled: !selected,
    onClick: () => {
      if (!selected) return
      ctx.update({ teamId: selected })
      ctx.goTo(FLOW.OATH)
    }
  })
  bindCopy(startBtn.el.querySelector('.btn__label'), 'team.start')

  function markSelected () {
    cards.forEach((c) => c.classList.toggle('is-selected', c.dataset.team === selected))
    startBtn.update({ disabled: !selected })
  }

  function openAuth (team) {
    const input = el('input', { class: 'field', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: '12', placeholder: '팀 비밀번호' })
    const error = el('p', { class: 'auth-error', text: '' })

    function submit () {
      if (input.value === team.pass) {
        selected = team.id
        markSelected()
        if (authModal) authModal.close()
      } else {
        error.textContent = '비밀번호가 올바르지 않습니다.'
        input.value = ''
        input.focus()
      }
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } })

    authModal = createModal({
      title: `${team.name} · 팀 인증`,
      size: 'sm',
      content: [
        el('p', { class: 'auth-hint', text: '팀 비밀번호를 입력하면 입장할 수 있습니다.' }),
        input,
        error
      ],
      actions: [
        { label: '취소', variant: 'ghost' },
        { label: '입장', variant: 'primary', close: false, onClick: submit }
      ]
    })
    authModal.open()
    setTimeout(() => input.focus(), 60)
  }

  const cards = getTeams().map((team) => {
    const card = el('button', {
      class: selected === team.id ? 'team-card is-selected' : 'team-card',
      type: 'button',
      dataset: { team: team.id }
    }, [
      el('span', { class: 'team-card__color', style: { background: team.color } }),
      el('div', { class: 'team-card__body' }, [
        el('span', { class: 'team-card__name', text: team.name }),
        el('span', { class: 'team-card__members' }, [icon('users', { size: 14 }), el('span', { text: `수사관 ${team.members}명` })])
      ]),
      el('span', { class: 'team-card__lock' }, [icon('lock', { size: 15 })]),
      el('span', { class: 'team-card__check' }, [icon('check', { size: 16 })])
    ])
    card.addEventListener('click', () => openAuth(team))
    return card
  })

  const node = el('div', { class: 'screen screen--form' }, [
    el('div', { class: 'form-screen__inner' }, [
      el('header', { class: 'form-screen__head' }, [
        copyEl('span', { class: 'form-screen__step mono' }, 'team.step'),
        copyEl('h1', { class: 'form-screen__title' }, 'team.title'),
        copyEl('p', { class: 'form-screen__lead' }, 'team.lead')
      ]),
      el('div', { class: 'team-grid' }, cards),
      el('div', { class: 'form-screen__actions' }, [startBtn.el])
    ])
  ])

  return {
    el: node,
    destroy () {
      if (authModal) authModal.destroy()
      startBtn.destroy()
    }
  }
}
