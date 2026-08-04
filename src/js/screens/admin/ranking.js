// SCR-022 최종 랭킹 — **감독관(운영진) 전용 발표 화면**. 참가자 흐름에는 없다(운영 결정 2026-08-04).
// 관리자 콘솔(?admin)에서 열고 닫는다. 순위 기준(docs/game-flow.md §15.1)은 lib/progress.js getRanking()이
// 계산하고(총점 → 정답 수 → 제출 완료 시각 → Final Raid 기여도), 이 화면은 받은 데이터를 그린다 (CLAUDE.md §9).
// 표시 정보(§15.2): 순위·팀명·총점·Stage별 점수·정답 수·완료 시간·Raid 공격 수·획득 장비.
// createRankingView(props) -> { el, destroy }  (CLAUDE.md §9 컴포넌트 계약)
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { t } from '../../lib/copy.js'
import { STAGE_META, STAGE_ITEM_ICONS } from '../../constants/stages.js'
import { getRanking, POINTS_PER_CASE } from '../../lib/progress.js'
import { builtTotal, STAGES } from '../../lib/stage-progress.js'
import { createButton } from '../../../components/primitives/button.js'

const MEDALS = { 1: 'is-gold', 2: 'is-silver', 3: 'is-bronze' }

function pad (n) { return String(n).padStart(2, '0') }
function fmtTime (ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function createRankingView (props = {}) {
  const { onClose = null } = props
  const rows = getRanking()

  // 획득 장비 — 해당 스테이지의 모든 사건을 제출했으면 확보(사이드바 EVIDENCE와 같은 기준).
  const itemDots = (row) => el('span', { class: 'rankrow__items' }, STAGES.map((s) => {
    const acquired = (row.submittedStage[s] || 0) >= builtTotal(s)
    return el('span', {
      class: acquired ? 'rankrow__item is-on' : 'rankrow__item',
      title: t(STAGE_META[s].item.nameKey)
    }, [icon(acquired ? STAGE_ITEM_ICONS[s] : 'lock', { size: 13 })])
  }))

  const listRows = rows.map((r) => el('div', {
    class: ['rankrow', MEDALS[r.rank]].filter(Boolean).join(' '),
    dataset: { team: r.teamId }
  }, [
    el('span', { class: 'rankrow__rank mono', text: String(r.rank) }),
    el('span', { class: 'rankrow__team', text: r.name }),
    el('span', { class: 'rankrow__score mono', text: String(r.score) }),
    el('span', { class: 'rankrow__stages mono', text: `${r.stage[1] * POINTS_PER_CASE} · ${r.stage[2] * POINTS_PER_CASE} · ${r.stage[3] * POINTS_PER_CASE}` }),
    el('span', { class: 'rankrow__solved mono', text: String(r.solved) }),
    el('span', { class: 'rankrow__time mono', text: fmtTime(r.lastSubmitAt) }),
    el('span', { class: 'rankrow__raid mono', text: String(r.raidHits) }),
    itemDots(r)
  ]))

  const head = el('div', { class: 'rankrow rankrow--head' }, [
    el('span', { class: 'rankrow__rank mono caps', text: t('rank.colRank') }),
    el('span', { class: 'rankrow__team caps', text: t('rank.colTeam') }),
    el('span', { class: 'rankrow__score mono caps', text: t('rank.colScore') }),
    el('span', { class: 'rankrow__stages mono caps', text: t('rank.colStages') }),
    el('span', { class: 'rankrow__solved mono caps', text: t('rank.colSolved') }),
    el('span', { class: 'rankrow__time mono caps', text: t('rank.colTime') }),
    el('span', { class: 'rankrow__raid mono caps', text: t('rank.colRaid') }),
    el('span', { class: 'rankrow__items caps', text: t('rank.itemsLabel') })
  ])

  const closeBtn = createButton({
    label: '관리자 콘솔로', variant: 'secondary', size: 'md', icon: 'refresh',
    onClick: () => { if (onClose) onClose() }
  })

  const node = el('div', { class: 'screen screen--finale screen--ranking' }, [
    el('div', { class: 'finale__inner finale__inner--wide' }, [
      el('div', { class: 'ranking anim-fade' }, [
        el('span', { class: 'finale__eyebrow mono caps', text: t('rank.eyebrow') }),
        el('h1', { class: 'finale__title', text: t('rank.title') }),
        el('p', { class: 'ranking__sub', text: t('rank.sub') }),
        el('div', { class: 'ranking__tablewrap' }, [
          el('div', { class: 'ranking__table' }, [
            head,
            el('div', { class: 'ranklist' }, listRows.length ? listRows : [
              el('p', { class: 'ranklist__empty', text: t('rank.empty') })
            ])
          ])
        ]),
        el('div', { class: 'ranking__actions' }, [closeBtn.el])
      ])
    ])
  ])

  return {
    el: node,
    destroy () { closeBtn.destroy(); node.remove() }
  }
}
