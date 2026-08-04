// SCR-003 Team Selection — pick your squad, then register the three agents' emails.
// 팀별 비밀번호는 폐지됐다: 입장 = "팀원 3명 이메일 등록"이고, 그 등록이 팀을 점유한다(팀당 1기기).
// 다른 기기가 같은 팀을 누르면 등록된 이메일 중 하나를 대야 인계받는다 — 배포할 비밀이 없다.
// see docs/screen-list.md SCR-003, docs/game-flow.md §6.3.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { FLOW } from '../../constants/flow.js'
import { getTeams, findTeam } from '../../lib/teams.js'
import {
  getDeviceId, getEntry, teamStatus, claimTeam, transferTeam, subscribe, formatTime, refreshEntries
} from '../../lib/entries.js'
import { checkEmails, normalizeEmail, maskEmail } from '../../utils/email.js'
import { t, copyEl, bindCopy } from '../../lib/copy.js'
import { createButton } from '../../../components/primitives/button.js'
import { createModal } from '../../../components/primitives/modal.js'

const MEMBER_COUNT = 3 // 3명 고정 (운영 확정)
const PLACEHOLDER = 'name@company.com'
// 게임 테스트용 계정 — 이메일 등록 없이 입장하기 위한 더미 수사관 3명 (mocks/teams.js: team-test).
// 가드(constants/flow.js: isRegistered)가 3명을 요구하므로 서약·대기까지 정상 진행되도록 3개를 채운다.
const TEST_EMAILS = ['test1@example.com', 'test2@example.com', 'test3@example.com']

