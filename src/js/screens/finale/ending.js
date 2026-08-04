// SCR-020 금배지 수여식 → SCR-023 종료 안내 — 참가자 흐름의 마지막 화면.
// 운영 결정(2026-08-04): 참가자는 금배지 수여(정식 감독관 임명)에서 [예선 2라운드 끝내기]로 마무리하고,
// **최종 결과(랭킹) 확인은 감독관이 관리자 콘솔(?admin)에서 수행한다.** 따라서 이 화면에는 순위를 띄우지 않는다.
// 국장 최종 메시지(docs/game-flow.md §14.2)와 전체 캐릭터 연출은 종료 안내 화면에 함께 담았다.
import { el } from '../../utils/dom.js'
import { t } from '../../lib/copy.js'
import { ASSETS } from '../../constants/assets.js'
import { findTeam } from '../../lib/teams.js'
import { getProgress, recordFinale } from '../../lib/progress.js'
import { createButton } from '../../../components/primitives/button.js'

export function createEndingScreen (ctx) {
  const teamId = ctx.session.teamId
  const team = findTeam(teamId)
  const teamName = team ? team.name : 'UNASSIGNED'

  const prevStage = document.documentElement.dataset.stage
  document.documentElement.dataset.stage = 'ending' // 엔딩 = Gold 국면 (§21)

  const host = el('div', { class: 'finale__inner' })
  const node = el('div', { class: 'screen screen--finale screen--ending' }, [host])

  let viewParts = []
  let nextParts = []
  const trackView = (c) => { nextParts.push(c); return c }
  const clearView = () => { viewParts.forEach((p) => p && p.destroy && p.destroy()); viewParts = [] }
  function mountPhase (content) {
    clearView()
    viewParts = nextParts
    nextParts = []
    host.replaceChildren(content)
    host.scrollTop = 0
    if (ctx.scrollToTop) ctx.scrollToTop() // 국면 전환 시 맨 위에서 시작
  }

  // ── SCR-020 금배지 수여식 (정식 감독관 임명) ──
  function showBadge () {
    recordFinale(teamId, { badgeAt: Date.now() }) // 저장 시점: 금배지 수여 (§18)
    const finishBtn = trackView(createButton({
      // 참가자 흐름은 여기서 끝난다 — 다음 라운드 안내는 운영진이 진행한다.
      label: t('badge.finish'), variant: 'gold', size: 'lg', icon: 'check', block: true,
      onClick: () => showGameEnd()
    }))
    mountPhase(el('div', { class: 'ceremony anim-fade' }, [
      el('div', { class: 'ceremony__badge' }, [
        el('img', { class: 'ceremony__badge-img', src: ASSETS.logos.badgeGold, alt: t('badge.bureau') }),
        el('span', { class: 'ceremony__sweep', 'aria-hidden': 'true' })
      ]),
      el('span', { class: 'ceremony__tag mono caps', text: t('badge.tag') }),
      el('span', { class: 'ceremony__bureau', text: t('badge.bureau') }),
      el('h1', { class: 'ceremony__title', text: t('badge.appointed') }),
      el('div', { class: 'ceremony__team' }, [
        el('span', { class: 'ceremony__team-name', text: teamName }),
        el('span', { class: 'ceremony__team-rank mono caps', text: t('badge.rank') })
      ]),
      finishBtn.el
    ]))
  }

  // ── SCR-023 종료 안내 — 순위는 표시하지 않는다(감독관 발표 대상). 총점은 진행 중 계속 보였던 값이라 유지. ──
  function showGameEnd () {
    recordFinale(teamId, { endedAt: Date.now() }) // 저장 시점: 게임 종료 (§18)
    const p = getProgress(teamId)
    const solved = p.solved.length
    const stat = (k, v) => el('div', { class: 'gameend__stat' }, [
      el('span', { class: 'gameend__stat-val mono', text: v }),
      el('span', { class: 'gameend__stat-key caps', text: k })
    ])
    mountPhase(el('div', { class: 'gameend anim-fade' }, [
      el('img', { class: 'gameend__members', src: ASSETS.characters.allMembers, alt: t('badge.bureau') }),
      el('span', { class: 'gameend__tag mono caps', text: t('end.tag') }),
      el('h1', { class: 'gameend__title', text: t('end.title') }),
      el('div', { class: 'ceremony__team' }, [
        el('span', { class: 'ceremony__team-name', text: teamName }),
        el('span', { class: 'ceremony__team-rank mono caps', text: t('badge.rank') })
      ]),
      // 국장 최종 메시지 (docs/game-flow.md §14.2)
      el('div', { class: 'ending__boss' }, [
        el('img', { class: 'ending__boss-img', src: ASSETS.characters.boss, alt: t('ending.bossLabel') }),
        el('div', { class: 'ending__boss-msg' }, [
          el('span', { class: 'ending__boss-label mono caps', text: t('ending.bossLabel') }),
          el('p', { class: 'ending__boss-text', text: t('ending.bossMessage') })
        ])
      ]),
      el('p', { class: 'gameend__msg', text: t('end.msg') }),
      el('div', { class: 'gameend__stats' }, [
        stat(t('end.rankLabel'), t('badge.rank')),
        stat(t('end.scoreLabel'), String(p.score)),
        stat(t('rank.colSolved'), `${solved}/15`)
      ]),
      // 최종 순위는 감독관이 발표한다 — 참가자 화면에서는 대기 안내만.
      el('p', { class: 'gameend__wait', text: t('end.wait') })
    ]))
  }

  // 재진입 판정 — 이미 마무리한 팀은 종료 안내로 복구한다 (CLAUDE.md §2).
  if (getProgress(teamId).finale.endedAt) showGameEnd()
  else showBadge()

  return {
    el: node,
    mounted () {
      if (!ctx.audio) return
      ctx.audio.stopBgm() // 수여식은 정적인 화면 — Raid BGM을 끊는다 (§22)
      ctx.audio.stopSfx()
    },
    destroy () {
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      clearView()
    }
  }
}
