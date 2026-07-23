// Minimal DOM helpers. Keep component code declarative and event/cleanup consistent.
// see CLAUDE.md §9 (컴포넌트 계약) — components build DOM through el() so listeners are
// attached to their own subtree and are garbage-collected when the root is removed.

export function el (tag, attrs = {}, children = []) {
  const node = document.createElement(tag)

  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue

    if (key === 'class' || key === 'className') node.className = value
    else if (key === 'text') node.textContent = value
    else if (key === 'html') node.innerHTML = value // trusted/static markup only — never user input
    else if (key === 'dataset') Object.assign(node.dataset, value)
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value)
    else if (key === 'on' && typeof value === 'object') {
      for (const [event, fn] of Object.entries(value)) node.addEventListener(event, fn)
    } else if (key in node) {
      try { node[key] = value } catch { node.setAttribute(key, value) }
    } else {
      node.setAttribute(key, value)
    }
  }

  const kids = Array.isArray(children) ? children : [children]
  for (const child of kids) {
    if (child == null || child === false) continue
    node.append(child.nodeType ? child : document.createTextNode(String(child)))
  }

  return node
}

export function mount (parent, node) {
  parent.append(node)
  return node
}

export function clear (node) {
  node.replaceChildren()
}

// Safe text — use whenever rendering dynamic/user-provided strings.
export function escapeHtml (value) {
  const box = document.createElement('div')
  box.textContent = String(value)
  return box.innerHTML
}
