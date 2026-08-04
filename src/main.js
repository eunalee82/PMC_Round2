// App bootstrap — participant entry flow (Entry → Opening → Team → Oath → Waiting).
// Mock data only, no Supabase, no gameplay yet. Step is persisted to localStorage (resume on refresh).
// The design-system shell/components remain in the codebase for the gameplay dashboard (later phase).
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

// 로케일 — ?lang=ko|en 로 지정하면 그 언어로 시작(지속). 없으면 저장값(기본 ko).
const params = new URLSearchParams(location.search)
const lang = params.get('lang')
if (lang && LOCALES.includes(lang)) setLocale(lang)

const root = document.querySelector('#app')
root.replaceChildren()

const flowRoot = el('div', { id: 'flow-root' })
root.append(flowRoot)

// 관리자 콘솔 — ?admin 으로 진입(프로덕션 포함). 참가자 흐름과 분리된 게임 제어 화면.
if (new URLSearchParams(location.search).has('admin')) {
  mountAdmin(flowRoot)
} else {
  const flow = createFlow({ root: flowRoot })
  flow.start()

  // Dev-only jump menu — stripped from production builds (import.meta.env.DEV is false there).
  if (import.meta.env.DEV) {
    createDevMenu({ flow }).mount(document.body)
  }
}
