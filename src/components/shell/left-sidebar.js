// LeftSidebar — persistent case HUD (LayOut.png):
// selected Agent Team + Investigation Score (/300) · Ranking · Stage Score · Evidence Items · Version.
// Scoring model: 20 pts per case × 15 = 300 max (Stage 1 = 60, Stage 2 = 140, Stage 3 = 100).
// update(props)로 점수·랭킹·아이템을 다시 그린다 (사건 해결 시 사이드바 갱신). 서버 연결 시 store 구독으로 교체.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { t } from '../../js/lib/copy.js'

const STAGE_ICONS = { mindset: 'brain', domain: 'cube', ai: 'cpu' }

function section (label, ...children) {
  return el('div', { class: 'sidebar__section' }, [
    label ? el('div', { class: 'sidebar__label' }, [el('span', { class: 'caps', text: label })]) : null,
    ...children
  ])
}

export function createLeftSidebar (props = {}) {
  const node = el('aside', { class: 'sidebar', 'aria-label': '수사 현황' })
  let current = props

  function render (p) {
    const {
      team = { name: 'UNASSIGNED', rank: '신입 수사관', score: 0, scoreMax: 300 },
      ranking = [],
      stageScore = [],
      items = [],
      version = '1.0.0'
    } = p

    const scorePct = team.scoreMax > 0 ? Math.max(0, Math.min(100, (team.score / team.scoreMax) * 100)) : 0

    // Agent — selected team, rank, Investigation Score out of 300
    const agent = el('div', { class: 'agent framed' }, [
      el('div', { class: 'agent__top' }, [
        el('span', { class: 'agent__team', text: team.name }),
        el('span', { class: 'agent__rank', text: team.rank || t('agent.rankRookie') })
      ]),
      el('div', { class: 'agent__label caps', text: 'Investigation Score' }),
      el('div', { class: 'agent__score' }, [
        el('b', { text: String(team.score ?? 0) }),
        el('span', { text: `/ ${team.scoreMax ?? 300} ${t('sidebar.points')}` })
      ]),
      el('div', { class: 'agent__bar' }, [el('div', { class: 'agent__bar-fill', style: { width: `${scorePct}%` } })])
    ])

    const rankingList = el('div', { class: 'ranking' }, ranking.map((r) => el('div', {
      class: r.isMe ? 'ranking__item is-me' : 'ranking__item',
      dataset: { rank: String(r.rank) }
    }, [
      el('span', { class: 'ranking__rank', text: String(r.rank) }),
      el('span', { class: 'ranking__name', text: r.name }),
      el('span', { class: 'ranking__score mono', text: String(r.score) })
    ])))

    const stageRows = el('div', { class: 'stagescore' }, stageScore.map((s) => el('div', { class: 'stagescore__row' }, [
      el('span', { class: 'stagescore__icon' }, [icon(STAGE_ICONS[s.key] || 'cube', { size: 18 })]),
      el('span', { class: 'stagescore__name', text: s.label }),
      el('span', { class: 'stagescore__frac mono', text: `${s.score}/${s.max}` })
    ])))

    const itemTray = el('div', { class: 'items' }, items.map((it) => el('div', {
      class: it.acquired ? 'item-slot is-unlocked' : 'item-slot',
      dataset: { rarity: it.rarity || 'rare' },
      title: it.name ? `${it.name}${it.rarity ? ` · ${it.rarity.toUpperCase()}` : ''}` : it.label
    }, [
      el('span', { class: 'item-slot__icon' }, [icon(it.acquired ? (it.icon || 'star') : 'lock', { size: 20 })]),
      el('span', { class: 'item-slot__label', text: it.label })
    ])))

    node.replaceChildren(
      section(null, agent),
      section('Ranking', rankingList),
      section('Stage Score', stageRows),
      section('Evidence', itemTray),
      el('div', { class: 'sidebar__version mono', text: `PMB-OS v${version}` })
    )
  }

  render(current)

  return {
    el: node,
    update (next = {}) { current = { ...current, ...next }; render(current) },
    destroy () { node.remove() }
  }
}
