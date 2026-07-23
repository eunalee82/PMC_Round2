// AppHeader — case-file terminal top bar (LayOut.png):
// badge logo · brand · MISSION TIME timer · bureau status · action icons.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { ASSETS } from '../../js/constants/assets.js'

// Connection status readout (non-interactive). Wired to the store's connection state later.
const CONNECTION_STATES = {
  online: { label: 'SYSTEM ONLINE', dot: '' },
  reconnecting: { label: 'RECONNECTING', dot: 'is-reconnecting' },
  offline: { label: 'OFFLINE', dot: 'is-off' }
}

function formatClock (totalSeconds) {
  const s = Math.max(0, totalSeconds)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function createAppHeader (props = {}) {
  const {
    brand = 'LG SW PM Competition 2026',
    status = 'PM PROTECTION BUREAU',
    connected = true,
    hasNotification = true,
    timerSeconds = 45 * 60,
    running = false,
    onMenu = null,
    onAudio = null,
    onSettings = null,
    onNotifications = null
  } = props

  const iconButton = (name, label, onClick, extra = null) => el('button', {
    class: 'icon-btn', type: 'button', 'aria-label': label,
    on: { click: (e) => onClick && onClick(e) }
  }, [icon(name), extra])

  const menuBtn = el('button', {
    class: 'icon-btn app-header__menu', type: 'button', 'aria-label': '메뉴 열기',
    on: { click: (e) => onMenu && onMenu(e) }
  }, [icon('menu')])

  // Logo — bureau badge (badge-black.png)
  const brandEl = el('div', { class: 'app-header__brand brand' }, [
    el('span', { class: 'brand__logo' }, [
      el('img', { class: 'brand__logo-img', src: ASSETS.logos.badgeBlack, alt: 'PM보호국', width: 30, height: 30 })
    ]),
    el('span', { class: 'brand__text', text: brand })
  ])

  // Mission timer (left) — STANDBY until the admin starts the game (never runs through the oath).
  const labelEl = el('span', { class: 'header-timer__label', text: running ? 'MISSION TIME' : 'STANDBY' })
  const timeEl = el('span', { class: 'header-timer__time mono', text: formatClock(timerSeconds) })
  const timerEl = el('div', { class: running ? 'header-timer' : 'header-timer is-standby', title: '게임 종료까지 남은 시간' }, [
    el('span', { class: 'header-timer__icon' }, [icon('clock', { size: 20 })]),
    el('div', { class: 'header-timer__stack' }, [labelEl, timeEl])
  ])

  let remaining = timerSeconds
  let intervalId = null
  function tick () {
    if (remaining <= 0) { stopTimer(); return }
    remaining -= 1
    timeEl.textContent = formatClock(remaining)
    timerEl.classList.toggle('is-low', remaining <= 60)
  }
  function startTimer () {
    if (intervalId) return
    timerEl.classList.remove('is-standby')
    labelEl.textContent = 'MISSION TIME'
    intervalId = setInterval(tick, 1000)
  }
  function stopTimer () {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
  }
  if (running) startTimer()

  const conn = CONNECTION_STATES[connection] || CONNECTION_STATES.online
  const statusEl = el('div', {
    class: 'app-header__status', role: 'status', 'aria-live': 'polite', title: '서버 연결 상태'
  }, [
    el('span', { class: `status__dot ${conn.dot}`.trim() }),
    el('span', { class: 'status__label', text: conn.label })
  ])

  const bell = iconButton('bell', '알림', onNotifications, hasNotification ? el('span', { class: 'icon-btn__dot' }) : null)

  const node = el('header', { class: 'app-header' }, [
    menuBtn,
    brandEl,
    timerEl,
    statusEl,
    el('div', { class: 'app-header__spacer' }),
    el('div', { class: 'app-header__actions' }, [
      bell,
      iconButton('volume', '음향', onAudio),
      iconButton('settings', '설정', onSettings)
    ])
  ])

  return {
    el: node,
    startTimer, // called on admin game-start (gameplay phase)
    stopTimer,
    destroy () { stopTimer(); node.remove() }
  }
}
