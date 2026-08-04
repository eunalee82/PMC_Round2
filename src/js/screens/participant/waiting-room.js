// SCR-005 Waiting Room — registered; awaiting the admin start command.
// Terminal screen of the entry flow (admin Start → Stage 1 is out of scope here).
// see docs/screen-list.md SCR-005, docs/game-flow.md §6.5.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { findTeam } from '../../lib/teams.js'
import { subscribe as subscribeGame, isStarted, getConnection, subscribeConnection } from '../../lib/game.js'
import { copyEl } from '../../lib/copy.js'

const MISSIONS = [
  { key: 'waiting.mission1', cases: 3 },
  { key: 'waiting.mission2', cases: 7 },
  { key: 'waiting.mission3', cases: 5 }
]

function statusLine (label, valueNode, tone) {
  valueNode.classList.add('wait__status-val', 'mono')
  if (tone) valueNode.classList.add(tone)
  return el('div', { class: 'wait__status-line' }, [
    el('span', { class: 'wait__status-key mono', text: label }),
    valueNode
  ])
}

const CONN_TEXT = {
  realtime: { text: 'CONNECTED', tone: 'is-ok' },
  polling: { text: 'SYNC · 5s', tone: 'is-warn' },
  connecting: { text: 'CONNECTING', tone: 'is-warn' },
  offline: { text: 'OFFLINE', tone: 'is-warn' },
  local: { text: 'LOCAL', tone: 'is-warn' }
}

export function createWaitingScreen (ctx) {
  const team = findTeam(ctx.session.teamId)
  const agents = ctx.session.memberEmails || []
  const connVal = el('span', { text: '—' })

  const node = el('div', { class: 'screen screen--waiting' }, [
    el('div', { class: 'wait__scanline', 'aria-hidden': 'true' }),
    el('div', { class: 'wait__inner' }, [
      el('div', { class: 'wait__brand' }, [el('img', { src: ASSETS.logos.badgeGold, alt: 'PM보호국', class: 'wait__brand-img' })]),
      copyEl('span', { class: 'wait__eyebrow mono' }, 'waiting.eyebrow'),
      team ? el('div', { class: 'wait__team' }, [el('span', { class: 'wait__team-dot', style: { background: team.color } }), el('span', { text: team.name })]) : null,
      copyEl('h1', { class: 'wait__title' }, 'waiting.title'),
      copyEl('p', { class: 'wait__msg' }, 'waiting.msg'),

      el('div', { class: 'wait__status card' }, [
        statusLine('SYSTEM STATUS', connVal, ''),
        statusLine('MISSION STATUS', el('span', { text: 'WAITING' }), 'is-warn'),
        statusLine('AGENTS REGISTERED', el('span', { text: `${agents.length}` }), agents.length === 3 ? 'is-ok' : 'is-warn'),
        statusLine('START TIME', copyEl('span', {}, 'waiting.startTime'), '')
      ]),

      el('div', { class: 'wait__missions' }, MISSIONS.map((m) => el('div', { class: 'wait__mission' }, [
        el('span', { class: 'wait__mission-lock' }, [icon('lock', { size: 14 })]),
        copyEl('span', { class: 'wait__mission-name' }, m.key),
        el('span', { class: 'wait__mission-cases mono', text: `${m.cases} CASES` })
      ]))),

      el('div', { class: 'wait__pulse' }, [
        el('span', { class: 'wait__pulse-dot' }),
        copyEl('span', { class: 'mono' }, 'waiting.pulse')
      ])
    ])
  ])

  // 관리자 Start 대기 → game.status 'started'가 되면 Stage 1(사건)로 자동 전환한다.
  // MOCK: lib/game.js(localStorage) 구독. 서버 연결 시 Realtime 구독으로 교체 (CLAUDE.md §8).
  // 서버 연결 상태 — 대기 중에 문제를 알아챌 수 있어야 한다
  function paintConn (mode) {
    const c = CONN_TEXT[mode] || CONN_TEXT.connecting
    connVal.textContent = c.text
    connVal.className = 'wait__status-val mono ' + c.tone
  }
  paintConn(getConnection())
  const unsubConn = subscribeConnection(paintConn)

  let leaving = false
  function goToStage () {
    if (leaving) return
    leaving = true
    // gameplay는 참가자 선형 가드(FLOW_ORDER) 밖 → skipGuard로 명시적 전환.
    ctx.goTo(FLOW.CASE, { skipGuard: true })
  }
  const unsubscribe = subscribeGame((status) => { if (status === 'started') goToStage() })

  return {
    el: node,
    mounted () {
      if (isStarted()) { goToStage(); return } // 이미 시작된 게임에 (재)진입하면 곧장 Stage로
      ctx.audio.playBgm(ASSETS.bgm.opening)
    },
    destroy () { unsubscribe(); unsubConn() }
  }
}
