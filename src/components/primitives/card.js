// Card — surface container with optional titled header.
// createCard(props) -> { el, setBody, destroy }
import { el } from '../../js/utils/dom.js'

function toNodes (content) {
  if (content == null) return []
  const items = Array.isArray(content) ? content : [content]
  return items.map((c) => (c && c.nodeType ? c : document.createTextNode(String(c))))
}

export function createCard (props = {}) {
  const { title = '', variant = 'default', glow = false, headerActions = null, body = null } = props

  const bodyEl = el('div', { class: 'card__body' }, toNodes(body))

  const children = []
  if (title || headerActions) {
    const head = el('div', { class: 'card__header' }, [
      el('h3', { class: 'card__title', text: title }),
      headerActions && headerActions.nodeType ? headerActions : null
    ])
    children.push(head)
  }
  children.push(bodyEl)

  const cls = ['card', variant !== 'default' && `card--${variant}`, glow && 'is-glow'].filter(Boolean).join(' ')
  const node = el('section', { class: cls }, children)

  return {
    el: node,
    body: bodyEl,
    setBody (content) { bodyEl.replaceChildren(...toNodes(content)) },
    destroy () { node.remove() }
  }
}
