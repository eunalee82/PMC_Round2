// Copy manager — resolves UI strings (base + DEV overrides) and powers inline click-to-edit.
// t(key): current string. copyEl / bindCopy: create/bind an element whose text is the key.
// enableCopyEdit(true): make bound elements contenteditable; edits persist to localStorage.
// exportCopy(): JSON of overrides (to paste back into constants/copy.js). Prod never enables editing.
import { el } from '../utils/dom.js'
import { COPY } from '../constants/copy.js'

const KEY = 'pmb.copy.v1'
const registry = new Map() // key -> Set<HTMLElement>
let overrides = load()
let editing = false

function load () { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
function persist () { try { localStorage.setItem(KEY, JSON.stringify(overrides)) } catch { /* storage off */ } }

export function t (key) {
  return (Object.prototype.hasOwnProperty.call(overrides, key) ? overrides[key] : COPY[key]) ?? ''
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
  overrides[key] = value
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