export function createTeamScreen (ctx) {
  const device = getDeviceId()
  let modal = null

  // 세션에 팀이 있어도 점유가 살아있을 때만 선택으로 인정한다(운영진 해제·타 기기 인계 대비).
  let selected = ctx.session.teamId && teamStatus(ctx.session.teamId, device) === 'mine'
    ? ctx.session.teamId
    : null

  const startBtn = createButton({
    label: t('team.start'),
    variant: 'primary',
    size: 'lg',
    icon: 'crosshair',
    disabled: !selected,
    onClick: () => {
      if (!selected) return
      ctx.goTo(FLOW.OATH)
    }
  })
  bindCopy(startBtn.el.querySelector('.btn__label'), 'team.start')

  const editBtn = el('button', { class: 'team-roster__edit', type: 'button' }, [
    icon('penLine', { size: 14 }),
    el('span', { text: t('team.registeredEdit') })
  ])
  editBtn.addEventListener('click', () => {
    const team = findTeam(selected)
    if (team) openRegister(team)
  })

  const grid = el('div', { class: 'team-grid' })
  const roster = el('div', { class: 'team-roster', hidden: true })

  function closeModal () {
    if (!modal) return
    const open = modal
    modal = null
    open.destroy()
  }

  function commit (entry) {
    selected = entry.teamId
    ctx.update({ teamId: entry.teamId, memberEmails: entry.emails, enteredAt: entry.enteredAt })
    closeModal()
    refreshView()
  }

  function refreshView () {
    grid.replaceChildren(...getTeams().map(cardFor))
    renderRoster()
    startBtn.update({ disabled: !selected })
  }

  function renderRoster () {
    const entry = selected ? getEntry(selected) : null
    if (!entry) {
      roster.hidden = true
      roster.replaceChildren()
      return
    }
    roster.hidden = false
    roster.replaceChildren(
      el('span', { class: 'team-roster__label mono caps', text: t('team.registered') }),
      el('div', { class: 'team-roster__chips' }, entry.emails.map((email) => el('span', { class: 'email-chip' }, [
        icon('check', { size: 13 }),
        el('span', { text: email }) // 사용자 입력 — textContent로만 렌더 (CLAUDE.md §11)
      ]))),
      editBtn
    )
  }

  function subLabel (status, entry, team) {
    if (status === 'mine') return `등록 완료 · ${formatTime(entry.enteredAt)}`
    if (status === 'taken') return `입장 완료 · ${formatTime(entry.enteredAt)}`
    return `수사관 ${team.members}명`
  }

  function cardFor (team) {
    const status = teamStatus(team.id, device)
    const entry = getEntry(team.id)
    const card = el('button', {
      class: ['team-card', `is-${status}`, selected === team.id && 'is-selected'].filter(Boolean).join(' '),
      type: 'button',
      dataset: { team: team.id }
    }, [
      el('span', { class: 'team-card__color', style: { background: team.color } }),
      el('div', { class: 'team-card__body' }, [
        el('span', { class: 'team-card__name', text: team.name }),
        el('span', { class: 'team-card__members' }, [
          icon(status === 'open' ? 'users' : 'check', { size: 14 }),
          el('span', { text: subLabel(status, entry, team) })
        ])
      ]),
      el('span', { class: 'team-card__lock' }, [icon(status === 'taken' ? 'shield' : 'lock', { size: 15 })]),
      el('span', { class: 'team-card__check' }, [icon('check', { size: 16 })])
    ])
    card.addEventListener('click', () => {
      if (team.test) { enterTest(team); return } // 테스트 계정 — 이메일 모달 없이 즉시 점유
      if (status === 'taken') openClaimed(team)
      else openRegister(team)
    })
    return card
  }

  // 테스트 계정 — 이메일 등록을 건너뛰고 더미 수사관 3명으로 즉시 점유한다 (게임 테스트용).
  // 이미 다른 기기가 잡고 있으면 그대로 인계받아, 어느 기기에서든 바로 테스트할 수 있게 한다.
  async function enterTest (team) {
    closeModal()
    const result = await claimTeam({ teamId: team.id, emails: TEST_EMAILS, device })
    // 이미 다른 기기가 잡고 있으면 등록 이메일로 인계받아, 어느 기기에서든 바로 테스트할 수 있게 한다.
    const entry = result.ok ? result.entry : await transferTeam(team.id, device, TEST_EMAILS[0])
    if (entry) commit(entry)
    else refreshView() // 실패(통신 등) — 현재 점유 상태를 다시 그린다
  }

  // 수사관 등록 — 미입장 팀, 또는 내 기기가 점유 중인 팀의 오타 수정
  function openRegister (team) {
    closeModal()
    const existing = getEntry(team.id)
    const initial = existing && existing.deviceId === device ? existing.emails : []
    let submitAction = null

    const inputs = Array.from({ length: MEMBER_COUNT }, (_, i) => el('input', {
      class: 'field',
      type: 'email',
      inputmode: 'email',
      autocomplete: 'off',
      spellcheck: 'false',
      maxlength: '64',
      placeholder: PLACEHOLDER,
      value: initial[i] || ''
    }))

    const msg = el('p', { class: 'reg-msg' })

    function validate () {
      const { emails, blocking, duplicates, suspects } = checkEmails(inputs.map((input) => input.value))
      inputs.forEach((input, i) => {
        input.classList.toggle('is-suspect', suspects.includes(i))
        input.classList.toggle('is-dupe', !!emails[i] && duplicates.includes(emails[i]))
      })

      msg.className = 'reg-msg'
      if (blocking === 'empty') {
        // 아직 아무것도 안 쳤을 땐 조용히 — 버튼 비활성만으로 충분하다.
        msg.textContent = emails.some(Boolean) ? t('team.register.errEmpty') : ''
        if (msg.textContent) msg.classList.add('is-error')
      } else if (blocking === 'duplicate') {
        msg.textContent = t('team.register.errDuplicate')
        msg.classList.add('is-error')
      } else if (suspects.length) {
        msg.textContent = t('team.register.warnSuspect')
        msg.classList.add('is-warn')
      } else {
        msg.textContent = ''
      }

      if (submitAction) submitAction.update({ disabled: !!blocking })
    }

    function tidy (input) {
      input.value = normalizeEmail(input.value)
      validate()
    }

    async function submit () {
      const { emails, blocking } = checkEmails(inputs.map((input) => input.value))
      if (blocking) { validate(); return }

      if (submitAction) submitAction.update({ loading: true })
      const result = await claimTeam({ teamId: team.id, emails, device })
      if (submitAction) submitAction.update({ loading: false })

      if (result.ok) { commit(result.entry); return }
      if (result.reason === 'claimed') {
        // 다른 탭/기기가 방금 먼저 점유 — 재입장 흐름으로 넘긴다.
        closeModal()
        openClaimed(team)
        return
      }
      // 통신 실패 등 — 모달을 닫지 않고 사유를 보여준다(입력값 보존).
      msg.className = 'reg-msg is-error'
      msg.textContent = result.reason === 'error'
        ? '서버에 등록하지 못했습니다. 네트워크를 확인한 뒤 다시 시도하십시오.'
        : t('team.register.errEmpty')
    }

    inputs.forEach((input, i) => {
      input.addEventListener('input', validate)
      input.addEventListener('blur', () => tidy(input)) // 공백·대문자·전각@ 정리를 사용자가 눈으로 확인
      input.addEventListener('paste', () => setTimeout(() => tidy(input), 0))
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return
        e.preventDefault()
        tidy(input)
        const next = inputs[i + 1]
        if (next) next.focus()
        else submit()
      })
    })

    modal = createModal({
      title: `${team.name} · 수사관 등록`,
      size: 'sm',
      content: [
        copyEl('p', { class: 'auth-hint' }, 'team.register.hint'),
        el('div', { class: 'reg-rows' }, inputs.map((input, i) => el('label', { class: 'reg-row' }, [
          el('span', { class: 'reg-row__label mono', text: `수사관 ${i + 1}` }),
          input
        ]))),
        msg
      ],
      actions: [
        { label: t('team.register.cancel'), variant: 'ghost' },
        { label: t('team.register.submit'), variant: 'primary', close: false, disabled: true, onClick: submit }
      ],
      onClose: () => { modal = null }
    })
    submitAction = modal.actions[1]

    modal.open()
    validate()
    setTimeout(() => inputs[0].focus(), 60)
  }

  // 이미 다른 기기가 점유한 팀 — 등록된 이메일 하나로 인계받는다.
  function openClaimed (team) {
    closeModal()
    const entry = getEntry(team.id)
    if (!entry) { openRegister(team); return } // 방금 해제됨

    const input = el('input', {
      class: 'field',
      type: 'email',
      inputmode: 'email',
      autocomplete: 'off',
      spellcheck: 'false',
      maxlength: '64',
      placeholder: t('team.claimed.placeholder')
    })
    const error = el('p', { class: 'auth-error' })

    let submitAction = null
    async function submit () {
      const email = input.value.trim()
      if (!email) { input.focus(); return }
      if (submitAction) submitAction.update({ loading: true })
      // 서버 모드: 증명과 인계가 한 RPC(verify_and_transfer)로 처리된다 → 실패면 null.
      const entry = await transferTeam(team.id, device, email)
      if (submitAction) submitAction.update({ loading: false })
      if (!entry) {
        error.textContent = t('team.claimed.err')
        input.value = ''
        input.focus()
        return
      }
      commit(entry)
    }

    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } })

    modal = createModal({
      title: `${team.name} · ${t('team.claimed.title')}`,
      size: 'sm',
      content: [
        // 이메일은 증명 전에는 노출하지 않는다(서버 모드에서는 애초에 받아오지 않는다).
        el('p', { class: 'claimed-meta mono' }, [
          icon('clock', { size: 14 }),
          el('span', { text: `${formatTime(entry.enteredAt)} 입장` }),
          entry.emails.length ? el('span', { class: 'claimed-meta__sep', text: '·' }) : null,
          entry.emails.length
            ? el('span', { text: `${maskEmail(entry.emails[0])} 외 ${Math.max(0, entry.emails.length - 1)}명` })
            : null
        ]),
        copyEl('p', { class: 'auth-hint' }, 'team.claimed.hint'),
        input,
        error
      ],
      actions: [
        { label: t('team.claimed.cancel'), variant: 'ghost' },
        { label: t('team.claimed.submit'), variant: 'primary', close: false, onClick: submit }
      ],
      onClose: () => { modal = null }
    })
    submitAction = modal.actions[1]
    modal.open()
    setTimeout(() => input.focus(), 60)
  }

  // 다른 탭(=행사 현장의 다른 기기 대역)이 점유를 바꾸면 즉시 반영한다.
  const unsubscribe = subscribe(() => {
    if (selected && teamStatus(selected, device) !== 'mine') {
      selected = null
      ctx.update({ teamId: null, memberEmails: [], enteredAt: null })
    }
    refreshView()
  })

  refreshView()
  refreshEntries() // 서버 점유 현황 초기 로드 — 완료되면 subscribe 로 다시 그려진다

  const node = el('div', { class: 'screen screen--form' }, [
    el('div', { class: 'form-screen__inner' }, [
      el('header', { class: 'form-screen__head form-screen__head--row' }, [
        el('div', { class: 'form-screen__headings' }, [
          copyEl('span', { class: 'form-screen__step mono' }, 'team.step'),
          copyEl('h1', { class: 'form-screen__title' }, 'team.title'),
          copyEl('p', { class: 'form-screen__lead' }, 'team.lead')
        ]),
        startBtn.el // 사건 접수 시작 — 제목 옆(상단)으로 이동
      ]),
      grid,
      roster
    ])
  ])

  return {
    el: node,
    destroy () {
      unsubscribe()
      closeModal()
      startBtn.destroy()
    }
  }
}
