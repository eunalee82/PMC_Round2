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

async function boot () {
  if (new URLSearchParams(location.search).has('admin')) {
    mountAdmin(flowRoot) // 관리자 콘솔은 자체적으로 로그인·상태를 다룬다
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
