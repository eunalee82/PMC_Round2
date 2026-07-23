// Loading / Error / Empty states — consistent placeholders for async & no-data cases.
// Each factory returns { el, destroy }.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { createButton } from '../primitives/button.js'

export function createLoadingState ({ message = '불러오는 중…' } = {}) {
  const node = el('div', { class: 'state state--loading', role: 'status', 'aria-live': 'polite' }, [
    el('div', { class: 'spinner' }),
    el('p', { class: 'state__msg', text: message })
  ])
  return { el: node, destroy () { node.remove() } }
}

export function createErrorState ({ title = '문제가 발생했습니다', message = '잠시 후 다시 시도해 주세요.', retryLabel = '다시 시도', onRetry = null } = {}) {
  let retryBtn = null
  const children = [
    el('div', { class: 'state__icon' }, [icon('alert', { size: 24 })]),
    el('h3', { class: 'state__title', text: title }),
    el('p', { class: 'state__msg', text: message })
  ]
  if (typeof onRetry === 'function') {
    retryBtn = createButton({ label: retryLabel, variant: 'secondary', size: 'sm', icon: 'refresh', onClick: onRetry })
    children.push(el('div', { class: 'state__action' }, [retryBtn.el]))
  }
  const node = el('div', { class: 'state state--error', role: 'alert' }, children)
  return { el: node, destroy () { if (retryBtn) retryBtn.destroy(); node.remove() } }
}

export function createEmptyState ({ title = '표시할 내용이 없습니다', message = '', iconName = 'inbox' } = {}) {
  const node = el('div', { class: 'state state--empty' }, [
    el('div', { class: 'state__icon' }, [icon(iconName, { size: 24 })]),
    el('h3', { class: 'state__title', text: title }),
    message ? el('p', { class: 'state__msg', text: message }) : null
  ])
  return { el: node, destroy () { node.remove() } }
}
