// Flow controller — the entry-flow state machine.
// Owns the persisted session (localStorage), renders the active screen into `root`,
// runs fade transitions, and enforces step guards on resume/navigation.
import { FLOW, resolveStep } from './constants/flow.js'
import { createAudioManager } from './lib/audio.js'
import { clearCopyBindings } from './lib/copy.js'
import { createEntryScreen } from './screens/participant/entry.js'
import { createOpeningScreen } from './screens/participant/opening.js'
import { createTeamScreen } from './screens/participant/team-selection.js'
import { createOathScreen } from './screens/participant/oath.js'
import { createWaitingScreen } from './screens/participant/waiting-room.js'

const KEY = 'pmb.session.v1'
const DEFAULT = { step: FLOW.ENTRY, teamId: null, signerName: '', pledgedAt: null, muted: false }

const SCREENS = {
  [FLOW.ENTRY]: createEntryScreen,
  [FLOW.OPENING]: createOpeningScreen,
  [FLOW.TEAM]: createTeamScreen,
  [FLOW.OATH]: createOathScreen,
  [FLOW.WAITING]: createWaitingScreen
}

function load () {
  try { return { ...DEFAULT, ...(JSON.parse(localStorage.getItem(KEY)) || {}) } } catch { return { ...DEFAULT } }
}
function persist (session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)) } catch { /* storage unavailable — run in-memory */ }
}
function wait (ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

export function createFlow ({ root }) {
  let session = load()
  let current = null
  const audio = createAudioManager({ muted: session.muted })

  const ctx = {
    get session () { return session },
    update (patch) { session = { ...session, ...patch }; persist(session) },
    goTo (step, opts) { navigate(step, opts) },
    audio
  }

  async function render (step) {
    const factory = SCREENS[step]
    if (!factory) return

    if (current) {
      root.classList.add('is-leaving')
      await wait(200)
      if (current.destroy) current.destroy()
      current = null
    }

    clearCopyBindings() // only track live screen's editable text
    const screen = factory(ctx)
    current = screen
    root.replaceChildren(screen.el)
    root.classList.remove('is-leaving')
    if (screen.mounted) screen.mounted()
  }

  function navigate (step, { skipGuard = false } = {}) {
    const target = skipGuard ? step : resolveStep(step, session)
    session.step = target
    persist(session)
    render(target)
  }

  return {
    start () { navigate(session.step) }, // resume — guard keeps it honest
    goTo: navigate,
    reset () {
      session = { ...DEFAULT }
      persist(session)
      audio.stopBgm()
      navigate(FLOW.ENTRY, { skipGuard: true })
    },
    current () { return session.step }
  }
}
