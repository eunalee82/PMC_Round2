// Flow controller — the entry-flow state machine.
// Owns the persisted session (localStorage), renders the active screen into `root`,
// runs fade transitions, and enforces step guards on resume/navigation.
import { FLOW, resolveStep } from './constants/flow.js'
import { createAudioManager } from './lib/audio.js'
import { clearCopyBindings, t } from './lib/copy.js'
import { getDeviceId, ownsTeam, releaseTeam, subscribe as subscribeEntries } from './lib/entries.js'
import { isStarted } from './lib/game.js'
import { el } from './utils/dom.js'
import { createModal } from '../components/primitives/modal.js'
import { createEntryScreen } from './screens/participant/entry.js'
import { createOpeningScreen } from './screens/participant/opening.js'
import { createTeamScreen } from './screens/participant/team-selection.js'
import { createOathScreen } from './screens/participant/oath.js'
import { createWaitingScreen } from './screens/participant/waiting-room.js'
import { createCaseScreen } from './screens/gameplay/case.js'

const KEY = 'pmb.session.v1'

// Factory, not a shared literal — memberEmails must not be a reference shared across resets.
function defaults () {
  return {
    step: FLOW.ENTRY,
    teamId: null,
    memberEmails: [], // 수사관 3명 (SCR-003) — 입장 = 등록 = 팀 점유
    enteredAt: null,
    signerName: '',
    pledgedAt: null,
    muted: false
  }
}

const SCREENS = {
  [FLOW.ENTRY]: createEntryScreen,
  [FLOW.OPENING]: createOpeningScreen,
  [FLOW.TEAM]: createTeamScreen,
  [FLOW.OATH]: createOathScreen,
  [FLOW.WAITING]: createWaitingScreen,
  [FLOW.CASE]: createCaseScreen
}

function load () {
  try { return { ...defaults(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) } } catch { return defaults() }
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

  let releaseModal = null

  // 운영진이 입장을 해제했거나 다른 기기가 팀을 이어받으면 이 기기는 더 진행할 수 없다.
  // 팀 관련 세션을 비우고 팀 선택으로 되돌린다. see docs/screen-list.md SCR-003.
  function assertClaim ({ notify = true } = {}) {
    if (!session.teamId || ownsTeam(session.teamId, getDeviceId())) return true

    session = { ...session, teamId: null, memberEmails: [], enteredAt: null, pledgedAt: null }
    persist(session)

    if (notify && !releaseModal) {
      releaseModal = createModal({
        title: t('team.released.title'),
        size: 'sm',
        content: [el('p', { class: 'auth-hint', text: t('team.released.msg') })],
        actions: [{ label: t('team.released.confirm'), variant: 'primary' }],
        onClose: () => { releaseModal = null }
      })
      releaseModal.open()
    }
    return false
  }

  // 화면에 가만히 앉아 있는 동안 운영진이 입장을 해제해도 즉시 알아채야 한다.
  // 팀 선택 화면에 있으면 카드가 알아서 풀리므로 안내 모달은 띄우지 않는다.
  subscribeEntries(() => {
    if (session.step === FLOW.TEAM) return
    if (!assertClaim()) navigate(FLOW.TEAM, { skipGuard: true })
  })

  function navigate (step, { skipGuard = false } = {}) {
    // 이미 팀 선택으로 가는 길이면 굳이 알리지 않는다.
    if (!assertClaim({ notify: step !== FLOW.TEAM }) && !skipGuard) step = FLOW.TEAM
    const target = skipGuard ? step : resolveStep(step, session, { gameStarted: isStarted() })
    session.step = target
    persist(session)
    render(target)
  }

  return {
    start () { navigate(session.step) }, // resume — guard keeps it honest
    goTo: navigate,
    reset () {
      // DEV 초기화 — 점유한 팀도 함께 비워야 같은 팀으로 다시 테스트할 수 있다.
      if (session.teamId && ownsTeam(session.teamId, getDeviceId())) releaseTeam(session.teamId)
      session = defaults()
      persist(session)
      audio.stopBgm()
      navigate(FLOW.ENTRY, { skipGuard: true })
    },
    current () { return session.step }
  }
}
