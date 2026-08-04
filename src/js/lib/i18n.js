// 로케일(언어) 상태 — 'ko' | 'en'. localStorage 지속. 기본 ko.
// 전체 UI/사건 텍스트가 이 단일 소스를 읽는다. en 콘텐츠가 준비되면 setLocale('en')로 한 번에 전환.
// (전환은 reload로 안전하게 재렌더 — 세션/진행 상태는 이미 localStorage에 있어 그대로 복구됨)
const KEY = 'pmb.locale'
const SUPPORTED = ['ko', 'en']
const DEFAULT = 'ko'

function read () {
  try { const v = localStorage.getItem(KEY); return SUPPORTED.includes(v) ? v : DEFAULT } catch { return DEFAULT }
}

let locale = read()
const listeners = new Set()

export const LOCALES = SUPPORTED
export function getLocale () { return locale }

export function setLocale (next, { reload = false } = {}) {
  if (!SUPPORTED.includes(next)) return
  const changed = next !== locale
  locale = next
  try { localStorage.setItem(KEY, next) } catch { /* storage off */ }
  if (changed) listeners.forEach((fn) => fn(locale))
  if (reload && changed && typeof location !== 'undefined') location.reload()
}

export function subscribeLocale (fn) { listeners.add(fn); return () => listeners.delete(fn) }
