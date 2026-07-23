// AppShell — composes the dashboard (Header · Left Sidebar · Main outlet).
// Right info panel is currently disabled (see main.js); the component remains for future use.
// Screens mount into `shell.content`. Sidebar becomes a drawer on small screens.
import { el } from '../../js/utils/dom.js'
import { createAppHeader } from './app-header.js'
import { createLeftSidebar } from './left-sidebar.js'

export function createAppShell (props = {}) {
  const { sidebar = {} } = props

  const scrim = el('div', { class: 'scrim', on: { click: () => closeSidebar() } })
  const fxOverlay = el('div', { class: 'fx-overlay', 'aria-hidden': 'true' })
  const content = el('div', { class: 'app-main__inner' })
  const main = el('main', { class: 'app-main', id: 'app-main' }, [content])

  const header = createAppHeader({
    ...props.header,
    onMenu: () => toggleSidebar()
  })
  const leftSidebar = createLeftSidebar(sidebar)

  const shellEl = el('div', { class: 'app-shell' }, [
    header.el,
    leftSidebar.el,
    main,
    scrim,
    fxOverlay
  ])

  function toggleSidebar () { shellEl.classList.toggle('is-sidebar-open') }
  function closeSidebar () { shellEl.classList.remove('is-sidebar-open') }

  return {
    el: shellEl,
    content,
    header,
    sidebar: leftSidebar,
    mount (parent) { parent.append(shellEl); return shellEl },
    destroy () {
      header.destroy()
      leftSidebar.destroy()
      shellEl.remove()
    }
  }
}
