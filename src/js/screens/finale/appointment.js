// SCR-015 Officer Appointment — 세 Stage를 모두 통과한 팀을 PM보호국 정식 감독관으로 임명한다.
// 진입 조건(docs/game-flow.md §11.1): Stage 1~3 완료 + 세 보상 확보 → 라우터 가드가 검증한다
// (constants/flow.js resolveStep). [임명 수락] 시 감독관 상태를 저장하고 긴급 경보(SCR-016)로 넘어간다.
// 연출: 국장 등장 → 계급 변화(신입 수사관 → 정식 감독관) → 임시 배지 활성화. 실패해도 진행은 막지 않는다(§13).
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { t } from '../../lib/copy.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { STAGE_META } from '../../constants/stages.js'
import { findTeam } from '../../lib/teams.js'
import { getProgress, recordFinale } from '../../lib/progress.js'
import { builtTotal, STAGES } from '../../lib/stage-progress.js'
import { createButton } from '../../../components/primitives/button.js'

export function createAppointmentScreen (ctx) {
  const teamId = ctx.session.teamId
  const team = findTeam(teamId)
  const teamName = team ? team.name : 'UNASSIGNED'
  const p = getProgress(teamId)

  const prevStage = document.documentElement.dataset.stage
  document.documentElement.dataset.stage = 'ending' // 임명은 금색 국면 (docs/game-flow.md §21)

  const acceptBtn = createButton({
    label: t('appoint.accept'),
    variant: 'gold',
    size: 'lg',
    icon: 'award',
    block: true,
    onClick: () => {
      recordFinale(teamId, { appointedAt: Date.now() }) // 저장 시점: 감독관 임명 (§18)
      ctx.goTo(FLOW.RAID)
    }
  })

  // 자격 검증 결과 — Stage별 해결 사건 수(제작된 사건 수 기준).
  const stageRows = STAGES.map((s) => el('div', { class: 'appoint__stage' }, [
    el('span', { class: 'appoint__stage-no mono', text: `STAGE ${s}` }),
    el('span', { class: 'appoint__stage-name', text: t(STAGE_META[s].nameKey) }),
    el('span', { class: 'appoint__stage-val mono', text: `${p.stage[s] || 0}/${builtTotal(s)}` }),
    el('span', { class: 'appoint__stage-ok' }, [icon('check', { size: 16 })])
  ]))

  // 확보 장비 3종 — 임명 화면에서 Final Raid 장비를 한 번 더 각인시킨다.
  const itemCards = STAGES.map((s) => {
    const item = STAGE_META[s].item
    return el('div', { class: 'appoint__item' }, [
      el('span', { class: 'appoint__item-icon' }, [icon(item.icon, { size: 26 })]),
      el('span', { class: 'appoint__item-rarity mono caps', text: t(item.rarityKey) }),
      el('span', { class: 'appoint__item-name', text: t(item.nameKey) }),
      el('span', { class: 'appoint__item-effect', text: t(item.effectKey) })
    ])
  })

  const node = el('div', { class: 'screen screen--finale screen--appoint' }, [
    el('div', { class: 'finale__inner anim-rise' }, [
      el('span', { class: 'finale__eyebrow mono caps', text: t('appoint.eyebrow') }),
      el('h1', { class: 'finale__title', text: t('appoint.title') }),

      el('div', { class: 'appoint__boss' }, [
        el('img', { class: 'appoint__boss-img', src: ASSETS.characters.boss, alt: t('appoint.bossLabel') }),
        el('div', { class: 'appoint__boss-msg' }, [
          el('span', { class: 'appoint__boss-label mono caps', text: t('appoint.bossLabel') }),
          el('p', { class: 'appoint__boss-text', text: t('appoint.message') })
        ])
      ]),

      el('div', { class: 'appoint__team' }, [
        team ? el('span', { class: 'appoint__team-dot', style: { background: team.color } }) : null,
        el('span', { class: 'appoint__team-name', text: teamName })
      ]),

      // 계급 변화 — 신입 수사관에서 정식 감독관으로.
      el('div', { class: 'appoint__rank' }, [
        el('span', { class: 'appoint__rank-from', text: t('appoint.rankFrom') }),
        el('span', { class: 'appoint__rank-arrow', text: '→' }),
        el('span', { class: 'appoint__rank-to', text: t('appoint.rankTo') })
      ]),

      el('section', { class: 'appoint__block' }, [
        el('span', { class: 'finale__label mono caps', text: t('appoint.stagesLabel') }),
        el('div', { class: 'appoint__stages' }, stageRows)
      ]),

      el('section', { class: 'appoint__block' }, [
        el('span', { class: 'finale__label mono caps', text: t('appoint.itemsLabel') }),
        el('div', { class: 'appoint__items' }, itemCards)
      ]),

      el('div', { class: 'appoint__badge' }, [
        el('img', { class: 'appoint__badge-img', src: ASSETS.logos.badgeBlack, alt: t('appoint.rankTo') }),
        el('span', { class: 'appoint__badge-cap', text: t('appoint.badgeCaption') })
      ]),

      acceptBtn.el
    ])
  ])

  return {
    el: node,
    mounted () { if (ctx.audio) { ctx.audio.stopBgm(); ctx.audio.stopSfx() } },
    destroy () {
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      acceptBtn.destroy()
    }
  }
}
