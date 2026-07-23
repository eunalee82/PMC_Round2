// SCR-005 Waiting Room — registered; awaiting the admin start command.
// Terminal screen of the entry flow (admin Start → Stage 1 is out of scope here).
// see docs/screen-list.md SCR-005, docs/game-flow.md §6.5.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { findTeam } from '../../lib/teams.js'
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

export function createWaitingScreen (ctx) {
  const team = findTeam(ctx.session.teamId)

  const node = el('div', { class: 'screen screen--waiting' }, [
    el('div', { class: 'wait__scanline', 'aria-hidden': 'true' }),
    el('div', { class: 'wait__inner' }, [
      el('div', { class: 'wait__brand' }, [el('img', { src: ASSETS.logos.badgeGold, alt: 'PM보호국', class: 'wait__brand-img' })]),
      copyEl('span', { class: 'wait__eyebrow mono' }, 'waiting.eyebrow'),
      team ? el('div', { class: 'wait__team' }, [el('span', { class: 'wait__team-dot', style: { background: team.color } }), el('span', { text: team.name })]) : null,
      copyEl('h1', { class: 'wait__title' }, 'waiting.title'),
      copyEl('p', { class: 'wait__msg' }, 'waiting.msg'),

      el('div', { class: 'wait__status card' }, [
        statusLine('SYSTEM STATUS', el('span', { text: 'CONNECTED' }), 'is-ok'),
        statusLine('MISSION STATUS', el('span', { text: 'WAITING' }), 'is-warn'),
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

  return {
    el: node,
    mounted () { ctx.audio.playBgm(ASSETS.bgm.opening) }
  }
}
