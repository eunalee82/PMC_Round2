// ProgressBar — used for EXP / health / generic meters.
// createProgressBar(props) -> { el, update, destroy }
import { el } from '../../js/utils/dom.js'

export function createProgressBar (props = {}) {
  const state = { value: 0, max: 100, label: '', showValue: true, variant: 'primary', ...props }

  const fill = el('div', { class: 'pbar__fill' })
  const labelEl = el('span', {})
  const valueEl = el('span', {})
  const meta = el('div', { class: 'pbar__meta' }, [labelEl, valueEl])
  const track = el('div', { class: 'pbar__track' }, [fill])
  const node = el('div', {}, [meta, track])

  function render () {
    node.className = ['pbar', state.variant !== 'primary' && `pbar--${state.variant}`].filter(Boolean).join(' ')
    const pct = state.max > 0 ? Math.max(0, Math.min(100, (state.value / state.max) * 100)) : 0
    fill.style.width = `${pct}%`
    labelEl.textContent = state.label || ''
    valueEl.textContent = state.showValue ? `${state.value} / ${state.max}` : ''
    meta.style.display = state.label || state.showValue ? '' : 'none'
    node.setAttribute('role', 'progressbar')
    node.setAttribute('aria-valuenow', String(state.value))
    node.setAttribute('aria-valuemax', String(state.max))
  }

  render()

  return {
    el: node,
    update (next = {}) { Object.assign(state, next); render() },
    destroy () { node.remove() }
  }
}
