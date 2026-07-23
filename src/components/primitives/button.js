// Button — see CLAUDE.md §9 component contract.
// createButton(props) -> { el, update, destroy }
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'

const VARIANTS = ['primary', 'secondary', 'ghost', 'stage', 'danger', 'gold']
const SIZES = ['sm', 'md', 'lg']

export function createButton (props = {}) {
  const state = {
    label: '',
    variant: 'primary',
    size: 'md',
    icon: null,
    disabled: false,
    loading: false,
    block: false,
    type: 'button',
    onClick: null,
    ...props
  }

  const spinner = el('span', { class: 'btn__spinner', 'aria-hidden': 'true' })
  const iconSlot = el('span', { class: 'btn__icon' })
  const labelSlot = el('span', { class: 'btn__label' })

  const node = el('button', {
    type: state.type,
    on: {
      click: (e) => {
        if (state.disabled || state.loading) return
        if (typeof state.onClick === 'function') state.onClick(e)
      }
    }
  }, [spinner, iconSlot, labelSlot])

  function render () {
    const variant = VARIANTS.includes(state.variant) ? state.variant : 'primary'
    const size = SIZES.includes(state.size) ? state.size : 'md'
    node.className = ['btn', `btn--${variant}`, `btn--${size}`, state.block && 'btn--block', state.loading && 'is-loading']
      .filter(Boolean)
      .join(' ')
    node.disabled = !!state.disabled
    node.setAttribute('aria-busy', state.loading ? 'true' : 'false')

    iconSlot.replaceChildren()
    if (state.icon) iconSlot.append(icon(state.icon, { size: size === 'lg' ? 20 : 18 }))
    iconSlot.style.display = state.icon ? '' : 'none'

    labelSlot.textContent = state.label ?? ''
  }

  render()

  return {
    el: node,
    update (next = {}) { Object.assign(state, next); render() },
    destroy () { node.remove() }
  }
}
