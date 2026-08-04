// AppHeader — case-file terminal top bar (LayOut.png):
// badge logo · brand · MISSION TIME timer · bureau status · action icons.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { ASSETS } from '../../js/constants/assets.js'
import { getAudioSettings, setVolume, setMuted, subscribeAudio } from '../../js/lib/audio-settings.js'
import { t } from '../../js/lib/copy.js'

// 소리 조절 — 전역 볼륨 슬라이더 + 음소거 (듣기평가/녹취 오디오에 적용). 아이콘은 현재 상태를 반영.
function createVolumeControl () {
  const btn = el('button', { class: 'icon-btn', type: 'button', 'aria-label': t('audio.control') })
  const slider = el('input', { class: 'volpop__slider', type: 'range', min: '0', max: '100', step: '1', 'aria-label': t('audio.volume') })
  const muteBtn = el('button', { class: 'volpop__mute', type: 'button' })
  const pop = el('div', { class: 'volpop', hidden: true }, [muteBtn, slider])
  const wrap = el('div', { class: 'volctl' }, [btn, pop])

  const iconFor = (s) => (s.muted || s.volume === 0) ? 'volumeOff' : 'volume'
  function render () {
    const s = getAudioSettings()
    btn.replaceChildren(icon(iconFor(s), { size: 20 }))
    slider.value = String(Math.round(s.volume * 100))
    muteBtn.replaceChildren(icon(iconFor(s), { size: 16 }), el('span', { text: s.muted ? t('audio.unmute') : t('audio.mute') }))
  }
  btn.addEventListener('click', (e) => { e.stopPropagation(); pop.hidden = !pop.hidden })
  slider.addEventListener('input', () => setVolume(Number(slider.value) / 100))
  muteBtn.addEventListener('click', () => setMuted(!getAudioSettings().muted))
  const onDoc = (e) => { if (!wrap.contains(e.target)) pop.hidden = true }
  document.addEventListener('click', onDoc)
  const unsub = subscribeAudio(render)
  render()
  return { el: wrap, destroy () { unsub(); document.removeEventListener('click', onDoc) } }
}

// 연결 상태 표시 — lib/game.js 의 연결 모드를 화면(screen)이 setConnection() 으로 내려준다.
// (컴포넌트가 상태 모듈을 직접 참조하지 않는다 — CLAUDE.md §9)
const CONNECTION_STATES = {
  realtime: { label: 'SYSTEM ONLINE', dot: '' },
  polling: { label: 'SYNC · 5s', dot: 'is-reconnecting' },
  connecting: { label: 'CONNECTING', dot: 'is-reconnecting' },
  offline: { label: 'OFFLINE', dot: 'is-off' },
  local: { label: 'LOCAL MODE', dot: 'is-off' }
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

  const dotEl = el('span', { class: 'status__dot' })
  const connLabelEl = el('span', { class: 'status__label' })
  const statusEl = el('div', {
    class: 'app-header__status', role: 'status', 'aria-live': 'polite', title: '서버 연결 상태'
  }, [dotEl, connLabelEl])

  function setConnection (mode) {
    const c = CONNECTION_STATES[mode] || (connected ? CONNECTION_STATES.realtime : CONNECTION_STATES.offline)
    dotEl.className = `status__dot ${c.dot}`.trim()
    connLabelEl.textContent = c.label
    statusEl.title = mode === 'polling'
      ? '실시간 연결이 없어 5초마다 상태를 확인하는 중입니다 (진행에는 영향 없습니다)'
      : mode === 'offline' ? '서버와 연결되지 않았습니다 — 복구되면 자동으로 다시 시도합니다'
        : mode === 'local' ? '오프라인(mock) 모드로 진행 중입니다'
          : '서버 연결 정상'
  }
  setConnection(connected ? 'realtime' : 'offline')

  const volume = createVolumeControl()

  const node = el('header', { class: 'app-header' }, [
    menuBtn,
    brandEl,
    timerEl,
    statusEl,
    el('div', { class: 'app-header__spacer' }),
    el('div', { class: 'app-header__actions' }, [
      // 종(알림)·설정 아이콘은 동작 없는 placeholder라 제거. 소리 조절만 유지(듣기평가 대응).
      volume.el
    ])
  ])

  return {
    el: node,
    startTimer, // called on admin game-start (gameplay phase)
    stopTimer,
    setConnection,
    destroy () { stopTimer(); volume.destroy(); node.remove() }
  }
}
