// Modal — overlay dialog with ESC / backdrop close and focus restore.
// createModal(props) -> { el, open, close, destroy }
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { createButton } from './button.js'

export function createModal (props = {}) {
  const { title = '', content = null, actions = [], size = 'md', onClose = null } = props

  const closeBtn = el('button', {
    class: 'icon-btn', type: 'button', 'aria-label': '닫기',
    on: { click: () => close() }
  }, [icon('close', { size: 18 })])

  const bodyNodes = content == null ? [] : (Array.isArray(content) ? content : [content])
  const body = el('div', { class: 'modal__body' }, bodyNodes.map((c) => (c && c.nodeType ? c : document.createTextNode(String(c)))))

  const footerButtons = actions.map((a) => createButton({
    label: a.label,
    variant: a.variant || 'secondary',
    size: 'md',
    onClick: () => { if (a.onClick) a.onClick(); if (a.close !== false) close() }
  }))
  const footer = actions.length
    ? el('div', { class: 'modal__footer' }, footerButtons.map((b) => b.el))
    : null

  const dialog = el('div', {
    class: `modal modal--${size}`, role: 'dialog', 'aria-modal': 'true', tabindex: '-1'
  }, [
    el('div', { class: 'modal__header' }, [
      el('h2', { class: 'modal__title', text: title }),
      closeBtn
    ]),
    body,
    footer
  ])

  const overlay = el('div', { class: 'modal-overlay' }, [dialog])

  let prevFocus = null
  let isOpen = false

  function onKey (e) { if (e.key === 'Escape') close() }
  function onBackdrop (e) { if (e.target === overlay) close() }

  function open () {
    if (isOpen) return
    isOpen = true
    prevFocus = document.activeElement
    document.body.append(overlay)
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    overlay.addEventListener('mousedown', onBackdrop)
    requestAnimationFrame(() => {
      overlay.classList.add('is-open')
      dialog.focus()
    })
  }

  function close () {
    if (!isOpen) return
    isOpen = false
    overlay.classList.remove('is-open')
    document.removeEventListener('keydown', onKey)
    overlay.removeEventListener('mousedown', onBackdrop)
    document.body.style.overflow = ''
    setTimeout(() => {
      overlay.remove()
      if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus()
    }, 220)
    if (typeof onClose === 'function') onClose()
  }

  function destroy () {
    document.removeEventListener('keydown', onKey)
    overlay.removeEventListener('mousedown', onBackdrop)
    footerButtons.forEach((b) => b.destroy())
    overlay.remove()
    document.body.style.overflow = ''
  }

  return { el: overlay, open, close, destroy }
}
