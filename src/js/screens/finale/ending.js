// SCR-020 금배지 수여식 + SCR-023 종료 안내 — **한 화면**. 참가자 흐름의 마지막 화면.
//
// 운영 결정(2026-08-04): 최종 결과(랭킹) 확인은 감독관이 관리자 콘솔(?admin)에서 한다 → 순위를 띄우지 않는다.
// 운영 결정(2026-08-10):
//   · 국장 최종 메시지를 뺐다 — 마지막 화면에서 읽어야 하는 건 "다음에 무슨 일이 일어나는가"다.
//   · **두 장면(금배지 수여식 → 종료 안내)을 하나로 합쳤다.** 사이의 [예선 2라운드 끝내기] 클릭이
//     사라졌고, 금배지가 화면의 주인이다. 전원 이미지는 배지와 겹쳐 화면이 넘치므로 뺐다.
//   · [브라우저 종료하기]로 마무리한다.
import { el } from '../../utils/dom.js'
import { t } from '../../lib/copy.js'
import { ASSETS } from '../../constants/assets.js'
import { findTeam } from '../../lib/teams.js'
import { getProgress, recordFinale } from '../../lib/progress.js'
import { isEnded } from '../../lib/game.js'
import { allStagesCleared } from '../../lib/stage-progress.js'
import { createButton } from '../../../components/primitives/button.js'

export function createEndingScreen (ctx) {
  const teamId = ctx.session.teamId
  const team = findTeam(teamId)
  const teamName = team ? team.name : 'UNASSIGNED'

  const prevStage = document.documentElement.dataset.stage
  document.documentElement.dataset.stage = 'ending' // 엔딩 = Gold 국면 (§21)

  // 관리자 강제 종료·타임오버로 끌려온 미완주 팀(Stage 미완 · 금배지 전)에게는 금배지 연출을 주지 않는다
  // — 놀지 않은 팀에게 수여식을 보여주지 않기 위해서다(운영 요청 2026-08-07).
  const finale = getProgress(teamId).finale
  const forcedEnd = isEnded() && !finale.badgeAt && !allStagesCleared(teamId)
  const withBadge = !forcedEnd

  // 저장 시점: 금배지 수여 + 게임 종료 (§18). 화면을 막지 않는다 — 저장을 기다리다 종반부 진입이
  // 멈춘 적이 있다(커밋 040d07b). record_milestone 은 **호출당 하나**만 기록하므로 순서대로 두 번 부른다.
  // 미완주 팀은 호출하지 않는다 — 서버가 stages_cleared 를 요구해 어차피 거부된다.
  if (withBadge) {
    ;(async () => {
      if (!finale.badgeAt) await recordFinale(teamId, { badgeAt: Date.now() })
      if (!finale.endedAt) await recordFinale(teamId, { endedAt: Date.now() })
    })()
  }

  const progress = getProgress(teamId)
  const solved = progress.solved.length
  const stat = (k, v) => el('div', { class: 'gameend__stat' }, [
    el('span', { class: 'gameend__stat-val mono', text: v }),
    el('span', { class: 'gameend__stat-key caps', text: k })
  ])

  // 브라우저 종료 — 스크립트로 열지 않은 탭은 window.close()가 무시되므로(브라우저 정책) 성공 여부를
  // 알 수 없다. 시도와 동시에 직접 닫으라는 안내를 드러낸다.
  const closeHint = el('p', { class: 'gameend__wait', text: t('end.closeHint'), hidden: true })
  const closeBtn = createButton({
    label: t('end.close'), variant: 'ghost', size: 'md', icon: 'close',
    onClick: () => {
      closeHint.hidden = false
      try { window.close() } catch { /* 정책상 차단 — 안내 문구가 대신한다 */ }
    }
  })

  // 배지 이미지에 'PM보호국 / PM PROTECTION BUREAU' 가 이미 인쇄되어 있어 같은 문구를 화면에 다시
  // 적지 않는다(CLAUDE.md §16.2 와 같은 이유). 미완주 팀은 배지 대신 종료 안내 제목을 쓴다.
  const node = el('div', { class: 'screen screen--finale screen--ending' }, [
    el('div', { class: 'finale__inner' }, [
      el('div', { class: 'gameend anim-fade' }, [
        withBadge
          ? el('div', { class: 'ceremony__badge' }, [
            el('img', { class: 'ceremony__badge-img', src: ASSETS.logos.badgeGold, alt: t('badge.bureau') }),
            el('span', { class: 'ceremony__sweep', 'aria-hidden': 'true' })
          ])
          : null,
        el('span', { class: 'gameend__tag mono caps', text: withBadge ? t('badge.tag') : t('end.tag') }),
        el('h1', { class: 'gameend__title', text: withBadge ? t('badge.appointed') : t('end.title') }),
        el('div', { class: 'ceremony__team' }, [
          el('span', { class: 'ceremony__team-name', text: teamName }),
          el('span', { class: 'ceremony__team-rank mono caps', text: t('badge.rank') })
        ]),
        el('p', { class: 'gameend__msg', text: t('end.msg') }),
        el('div', { class: 'gameend__stats' }, [
          stat(t('end.rankLabel'), t('badge.rank')),
          stat(t('end.scoreLabel'), String(progress.score)),
          stat(t('rank.colSolved'), `${solved}/15`)
        ]),
        el('div', { class: 'gameend__actions' }, [closeBtn.el]),
        closeHint
      ])
    ])
  ])

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
      closeBtn.destroy()
    }
  }
}
