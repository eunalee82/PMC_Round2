// Copy manager — 현재 로케일 기준으로 UI 문자열을 해석(base + DEV overrides)하고 인라인 편집을 지원.
// t(key): 현재 로케일 문자열(없으면 ko 폴백). copyEl / bindCopy: 키에 바인딩된 요소 생성/연결.
// enableCopyEdit(true): 바인딩 요소를 contenteditable로. 편집은 '현재 로케일' overrides로 저장.
// exportCopy(): overrides JSON(로케일별). 로케일 전환은 i18n.setLocale이 reload로 처리하므로 재렌더 걱정 없음.
import { el } from '../utils/dom.js'
import { COPY } from '../constants/copy.js'
import { getLocale } from './i18n.js'

const KEY = 'pmb.copy.v2' // v2: 로케일별 overrides { ko:{...}, en:{...} }
const registry = new Map() // key -> Set<HTMLElement>
let overrides = load()
let editing = false

function load () { try { const v = JSON.parse(localStorage.getItem(KEY)); return (v && typeof v === 'object') ? v : {} } catch { return {} } }
function persist () { try { localStorage.setItem(KEY, JSON.stringify(overrides)) } catch { /* storage off */ } }
function ov (locale) { return overrides[locale] || (overrides[locale] = {}) }

export function t (key) {
  const locale = getLocale()
  const o = overrides[locale]
  if (o && Object.prototype.hasOwnProperty.call(o, key)) return o[key] ?? ''
  const table = COPY[locale]
  if (table && table[key] != null) return table[key]
  return (COPY.ko && COPY.ko[key]) ?? '' // en 미번역 키 → ko 폴백
}

function applyEditable (node) {
  if (editing) { node.setAttribute('contenteditable', 'true'); node.classList.add('is-copy-editable') } else { node.removeAttribute('contenteditable'); node.classList.remove('is-copy-editable') }
}

function track (key, node) {
  if (!registry.has(key)) registry.set(key, new Set())
  registry.get(key).add(node)
  if (!node.__copyBound) {
    node.__copyBound = true
    node.addEventListener('input', () => setValue(key, node.textContent, node))
  }
  applyEditable(node)
}

function setValue (key, value, source) {
  ov(getLocale())[key] = value // 현재 로케일에만 저장
  persist()
  const set = registry.get(key)
  if (!set) return
  for (const n of set) {
    if (!n.isConnected) { set.delete(n); continue }
    if (n !== source && n.textContent !== value) n.textContent = value
  }
}

export function copyEl (tag, attrs, key) {
  const node = el(tag, { ...attrs })
  node.textContent = t(key)
  node.dataset.copy = key
  track(key, node)
  return node
}

export function bindCopy (node, key) {
  if (!node) return node
  node.textContent = t(key)
  node.dataset.copy = key
  track(key, node)
  return node
}

// Called by the flow on each screen change so the registry only tracks live elements.
export function clearCopyBindings () { registry.clear() }

// While editing, clicks on editable text must not trigger their host control (e.g. buttons).
function guardClick (e) {
  const target = e.target
  if (target && target.closest && target.closest('.is-copy-editable')) e.stopPropagation()
}

export function enableCopyEdit (on) {
  editing = on
  document.body.classList.toggle('copy-editing', on)
  for (const [, set] of registry) for (const n of set) applyEditable(n)
  if (on) {
    document.addEventListener('mousedown', guardClick, true)
    document.addEventListener('click', guardClick, true)
  } else {
    document.removeEventListener('mousedown', guardClick, true)
    document.removeEventListener('click', guardClick, true)
  }
}

export function isCopyEditing () { return editing }
export function exportCopy () { return JSON.stringify(overrides, null, 2) }

export function resetCopy () {
  overrides = {}
  persist()
  for (const [key, set] of registry) for (const n of set) { if (n.isConnected) n.textContent = t(key) }
}
