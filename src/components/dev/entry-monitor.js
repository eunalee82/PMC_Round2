// DEV Entry Monitor — 팀별 입장 현황 보드 (운영진용 대기 모드 확인 화면의 프로토타입).
// 팀별 비번을 없앤 대신, 잘못 입장한 팀을 게임 시작 전에 여기서 찾아 정정한다:
// 형식 의심 / 타 팀 중복(같은 이메일이 2팀 이상 = 팀 오선택) 플래그와 [입장 해제].
// 정식 어드민(SCR-104 Team Monitor)이 생기면 이 로직을 그대로 옮긴다.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { getTeams } from '../../js/lib/teams.js'
import {
  listEntries, crossTeamDuplicates, releaseTeam, releaseAll, entriesCsv, subscribe, formatTime, getDeviceId
} from '../../js/lib/entries.js'

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'in', label: '입장' },
  { key: 'out', label: '미입장' },
  { key: 'flag', label: '확인 필요' }
]

// 행사 중 오클릭으로 팀을 날리지 않도록 한 번 더 확인받는다.
function confirmButton ({ className, label, confirmLabel, title, onConfirm }) {
  const btn = el('button', { class: className, type: 'button', title: title || label }, [label])
  let armed = false
  let timer = null

  function disarm () {
    armed = false
    btn.classList.remove('is-armed')
    btn.textContent = label
    clearTimeout(timer)
  }

  btn.addEventListener('click', () => {
    if (!armed) {
      armed = true
      btn.classList.add('is-armed')
      btn.textContent = confirmLabel
      timer = setTimeout(disarm, 3000)
      return
    }
    disarm()
    onConfirm()
  })

  return { el: btn, cancel: () => clearTimeout(timer) }
}

export function createEntryMonitor ({ onClose } = {}) {
  const device = getDeviceId()
  const count = el('span', { class: 'tm-count mono' })
  const list = el('div', { class: 'em-list' })
  let filter = 'all'
  let unsubscribe = null
  const rowButtons = []

  function flagsFor (entry, dupes) {
    if (!entry) return []
    const flags = []
    if (entry.flags?.includes('suspect')) flags.push('형식 의심')
    if (entry.emails.some((email) => dupes.has(email))) flags.push('타 팀 중복')
    return flags
  }

  function row (team, entry, dupes) {
    const flags = flagsFor(entry, dupes)
    const status = !entry ? '미입장' : (entry.deviceId === device ? '입장 (이 기기)' : '입장')

    const release = entry
      ? confirmButton({
        className: 'em-release',
        label: '해제',
        confirmLabel: '확인?',
        title: `${team.name} 입장 해제`,
        onConfirm: () => { releaseTeam(team.id); render() }
      })
      : null
    if (release) rowButtons.push(release)

    return el('div', { class: ['em-row', entry ? 'is-in' : 'is-out', flags.length && 'is-flagged'].filter(Boolean).join(' ') }, [
      el('span', { class: 'em-team', text: team.name }),
      el('span', { class: 'em-status mono', text: status }),
      el('span', { class: 'em-time mono', text: entry ? formatTime(entry.enteredAt) : '—' }),
      el('div', { class: 'em-emails mono' }, entry
        ? entry.emails.map((email) => el('span', {
          class: dupes.has(email) ? 'em-email is-dupe' : 'em-email',
          text: email // 사용자 입력 — textContent
        }))
        : [el('span', { class: 'em-email is-empty', text: '—' })]),
      el('span', { class: 'em-flags' }, flags.length
        ? [icon('alert', { size: 13 }), el('span', { text: flags.join(' · ') })]
        : []),
      el('span', { class: 'em-actions' }, release ? [release.el] : [])
    ])
  }

  function render () {
    rowButtons.splice(0).forEach((b) => b.cancel())
    const dupes = crossTeamDuplicates()
    const all = listEntries()
    const entered = all.filter((r) => r.entry).length
    count.textContent = `입장 ${entered} / ${getTeams().length}`

    const visible = all.filter(({ entry }) => {
      if (filter === 'in') return !!entry
      if (filter === 'out') return !entry
      if (filter === 'flag') return flagsFor(entry, dupes).length > 0
      return true
    })

    list.replaceChildren(...(visible.length
      ? visible.map(({ team, entry }) => row(team, entry, dupes))
      : [el('p', { class: 'em-empty', text: '해당하는 팀이 없습니다.' })]))
  }

  const filterChips = FILTERS.map((f) => {
    const chip = el('button', { class: 'em-chip', type: 'button', dataset: { filter: f.key } }, [f.label])
    chip.addEventListener('click', () => {
      filter = f.key
      filterChips.forEach((c) => c.classList.toggle('is-active', c.dataset.filter === filter))
      render()
    })
    return chip
  })
  filterChips[0].classList.add('is-active')

  const csvBtn = el('button', { class: 'tm-btn', type: 'button' }, [el('span', { text: 'CSV 복사' })])
  csvBtn.addEventListener('click', async () => {
    const csv = entriesCsv()
    try { await navigator.clipboard.writeText(csv) } catch { console.log('[entries.csv]\n' + csv) }
    const prev = csvBtn.textContent
    csvBtn.textContent = '복사됨!'
    setTimeout(() => { csvBtn.textContent = prev }, 1200)
  })

  const resetAll = confirmButton({
    className: 'tm-btn tm-btn--danger',
    label: '전체 해제',
    confirmLabel: '전체 해제 확인?',
    onConfirm: () => { releaseAll(); render() }
  })

  const closeBtn = el('button', { class: 'icon-btn', type: 'button', 'aria-label': '닫기' }, [icon('close', { size: 18 })])
  closeBtn.addEventListener('click', () => close())

  const panel = el('div', { class: 'tm-panel em-panel' }, [
    el('div', { class: 'tm-head' }, [
      el('div', { class: 'tm-head-title' }, [el('h2', { text: '입장 현황' }), count]),
      closeBtn
    ]),
    el('div', { class: 'tm-toolbar' }, [...filterChips, el('span', { class: 'em-spacer' }), csvBtn, resetAll.el]),
    el('div', { class: 'em-cols' }, [
      el('span', { text: '팀' }), el('span', { text: '상태' }), el('span', { text: '입장' }),
      el('span', { text: '수사관 이메일' }), el('span', { text: '확인 필요' }), el('span', {})
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
    unsubscribe = subscribe(render) // 다른 탭에서 입장하면 즉시 반영
    document.body.append(overlay)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => overlay.classList.add('is-open'))
  }

  function close () {
    if (!isOpen) return
    isOpen = false
    overlay.classList.remove('is-open')
    document.removeEventListener('keydown', onKey)
    if (unsubscribe) { unsubscribe(); unsubscribe = null }
    rowButtons.splice(0).forEach((b) => b.cancel())
    resetAll.cancel()
    setTimeout(() => overlay.remove(), 200)
    if (typeof onClose === 'function') onClose()
  }

  return {
    open,
    close,
    destroy () {
      document.removeEventListener('keydown', onKey)
      if (unsubscribe) { unsubscribe(); unsubscribe = null }
      overlay.remove()
    }
  }
}
