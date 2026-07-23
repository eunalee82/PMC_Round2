// Dev-only jump menu + inline copy editor. Mounted only when import.meta.env.DEV (see main.js).
// Additionally gated by a password (2026) so it can't be used casually on shared/preview builds.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { FLOW_ORDER, FLOW_LABELS } from '../../js/constants/flow.js'
import { enableCopyEdit, isCopyEditing, exportCopy, resetCopy } from '../../js/lib/copy.js'
import { createTeamManager } from './team-manager.js'

const DEV_PASSWORD = '2026'
const UNLOCK_KEY = 'pmb.dev.unlocked'

export function createDevMenu ({ flow }) {
  let unlocked = false
  try { unlocked = localStorage.getItem(UNLOCK_KEY) === '1' } catch { unlocked = false }

  // Re-render the current screen after team edits so changes show immediately.
  const teamManager = createTeamManager({ onClose: () => flow.goTo(flow.current(), { skipGuard: true }) })

  const body = el('div', { class: 'devmenu__body' })

  function renderLocked () {
    const input = el('input', { class: 'devmenu__pass', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: '8', placeholder: '비밀번호' })
    const err = el('span', { class: 'devmenu__passerr' })
    function submit () {
      if (input.value === DEV_PASSWORD) {
        unlocked = true
        try { localStorage.setItem(UNLOCK_KEY, '1') } catch { /* ignore */ }
        renderBody()
      } else {
        err.textContent = '비밀번호가 올바르지 않습니다.'
        input.value = ''
        input.focus()
      }
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    const okBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: submit } }, ['잠금 해제'])
    body.replaceChildren(
      el('span', { class: 'devmenu__label', text: 'DEV 잠금 · 비밀번호 필요' }),
      input,
      okBtn,
      err
    )
    setTimeout(() => input.focus(), 40)
  }

  function renderUnlocked () {
    const jumpButtons = FLOW_ORDER.map((step) => el('button', {
      class: 'devmenu__jump', type: 'button',
      on: { click: () => flow.goTo(step, { skipGuard: true }) }
    }, [FLOW_LABELS[step]]))

    const editBtn = el('button', { class: 'devmenu__jump devmenu__editbtn', type: 'button' }, [isCopyEditing() ? '✏️ 편집 종료' : '✏️ 글씨 편집'])
    editBtn.classList.toggle('is-active', isCopyEditing())
    editBtn.addEventListener('click', () => {
      const next = !isCopyEditing()
      enableCopyEdit(next)
      editBtn.classList.toggle('is-active', next)
      editBtn.textContent = next ? '✏️ 편집 종료' : '✏️ 글씨 편집'
    })

    const exportBtn = el('button', { class: 'devmenu__jump', type: 'button' }, ['문구 내보내기'])
    exportBtn.addEventListener('click', async () => {
      const json = exportCopy()
      try { await navigator.clipboard.writeText(json) } catch { console.log('[copy overrides]\n' + json) }
      const prev = exportBtn.textContent
      exportBtn.textContent = '복사됨! (콘솔 출력)'
      setTimeout(() => { exportBtn.textContent = prev }, 1400)
    })

    const resetCopyBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: () => resetCopy() } }, ['문구 되돌리기'])

    const teamsBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: () => teamManager.open() } }, ['팀 관리 (이름·비번)'])

    body.replaceChildren(
      el('span', { class: 'devmenu__label', text: 'JUMP TO SCREEN' }),
      el('div', { class: 'devmenu__jumps' }, jumpButtons),
      el('div', { class: 'devmenu__divider' }),
      el('span', { class: 'devmenu__label', text: 'TEAMS (팀)' }),
      el('div', { class: 'devmenu__jumps' }, [teamsBtn]),
      el('div', { class: 'devmenu__divider' }),
      el('span', { class: 'devmenu__label', text: 'COPY (문구)' }),
      el('div', { class: 'devmenu__jumps' }, [editBtn, exportBtn, resetCopyBtn]),
      el('div', { class: 'devmenu__divider' }),
      el('button', { class: 'devmenu__reset', type: 'button', on: { click: () => flow.reset() } }, [icon('refresh', { size: 14 }), el('span', { text: '세션 초기화' })])
    )
  }

  function renderBody () { unlocked ? renderUnlocked() : renderLocked() }

  const toggle = el('button', { class: 'devmenu__toggle', type: 'button', 'aria-label': '개발자 메뉴' }, [
    icon('settings', { size: 16 }),
    el('span', { text: 'DEV' })
  ])

  const panel = el('div', { class: 'devmenu', dataset: { open: 'false' } }, [toggle, body])
  toggle.addEventListener('click', () => {
    const open = panel.dataset.open !== 'true'
    panel.dataset.open = open ? 'true' : 'false'
    if (open) renderBody()
  })

  return {
    el: panel,
    mount (parent) { parent.append(panel); return panel },
    destroy () { teamManager.destroy(); panel.remove() }
  }
}
