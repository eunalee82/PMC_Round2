// 관리자 콘솔 (SCR-101 축소판) — `?admin` 으로 진입. 참가자 흐름과 분리된 게임 제어 화면.
// 기능은 4가지로 제한한다(설계 §1): 게임 시작 · 게임 종료 · 팀 현황 · 점수 조회.
//
// 인증: 서버 모드에서는 **Supabase Auth(이메일+비밀번호)** 로 로그인하고, 서버가 `admins` 테이블로
//       권한을 확인한다(RPC 내부 is_admin()). 비밀번호를 번들에 넣지 않는다 (CLAUDE.md §11).
//       mock 모드에서는 예전처럼 로컬 비밀번호 게이트를 쓴다(오프라인 리허설용).
// 문제(사건) CRUD 는 만들지 않는다 — 사건 본문은 cases.js 가 단일 출처.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { supabase, isServerMode } from '../../lib/supabase.js'
import { getStatus, getStartedAt, remainingSeconds, subscribe, initGame, startGame, endGame, extendGame, resetGame, getConnection, subscribeConnection } from '../../lib/game.js'
import { resetAllProgress } from '../../lib/progress.js'
import { createButton } from '../../../components/primitives/button.js'
import { createRankingView } from './ranking.js'
import { createTeamStatusView } from './team-status.js'

const MOCK_PASSWORD = '2026' // mock 모드 전용(서버 모드에서는 쓰이지 않는다)

// 장애 대응용 연장 단위 — 한 번에 크게 늘리기보다 필요한 만큼 눌러 쌓는다(연타 누적).
// 전 팀 공통으로 적용된다(games 단일 로우). see operation-checklist.md §8.4 (C)
const EXTEND_MINUTES = 5

// 연결 상태 표기 — 운영진이 실시간 전파가 살아 있는지 한눈에 봐야 한다 (operation-checklist.md §6)
const CONN_TEXT = {
  realtime: { text: 'REALTIME · 실시간 전파', cls: 'is-on' },
  polling: { text: 'POLLING · 5초 확인 (Realtime 없음)', cls: 'is-wait' },
  connecting: { text: 'CONNECTING…', cls: 'is-wait' },
  offline: { text: 'OFFLINE · 서버 연결 없음', cls: 'is-off' },
  local: { text: 'LOCAL · mock 모드', cls: 'is-off' }
}

