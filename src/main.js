// App bootstrap — 참가자 흐름(Entry → … → 종반부) + 관리자 콘솔(?admin).
// 서버 모드에서는 **게임 상태를 먼저 확보한 뒤** 라우터를 시작한다 — 라우터 가드가 gameStarted 를
// 근거로 화면을 고르기 때문에, 상태 없이 시작하면 대기실↔사건 화면이 한 번 튄다.
// 실패하면 화면을 죽이지 않고 재시도 안내를 띄운다 (docs/game-flow.md §19.1).
import './css/tokens.css'
import './css/base.css'
import './css/animations.css'
import './css/layout.css'
import './css/components.css'
import './css/screens.css'
import './css/gameplay.css'
import './css/finale.css'
import './css/admin.css'

import { el } from './js/utils/dom.js'
import { createFlow } from './js/flow.js'
import { createDevMenu } from './components/dev/dev-menu.js'
import { mountAdmin } from './js/screens/admin/admin.js'
import { setLocale, LOCALES } from './js/lib/i18n.js'
import { isServerMode } from './js/lib/supabase.js'
import { initGame } from './js/lib/game.js'

// 로케일 — ?lang=ko|en 로 지정하면 그 언어로 시작(지속). 없으면 저장값(기본 ko).
const params = new URLSearchParams(location.search)
const lang = params.get('lang')
if (lang && LOCALES.includes(lang)) setLocale(lang)

const root = document.querySelector('#app')
root.replaceChildren()

const flowRoot = el('div', { id: 'flow-root' })
root.append(flowRoot)

// 서버 상태 로드 실패 화면 — 새로고침 없이 재시도할 수 있게 둔다.
function showBootError (retry) {
  const btn = el('button', { class: 'btn btn--primary btn--lg', type: 'button', text: '다시 시도' })
  btn.addEventListener('click', () => { flowRoot.replaceChildren(); retry() })
  flowRoot.replaceChildren(el('div', { class: 'screen screen--form' }, [
    el('div', { class: 'form-screen__inner', style: { textAlign: 'center' } }, [
      el('h1', { class: 'form-screen__title', text: 'PM보호국 서버에 연결할 수 없습니다' }),
      el('p', { class: 'form-screen__lead', text: '네트워크를 확인한 뒤 다시 시도하십시오. 진행 상황은 서버에 안전하게 보관되어 있습니다.' }),
      el('div', { class: 'form-screen__actions', style: { justifyContent: 'center' } }, [btn])
    ])
  ]))
}

function startParticipantFlow () {
  const flow = createFlow({ root: flowRoot })
  flow.start()
  // Dev-only jump menu — stripped from production builds (import.meta.env.DEV is false there).
  if (import.meta.env.DEV) createDevMenu({ flow }).mount(document.body)
}

// 검수 전용 게이트 — VITE_REVIEW_GATE 빌드에서만 켜진다(참가자 입장 앞 비밀번호 2026).
// 행사 전 관리자 몇 명만 게임을 미리 리뷰할 때 쓰는 임시 잠금. 플래그가 없으면 이 게이트는
// 절대 뜨지 않으므로(런타임 false) 실 행사 빌드에는 영향이 없다 (CLAUDE.md §16.1: 잠시 제한).
function reviewLocked () {
  try { return sessionStorage.getItem('pmb.review.unlocked') !== '1' } catch { return true }
}
function showReviewGate (onPass) {
  const input = el('input', { class: 'field', type: 'password', autocomplete: 'off', placeholder: '검수 비밀번호' })
  const err = el('p', { class: 'auth-error' })
  const btn = el('button', { class: 'btn btn--primary btn--lg', type: 'button', text: '입장' })
  const submit = () => {
    if (input.value === '2026') {
      try { sessionStorage.setItem('pmb.review.unlocked', '1') } catch { /* ignore */ }
      onPass()
    } else {
      err.textContent = '비밀번호가 올바르지 않습니다.'
      input.value = ''
      input.focus()
    }
  }
  btn.addEventListener('click', submit)
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit() })
  flowRoot.replaceChildren(el('div', { class: 'screen screen--form' }, [
    el('div', { class: 'form-screen__inner', style: { textAlign: 'center' } }, [
      el('h1', { class: 'form-screen__title', text: '검수 전용 접속' }),
      el('p', { class: 'form-screen__lead', text: '검수 권한이 있는 인원만 접속할 수 있습니다. 비밀번호를 입력하십시오.' }),
      input, err,
      el('div', { class: 'form-screen__actions', style: { justifyContent: 'center' } }, [btn])
    ])
  ]))
  setTimeout(() => input.focus(), 50)
}

async function boot () {
  if (new URLSearchParams(location.search).has('admin')) {
    mountAdmin(flowRoot) // 관리자 콘솔은 자체적으로 로그인·상태를 다룬다
    return
  }
  // 검수 빌드에서만: 비밀번호(2026) 통과 전에는 참가자 흐름을 열지 않는다. 통과하면 boot 재실행.
  if (import.meta.env.VITE_REVIEW_GATE && reviewLocked()) {
    showReviewGate(boot)
    return
  }
  if (isServerMode()) {
    try {
      await initGame() // 게임 상태 + 서버 시간 + Realtime 구독
    } catch (err) {
      console.error('[boot] 게임 상태 로드 실패', err)
      showBootError(boot)
      return
    }
  }
  startParticipantFlow()
}

boot()
