// 관리자 콘솔 (SCR-101 축소판) — 프로덕션에서도 접근 가능한 게임 제어.
// 참가자 흐름과 분리되어 URL `?admin` 으로 진입한다 (main.js). DEV 메뉴는 프로덕션 빌드에서 제거되므로,
// 실제 배포본에서 게임을 시작/초기화할 수 있는 유일한 관리자 진입점이다.
// ⚠️ MOCK 한계: game 상태가 localStorage라 '같은 브라우저'에만 전파된다(다른 탭 O, 다른 기기 X).
//    실제 다중 기기 진행은 Supabase Realtime 연동(Step 3) 필요 — 그때 이 화면이 SCR-101로 확장된다.
// ⚠️ 비밀번호 게이트는 MOCK. 실제 운영은 Supabase Auth로 분리 (CLAUDE.md §11).
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { getStatus, getStartedAt, startGame, resetGame, subscribe } from '../../lib/game.js'
import { resetAllProgress } from '../../lib/progress.js'
import { createButton } from '../../../components/primitives/button.js'

const ADMIN_PASSWORD = '2026' // MOCK — 실제 운영은 서버 인증으로 대체

function pad (n) { return String(n).padStart(2, '0') }
function fmtStamp (ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export function mountAdmin (root) {
  const box = el('div', { class: 'admin' })
  root.append(box)
  let unsub = null

  function renderGate () {
    const input = el('input', { class: 'field', type: 'password', inputmode: 'numeric', autocomplete: 'off', maxlength: '12', placeholder: '관리자 비밀번호' })
    const err = el('p', { class: 'auth-error' })
    function submit () {
      if (input.value === ADMIN_PASSWORD) {
        try { sessionStorage.setItem('pmb.admin.unlocked', '1') } catch { /* ignore */ }
        renderConsole()
      } else {
        err.textContent = '비밀번호가 올바르지 않습니다.'
        input.value = ''
        input.focus()
      }
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
    const unlock = createButton({ label: '잠금 해제', variant: 'primary', size: 'lg', icon: 'logIn', block: true, onClick: submit })
    box.replaceChildren(el('div', { class: 'admin__card' }, [
      el('span', { class: 'admin__eyebrow mono caps', text: 'PMB ADMIN CONSOLE' }),
      el('h1', { class: 'admin__title', text: '관리자 콘솔' }),
      el('p', { class: 'admin__lead', text: '게임 진행을 제어합니다. 관리자만 접근하십시오.' }),
      input, err, unlock.el
    ]))
    setTimeout(() => input.focus(), 50)
  }

  function renderConsole () {
    if (unsub) { unsub(); unsub = null }

    const statusVal = el('span', { class: 'admin__status-val mono' })
    const startedVal = el('span', { class: 'admin__meta-val mono' })
    const startBtn = createButton({ label: '게임 시작', variant: 'primary', size: 'lg', icon: 'crosshair', block: true, onClick: () => startGame() })
    const resetBtn = createButton({ label: '대기 상태로 되돌리기', variant: 'ghost', size: 'md', icon: 'refresh', block: true, onClick: () => { resetGame(); resetAllProgress() } })

    function refresh () {
      const s = getStatus()
      const started = s === 'started'
      statusVal.textContent = started ? 'STARTED · 진행 중' : 'SCHEDULED · 대기'
      statusVal.className = 'admin__status-val mono ' + (started ? 'is-on' : 'is-wait')
      startedVal.textContent = fmtStamp(getStartedAt())
      startBtn.update({ disabled: started })
    }
    unsub = subscribe(refresh)
    refresh()

    box.replaceChildren(el('div', { class: 'admin__card' }, [
      el('div', { class: 'admin__head' }, [
        el('span', { class: 'admin__eyebrow mono caps', text: 'PMB ADMIN CONSOLE' }),
        el('h1', { class: 'admin__title', text: '게임 제어' })
      ]),
      el('div', { class: 'admin__row' }, [
        el('span', { class: 'admin__row-key mono caps', text: 'GAME STATUS' }), statusVal
      ]),
      el('div', { class: 'admin__row' }, [
        el('span', { class: 'admin__row-key mono caps', text: 'STARTED AT' }), startedVal
      ]),
      el('div', { class: 'admin__actions' }, [startBtn.el, resetBtn.el]),
      el('a', { class: 'admin__link', href: '/', target: '_blank', rel: 'noopener' }, [icon('logIn', { size: 14 }), el('span', { text: '참가자 화면 새 탭으로 열기' })]),
      el('p', { class: 'admin__warn' }, [
        icon('alert', { size: 14 }),
        el('span', { text: '주의(MOCK): 시작 신호는 같은 브라우저의 탭에만 전달됩니다. 다른 기기의 참가자에게 전파하려면 서버(Supabase) 연동이 필요합니다.' })
      ])
    ]))
  }

  let unlocked = false
  try { unlocked = sessionStorage.getItem('pmb.admin.unlocked') === '1' } catch { unlocked = false }
  if (unlocked) renderConsole()
  else renderGate()

  return { el: box, destroy () { if (unsub) unsub() } }
}
