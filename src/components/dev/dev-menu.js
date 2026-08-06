// Dev-only jump menu + inline copy editor. Mounted only when import.meta.env.DEV (see main.js).
// Additionally gated by a password (2026) so it can't be used casually on shared/preview builds.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { FLOW, FLOW_ORDER, FLOW_LABELS } from '../../js/constants/flow.js'
import { enableCopyEdit, isCopyEditing, exportCopy, resetCopy } from '../../js/lib/copy.js'
import { createTeamManager } from './team-manager.js'
import { createEntryMonitor } from './entry-monitor.js'
import { startGame, resetGame } from '../../js/lib/game.js'
import { resetAllProgress } from '../../js/lib/progress.js'
import { fastForwardToStage, fastForwardToFinale } from './stage-jump.js'
import { getLocale, setLocale } from '../../js/lib/i18n.js'

const DEV_PASSWORD = '2026'
const UNLOCK_KEY = 'pmb.dev.unlocked'

export function createDevMenu ({ flow }) {
  let unlocked = false
  try { unlocked = localStorage.getItem(UNLOCK_KEY) === '1' } catch { unlocked = false }

  // Re-render the current screen after team edits so changes show immediately.
  const rerender = () => flow.goTo(flow.current(), { skipGuard: true })
  const teamManager = createTeamManager({ onClose: rerender })
  const entryMonitor = createEntryMonitor({ onClose: rerender })

  const body = el('div', { class: 'devmenu__body' })

  function renderLocked () {
    const input = el('input', { class: 'devmenu__pass', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: '8', placeholder: '비밀번호' })
    const err = el('span', { class: 'devmenu__passerr' })
    function submit () {
      if (input.value === DEV_PASSWORD) {
        unlocked = true
        try { localStorage.setItem(UNLOCK_KEY, '1') } catch { /* ignore */ }
        renderBody()
      } else {
        err.textContent = '비밀번호가 올바르지 않습니다.'
        input.value = ''
        input.focus()
      }
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    const okBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: submit } }, ['잠금 해제'])
    body.replaceChildren(
      el('span', { class: 'devmenu__label', text: 'DEV 잠금 · 비밀번호 필요' }),
      input,
      okBtn,
      err
    )
    setTimeout(() => input.focus(), 40)
  }

  function renderUnlocked () {
    const jumpButtons = FLOW_ORDER.map((step) => el('button', {
      class: 'devmenu__jump', type: 'button',
      on: { click: () => flow.goTo(step, { skipGuard: true }) }
    }, [FLOW_LABELS[step]]))

    const editBtn = el('button', { class: 'devmenu__jump devmenu__editbtn', type: 'button' }, [isCopyEditing() ? '✏️ 편집 종료' : '✏️ 글씨 편집'])
    editBtn.classList.toggle('is-active', isCopyEditing())
    editBtn.addEventListener('click', () => {
      const next = !isCopyEditing()
      enableCopyEdit(next)
      editBtn.classList.toggle('is-active', next)
      editBtn.textContent = next ? '✏️ 편집 종료' : '✏️ 글씨 편집'
    })

    const exportBtn = el('button', { class: 'devmenu__jump', type: 'button' }, ['문구 내보내기'])
    exportBtn.addEventListener('click', async () => {
      const json = exportCopy()
      try { await navigator.clipboard.writeText(json) } catch { console.log('[copy overrides]\n' + json) }
      const prev = exportBtn.textContent
      exportBtn.textContent = '복사됨! (콘솔 출력)'
      setTimeout(() => { exportBtn.textContent = prev }, 1400)
    })

    const resetCopyBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: () => resetCopy() } }, ['문구 되돌리기'])

    // 언어 전환 — 현재 로케일의 반대로 토글 후 reload (en 미번역 키는 ko로 폴백).
    const langBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: () => setLocale(getLocale() === 'en' ? 'ko' : 'en', { reload: true }) } }, [`언어: ${getLocale() === 'en' ? 'EN → KO' : 'KO → EN'}`])

    const teamsBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: () => teamManager.open() } }, ['팀 관리 (이름·색상)'])
    const entriesBtn = el('button', { class: 'devmenu__jump', type: 'button', on: { click: () => entryMonitor.open() } }, ['입장 현황'])

    // 사건 점프 — 앞 스테이지를 '완료 처리'해서 그 스테이지부터 정상 흐름으로 진행한다.
    // (진행 판정을 우회하지 않는다 — stage-jump.js 주석 참고. 운영 빌드에는 이 코드가 없다.)
    const caseBtns = [1, 2, 3].map((s) => el('button', {
      class: 'devmenu__jump',
      type: 'button',
      on: { click: () => { fastForwardToStage(flow.teamId(), s); flow.goTo(FLOW.CASE, { skipGuard: true }) } }
    }, [`사건 · Stage ${s}`]))

    // 종반부 점프 — 감독관 임명 / Final Raid / 금배지·엔딩 / 최종 랭킹.
    const finaleBtns = [
      [FLOW.APPOINT, '감독관 임명', 'appoint'],
      [FLOW.RAID, 'Final Raid', 'raid'],
      [FLOW.ENDING, '금배지 · 마무리', 'ending']
      // 최종 랭킹은 참가자 흐름이 아니라 관리자 콘솔(?admin)에 있다.
    ].map(([step, label, ff]) => el('button', {
      class: 'devmenu__jump',
      type: 'button',
      on: { click: () => { fastForwardToFinale(flow.teamId(), ff); flow.goTo(step, { skipGuard: true }) } }
    }, [label]))
    // 관리자 Start 흉내 — 대기실이 구독 중이면 자동으로 Stage 1로 전환된다 (lib/game.js).
    // ⚠️ 서버 모드에서는 관리자 액션이 서버 `is_admin()` 검증을 거친다 → DEV 메뉴로는 'forbidden'이 난다.
    //    이전 판은 실패한 Promise를 그대로 버려서 "눌러도 아무 일이 없다"로 보였다(원인 파악 불가).
    //    실패 사유를 버튼에 직접 띄운다 — DEV 도구라 별도 토스트 대신 라벨을 임시로 바꾼다.
    const adminAction = (btn, label, fn) => async () => {
      btn.disabled = true
      btn.textContent = '실행 중…'
      try {
        await fn()
        btn.textContent = label
      } catch (err) {
        const forbidden = err && (err.code === 'forbidden' || err.code === '42501')
        btn.textContent = forbidden ? '권한 없음 — ?admin 로그인 필요' : `실패: ${(err && err.code) || 'unknown'}`
        console.warn('[dev] 관리자 액션 실패 —', err)
        setTimeout(() => { btn.textContent = label }, 4000)
      } finally {
        btn.disabled = false
      }
    }
    const startLabel = '관리자: 게임 시작 ▶'
    const startGameBtn = el('button', { class: 'devmenu__jump', type: 'button' }, [startLabel])
    startGameBtn.addEventListener('click', adminAction(startGameBtn, startLabel, () => startGame()))
    const resetLabel = '대기 상태로 되돌리기'
    const resetGameBtn = el('button', { class: 'devmenu__jump', type: 'button' }, [resetLabel])
    resetGameBtn.addEventListener('click', adminAction(resetGameBtn, resetLabel, async () => {
      await resetGame()
      resetAllProgress()
    }))

    body.replaceChildren(
      el('span', { class: 'devmenu__label', text: 'JUMP TO SCREEN' }),
      el('div', { class: 'devmenu__jumps' }, jumpButtons),
      el('div', { class: 'devmenu__divider' }),
      el('span', { class: 'devmenu__label', text: 'GAMEPLAY (게임)' }),
      el('div', { class: 'devmenu__jumps' }, [startGameBtn, resetGameBtn, ...caseBtns]),
      el('div', { class: 'devmenu__divider' }),
      el('span', { class: 'devmenu__label', text: 'FINALE (종반부)' }),
      el('div', { class: 'devmenu__jumps' }, finaleBtns),
      el('div', { class: 'devmenu__divider' }),
      el('span', { class: 'devmenu__label', text: 'TEAMS (팀)' }),
      el('div', { class: 'devmenu__jumps' }, [teamsBtn, entriesBtn]),
      el('div', { class: 'devmenu__divider' }),
      el('span', { class: 'devmenu__label', text: 'COPY (문구) · LANG' }),
      el('div', { class: 'devmenu__jumps' }, [editBtn, exportBtn, resetCopyBtn, langBtn]),
      el('div', { class: 'devmenu__divider' }),
      el('button', { class: 'devmenu__reset', type: 'button', on: { click: () => flow.reset() } }, [icon('refresh', { size: 14 }), el('span', { text: '세션 초기화' })])
    )
  }

  function renderBody () { unlocked ? renderUnlocked() : renderLocked() }

  const toggle = el('button', { class: 'devmenu__toggle', type: 'button', 'aria-label': '개발자 메뉴' }, [
    icon('settings', { size: 16 }),
    el('span', { text: 'DEV' })
  ])

  const panel = el('div', { class: 'devmenu', dataset: { open: 'false' } }, [toggle, body])
  toggle.addEventListener('click', () => {
    const open = panel.dataset.open !== 'true'
    panel.dataset.open = open ? 'true' : 'false'
    if (open) renderBody()
  })

  return {
    el: panel,
    mount (parent) { parent.append(panel); return panel },
    destroy () { teamManager.destroy(); entryMonitor.destroy(); panel.remove() }
  }
}