function pad (n) { return String(n).padStart(2, '0') }
function fmtStamp (ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function fmtClock (sec) {
  const s = Math.max(0, sec)
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

export function mountAdmin (root) {
  const box = el('div', { class: 'admin' })
  root.append(box)
  let unsub = null
  let overlay = null // 팀 현황 / 최종 랭킹 (전체 화면)

  function closeOverlay () {
    if (overlay) { overlay.destroy(); overlay = null }
    box.hidden = false
    renderConsole()
  }
  function openOverlay (factory) {
    if (overlay) overlay.destroy()
    overlay = factory({ onClose: closeOverlay })
    box.hidden = true
    root.append(overlay.el)
  }

  // ── 로그인 화면 ──────────────────────────────────────────────
  function renderGate () {
    const server = isServerMode()
    const emailInput = el('input', { class: 'field', type: 'email', autocomplete: 'username', placeholder: '관리자 이메일' })
    const passInput = el('input', {
      class: 'field', type: 'password', autocomplete: 'current-password',
      placeholder: server ? '비밀번호' : '관리자 비밀번호'
    })
    const err = el('p', { class: 'auth-error' })
    const btn = createButton({
      label: '로그인', variant: 'primary', size: 'lg', icon: 'logIn', block: true,
      onClick: () => submit()
    })

    async function submit () {
      err.textContent = ''
      if (!server) {
        // mock 모드: 로컬 비밀번호만 확인 (서버가 없으므로 권한 검증도 없다)
        if (passInput.value === MOCK_PASSWORD) {
          try { sessionStorage.setItem('pmb.admin.unlocked', '1') } catch { /* ignore */ }
          renderConsole()
        } else {
          err.textContent = '비밀번호가 올바르지 않습니다.'
          passInput.value = ''
          passInput.focus()
        }
        return
      }
      btn.update({ loading: true, label: '확인 중…' })
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailInput.value.trim(),
          password: passInput.value
        })
        if (error) throw error
        await initGame().catch(() => {})
        renderConsole()
      } catch (e) {
        // 실패 원인을 숨기지 않는다 — 행사 현장에서 원인 파악이 늦어지면 진행이 멈춘다.
        const msg = (e && e.message) || ''
        console.error('[admin] 로그인 실패', e)
        if (/Invalid login credentials/i.test(msg)) {
          err.textContent = '이메일 또는 비밀번호가 맞지 않습니다. (계정이 아직 생성되지 않았을 수도 있습니다)'
        } else if (/Email not confirmed/i.test(msg)) {
          err.textContent = '계정이 아직 확인(confirm)되지 않았습니다. 대시보드에서 사용자를 Auto Confirm 으로 생성하거나 확인 처리하십시오.'
        } else if (/rate limit|too many/i.test(msg)) {
          err.textContent = '시도가 너무 많습니다. 잠시 후 다시 시도하십시오.'
        } else if (/fetch|network|Failed to fetch/i.test(msg)) {
          err.textContent = '서버에 연결할 수 없습니다. 네트워크를 확인하십시오.'
        } else {
          err.textContent = `로그인 실패: ${msg || '알 수 없는 오류'}`
        }
        passInput.value = ''
        passInput.focus()
      } finally {
        btn.update({ loading: false, label: '로그인' })
      }
    }

    passInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    emailInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') passInput.focus() })

    box.replaceChildren(el('div', { class: 'admin__card' }, [
      el('span', { class: 'admin__eyebrow mono caps', text: 'PMB ADMIN CONSOLE' }),
      el('h1', { class: 'admin__title', text: '관리자 콘솔' }),
      el('p', { class: 'admin__lead', text: server ? '관리자 계정으로 로그인하십시오.' : '오프라인(mock) 모드입니다. 로컬 비밀번호로 진행합니다.' }),
      server ? emailInput : null,
      passInput,
      err,
      btn.el,
      server ? null : el('p', { class: 'admin__warn' }, [
        icon('alert', { size: 14 }),
        el('span', { text: 'mock 모드에서는 제어가 이 브라우저에만 적용됩니다.' })
      ])
    ]))
    setTimeout(() => (server ? emailInput : passInput).focus(), 50)
  }

  // ── 콘솔 ────────────────────────────────────────────────────
  function renderConsole () {
    if (unsub) { unsub(); unsub = null }

    const statusVal = el('span', { class: 'admin__status-val mono' })
    const startedVal = el('span', { class: 'admin__meta-val mono' })
    const remainVal = el('span', { class: 'admin__meta-val mono' })
    const connVal = el('span', { class: 'admin__status-val mono' })
    const err = el('p', { class: 'auth-error' })

    const guard = (btn, fn, confirmMsg) => async () => {
      err.textContent = ''
      if (confirmMsg && !window.confirm(confirmMsg)) return
      btn.update({ loading: true })
      try { await fn() } catch (e) {
        const code = e && e.code
        err.textContent = code === 'forbidden'
          ? '관리자 권한이 없습니다. admins 테이블에 등록된 계정으로 로그인하십시오.'
          // 연장은 진행 중일 때만 허용된다(0014) — 종료된 게임을 연장하면 제출이 조용히 다시 열린다.
          : code === 'game_not_started'
            ? '진행 중일 때만 연장할 수 있습니다. 종료를 되돌리려면 운영 체크리스트 §8.10 (5)를 따르십시오.'
            : '요청이 실패했습니다. 네트워크를 확인한 뒤 다시 시도하십시오.'
      } finally { btn.update({ loading: false }); refresh() }
    }

    const startBtn = createButton({ label: '게임 시작', variant: 'primary', size: 'lg', icon: 'crosshair', block: true })
    startBtn.update({ onClick: guard(startBtn, () => startGame(), '게임을 시작합니다. 모든 팀의 미션 타이머가 서버 시각으로 함께 시작됩니다. 계속하시겠습니까?') })

    const endBtn = createButton({ label: '게임 종료', variant: 'danger', size: 'lg', icon: 'alert', block: true })
    endBtn.update({ onClick: guard(endBtn, () => endGame(), '게임을 종료합니다. 이후 모든 팀의 답안 제출이 차단됩니다. 계속하시겠습니까?') })

    const extendBtn = createButton({ label: `+${EXTEND_MINUTES}분 연장`, variant: 'secondary', size: 'md', icon: 'clock', block: true })
    extendBtn.update({
      onClick: guard(extendBtn, () => extendGame(EXTEND_MINUTES),
        `남은 시간을 ${EXTEND_MINUTES}분 연장합니다.\n\n※ 특정 팀만이 아니라 참가 중인 모든 팀에 함께 적용됩니다.\n※ 연장 후에는 참가자에게 방송으로 알리십시오.\n\n계속하시겠습니까?`)
    })

    const teamsBtn = createButton({ label: '팀 현황', variant: 'secondary', size: 'md', icon: 'users', block: true, onClick: () => openOverlay(createTeamStatusView) })
    const rankBtn = createButton({ label: '최종 랭킹 발표', variant: 'gold', size: 'md', icon: 'award', block: true, onClick: () => openOverlay(createRankingView) })

    const resetBtn = createButton({ label: '대기 상태로 되돌리기 (리허설)', variant: 'ghost', size: 'md', icon: 'refresh', block: true })
    resetBtn.update({
      onClick: guard(resetBtn, async () => {
        // 참가자 기기의 로컬 흔적(세션·언어·진행 캐시)은 상태가 'scheduled' 로 바뀌는 것을 보고
        // 각 기기가 스스로 지운다 — flow.js 의 subscribeGame 참조(운영 요청 2026-08-10).
        const wipe = window.confirm('진행 데이터(제출·점수·입장)도 함께 초기화하시겠습니까?\n\n[확인] 전부 초기화 · [취소] 게임 상태만 대기로 되돌리기\n\n※ 어느 쪽이든 접속 중인 참가자 기기는 저장된 세션·언어 선택을 지우고 첫 화면으로 돌아갑니다.')
        await resetGame(wipe)
        if (!isServerMode()) resetAllProgress()
      })
    })

    function refresh () {
      const s = getStatus()
      const label = s === 'started' ? 'STARTED · 진행 중' : s === 'ended' ? 'ENDED · 종료' : 'SCHEDULED · 대기'
      statusVal.textContent = label
      statusVal.className = 'admin__status-val mono ' + (s === 'started' ? 'is-on' : s === 'ended' ? 'is-off' : 'is-wait')
      startedVal.textContent = fmtStamp(getStartedAt())
      remainVal.textContent = s === 'started' ? fmtClock(remainingSeconds()) : '—'
      startBtn.update({ disabled: s === 'started' })
      endBtn.update({ disabled: s !== 'started' })
      extendBtn.update({ disabled: s !== 'started' }) // 서버도 같은 조건으로 거부한다(0014)
    }
    function paintConn (mode) {
      const c = CONN_TEXT[mode] || CONN_TEXT.connecting
      connVal.textContent = c.text
      connVal.className = 'admin__status-val mono ' + c.cls
    }
    paintConn(getConnection())
    if (box.__unsubConn) box.__unsubConn()
    box.__unsubConn = subscribeConnection(paintConn)

    unsub = subscribe(refresh)
    refresh()
    const tick = setInterval(refresh, 1000) // 남은 시간 표시
    box.__tick && clearInterval(box.__tick)
    box.__tick = tick

    const row = (k, v) => el('div', { class: 'admin__row' }, [
      el('span', { class: 'admin__row-key mono caps', text: k }), v
    ])

    box.replaceChildren(el('div', { class: 'admin__card' }, [
      el('div', { class: 'admin__head' }, [
        el('span', { class: 'admin__eyebrow mono caps', text: 'PMB ADMIN CONSOLE' }),
        el('h1', { class: 'admin__title', text: '게임 제어' })
      ]),
      row('GAME STATUS', statusVal),
      row('CONNECTION', connVal),
      row('STARTED AT', startedVal),
      row('TIME LEFT', remainVal),
      el('div', { class: 'admin__actions' }, [startBtn.el, endBtn.el, extendBtn.el, teamsBtn.el, rankBtn.el, resetBtn.el]),
      err,
      el('a', { class: 'admin__link', href: '/', target: '_blank', rel: 'noopener' }, [
        icon('logIn', { size: 14 }), el('span', { text: '참가자 화면 새 탭으로 열기' })
      ]),
      isServerMode()
        ? el('p', { class: 'admin__note mono', text: `서버 연결 · 시작/종료 시각은 서버 시계 기준` })
        : el('p', { class: 'admin__warn' }, [
          icon('alert', { size: 14 }),
          el('span', { text: '주의(MOCK): 제어가 같은 브라우저의 탭에만 전달됩니다. 다른 기기로 전파하려면 서버 모드로 실행하십시오.' })
        ])
    ]))
  }

  // ── 진입 판정 ──
  async function enter () {
    if (isServerMode()) {
      const { data } = await supabase.auth.getSession()
      if (data && data.session) { await initGame().catch(() => {}); renderConsole() } else renderGate()
      return
    }
    let unlocked = false
    try { unlocked = sessionStorage.getItem('pmb.admin.unlocked') === '1' } catch { unlocked = false }
    if (unlocked) renderConsole()
    else renderGate()
  }
  enter()

  return {
    el: box,
    destroy () {
      if (unsub) unsub()
      if (box.__unsubConn) box.__unsubConn()
      if (box.__tick) clearInterval(box.__tick)
      if (overlay) { overlay.destroy(); overlay = null }
    }
  }
}
