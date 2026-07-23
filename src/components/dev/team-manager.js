// DEV Team Manager — add / edit / delete teams in the browser (name, password, color, members).
// Persists to localStorage via lib/teams.js; export dumps JSON to paste back into source later.
// Opened from the (password-gated) DEV menu; never present in production builds.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { getTeams, addTeam, updateTeam, removeTeam, resetTeams, exportTeams } from '../../js/lib/teams.js'

export function createTeamManager ({ onClose } = {}) {
  const count = el('span', { class: 'tm-count mono' })
  const list = el('div', { class: 'tm-list' })

  function row (team) {
    const color = el('input', { class: 'tm-color', type: 'color', value: team.color, title: '팀 색상' })
    color.addEventListener('input', () => updateTeam(team.id, { color: color.value }))

    const name = el('input', { class: 'tm-field', type: 'text', value: team.name, placeholder: '팀 이름' })
    name.addEventListener('input', () => updateTeam(team.id, { name: name.value }))

    const pass = el('input', { class: 'tm-field tm-field--pass', type: 'text', value: team.pass, placeholder: '비번' })
    pass.addEventListener('input', () => updateTeam(team.id, { pass: pass.value }))

    const members = el('input', { class: 'tm-field tm-field--num', type: 'number', min: '1', max: '20', value: String(team.members) })
    members.addEventListener('input', () => updateTeam(team.id, { members: Number(members.value) || 1 }))

    const del = el('button', { class: 'tm-del', type: 'button', 'aria-label': '팀 삭제' }, [icon('close', { size: 16 })])
    del.addEventListener('click', () => { removeTeam(team.id); render() })

    return el('div', { class: 'tm-row' }, [color, name, pass, members, del])
  }

  function render () {
    const teams = getTeams()
    count.textContent = `${teams.length}팀`
    list.replaceChildren(...teams.map(row))
  }

  const addBtn = el('button', { class: 'tm-btn', type: 'button' }, [icon('check', { size: 15 }), el('span', { text: '팀 추가' })])
  addBtn.addEventListener('click', () => { addTeam(); render(); list.scrollTop = list.scrollHeight })

  const exportBtn = el('button', { class: 'tm-btn', type: 'button' }, [el('span', { text: '내보내기(JSON)' })])
  exportBtn.addEventListener('click', async () => {
    const json = exportTeams()
    try { await navigator.clipboard.writeText(json) } catch { console.log('[teams]\n' + json) }
    const prev = exportBtn.textContent
    exportBtn.textContent = '복사됨!'
    setTimeout(() => { exportBtn.textContent = prev }, 1200)
  })

  const resetBtn = el('button', { class: 'tm-btn tm-btn--danger', type: 'button' }, [el('span', { text: '기본값으로' })])
  resetBtn.addEventListener('click', () => { resetTeams(); render() })

  const closeBtn = el('button', { class: 'icon-btn', type: 'button', 'aria-label': '닫기' }, [icon('close', { size: 18 })])
  closeBtn.addEventListener('click', () => close())

  const panel = el('div', { class: 'tm-panel' }, [
    el('div', { class: 'tm-head' }, [
      el('div', { class: 'tm-head-title' }, [el('h2', { text: '팀 관리' }), count]),
      closeBtn
    ]),
    el('div', { class: 'tm-toolbar' }, [addBtn, exportBtn, resetBtn]),
    el('div', { class: 'tm-cols' }, [
      el('span', { text: '색' }), el('span', { text: '팀 이름' }), el('span', { text: '비번' }), el('span', { text: '인원' }), el('span', {})
    ]),
    list
  ])

  const overlay = el('div', { class: 'tm-overlay' }, [panel])
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close() })

  let isOpen = false
  function onKey (e) { if (e.key === 'Escape') close() }

  function open () {
    if (isOpen) return
    isOpen = true
    render()
    document.body.append(overlay)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => overlay.classList.add('is-open'))
  }
  function close () {
    if (!isOpen) return
    isOpen = false
    overlay.classList.remove('is-open')
    document.removeEventListener('keydown', onKey)
    setTimeout(() => overlay.remove(), 200)
    if (typeof onClose === 'function') onClose()
  }

  return { open, close, destroy () { document.removeEventListener('keydown', onKey); overlay.remove() } }
}
