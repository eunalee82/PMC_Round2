// Flow controller — the entry-flow state machine.
// Owns the persisted session (localStorage), renders the active screen into `root`,
// runs fade transitions, and enforces step guards on resume/navigation.
import { FLOW, resolveStep } from './constants/flow.js'
import { createAudioManager } from './lib/audio.js'
import { clearCopyBindings, t } from './lib/copy.js'
import { getDeviceId, ownsTeam, releaseTeam, subscribe as subscribeEntries } from './lib/entries.js'
import { isStarted, isEnded, isTimeUp, subscribe as subscribeGame } from './lib/game.js'
import { isSoloMode } from './lib/mode.js'
import { SOLO_PLAYER_ID } from './lib/player.js'
import { clearParticipantState } from './lib/local-state.js'
import { getFinale, hydrateProgress, isHydrated, refreshRanking } from './lib/progress.js'
import { allStagesCleared } from './lib/stage-progress.js'
import { el } from './utils/dom.js'
import { createModal } from '../components/primitives/modal.js'
import { createEntryScreen } from './screens/participant/entry.js'
import { createOpeningScreen } from './screens/participant/opening.js'
import { createTeamScreen } from './screens/participant/team-selection.js'
import { createOathScreen } from './screens/participant/oath.js'
import { createWaitingScreen } from './screens/participant/waiting-room.js'
import { createCaseScreen } from './screens/gameplay/case.js'
import { createAppointmentScreen } from './screens/finale/appointment.js'
import { createRaidScreen } from './screens/finale/raid.js'
import { createEndingScreen } from './screens/finale/ending.js'

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
    // [처음으로]로 첫 화면에 나갔을 때 돌아올 지점 — 첫 화면의 [이어서 계속하기]가 이 값을 쓴다.
    resumeStep: null,
    muted: false
  }
}

const SCREENS = {
  [FLOW.ENTRY]: createEntryScreen,
  [FLOW.OPENING]: createOpeningScreen,
  [FLOW.TEAM]: createTeamScreen,
  [FLOW.OATH]: createOathScreen,
  [FLOW.WAITING]: createWaitingScreen,
  [FLOW.CASE]: createCaseScreen,
  // 종반부 — Stage 3 완료 후 (screen-list.md SCR-015~020 · 023).
  // 최종 랭킹(SCR-022)은 참가자 흐름이 아니라 관리자 콘솔에 있다 → screens/admin/ranking.js
  [FLOW.APPOINT]: createAppointmentScreen,
  [FLOW.RAID]: createRaidScreen,
  [FLOW.ENDING]: createEndingScreen
}

function load () {
  try { return normalize({ ...defaults(), ...(JSON.parse(localStorage.getItem(KEY)) || {}) }) } catch { return normalize(defaults()) }
}

// 모드가 바뀐 채로 옛 세션을 물려받으면 진행 기록의 주인이 어긋난다(연습 진행이 팀 점수로 보이거나,
// 팀 진행이 연습 화면에 뜬다). 반대편 모드의 세션은 통째로 버리고 첫 화면부터 다시 시작한다 —
// 서약·진행 지점만 남기면 행사에서 돌아온 사람이 오프닝도 서약도 없이 사건 화면에 떨어진다.
// 음소거 설정은 화면이 아니라 기기 취향이므로 유지한다(CLAUDE.md §8 세션 UI 상태).
// 반대편 모드의 **진행 기록**은 저장 키가 달라 그대로 보존된다(lib/player.js SOLO_PLAYER_ID).
function normalize (session) {
  if (isSoloMode()) {
    if (session.teamId === SOLO_PLAYER_ID) return session
    return { ...defaults(), muted: !!session.muted, teamId: SOLO_PLAYER_ID }
  }
  if (session.teamId === SOLO_PLAYER_ID) return { ...defaults(), muted: !!session.muted }
  return session
}
function persist (session) {
  try { localStorage.setItem(KEY, JSON.stringify(session)) } catch { /* storage unavailable — run in-memory */ }
}
function wait (ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

export function createFlow ({ root }) {
  let session = load()
  let current = null
  const audio = createAudioManager({ muted: session.muted })

  // 화면 스크롤 컨테이너는 flow의 root(#flow-root)다 — 화면/하위 화면이 바뀔 때 맨 위에서 시작해야 한다.
  // (컨트롤러가 자기 바깥 DOM을 알 필요 없도록 ctx로 내려준다.)
  function scrollToTop () {
    try { root.scrollTop = 0 } catch { /* ignore */ }
  }

  const ctx = {
    get session () { return session },
    update (patch) { session = { ...session, ...patch }; persist(session) },
    goTo (step, opts) { navigate(step, opts) },
    // 화면 어디서든 첫 화면으로 나가는 길 — 진행은 로컬에 그대로 남으므로 잃는 것이 없다.
    // 돌아올 지점을 남겨 첫 화면의 [이어서 계속하기]가 곧장 복귀시킨다(연습 모드 자유 이동, 2026-08-19).
    goHome () {
      if (session.step !== FLOW.ENTRY) ctx.update({ resumeStep: session.step })
      navigate(FLOW.ENTRY, { skipGuard: true })
    },
    scrollToTop,
    audio
  }

  // 게임플레이·종반부 화면은 서버 진행 상태가 있어야 올바른 지점을 고른다(가드도 이 값을 본다).
  // 캐시가 그 팀 것이 아니면 먼저 채운다. 실패해도 화면은 계속 뜬다(빈 진행으로 시작).
  const NEEDS_PROGRESS = [FLOW.CASE, FLOW.APPOINT, FLOW.RAID, FLOW.ENDING]
  async function ensureProgress () {
    if (!session.teamId || !NEEDS_PROGRESS.includes(session.step)) return
    if (isHydrated(session.teamId)) return
    try {
      await hydrateProgress(session.teamId)
      refreshRanking().catch(() => {})
    } catch (err) {
      console.warn('[flow] 진행 상태 로드 실패 — 서버 응답 후 다시 채워진다', err)
    }
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
    scrollToTop()
    if (screen.mounted) screen.mounted()
  }

  let releaseModal = null

  // 운영진이 입장을 해제했거나 다른 기기가 팀을 이어받으면 이 기기는 더 진행할 수 없다.
  // 팀 관련 세션을 비우고 팀 선택으로 되돌린다. see docs/screen-list.md SCR-003.
  function assertClaim ({ notify = true } = {}) {
    if (isSoloMode()) return true // 연습 모드에는 점유할 팀이 없다
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
  if (!isSoloMode()) {
    subscribeEntries(() => {
      if (session.step === FLOW.TEAM) return
      if (!assertClaim()) navigate(FLOW.TEAM, { skipGuard: true })
    })
  }

  // 게임이 끝나면(관리자 종료 또는 제한 시간 경과) 진행 중인 참가자에게 안내 팝업 하나를 띄우고
  // 마지막 화면(종료 안내)으로 이동시킨다(운영 요청 2026-08-07 · 타임오버 2026-08-10).
  // 종료 후 새로고침 복구는 resolveStep의 gameEnded 판정이 맡는다(guardFacts).
  // 입장 전 화면·이미 종료 안내면 팝업을 띄우지 않는다.
  let endedModal = null
  const PLAYING = [FLOW.WAITING, FLOW.CASE, FLOW.APPOINT, FLOW.RAID]
  function showEndNotice (keyPrefix) {
    if (endedModal || !PLAYING.includes(session.step)) return
    endedModal = createModal({
      title: t(`${keyPrefix}.title`),
      size: 'sm',
      content: [el('p', { class: 'auth-hint', text: t(`${keyPrefix}.msg`) })],
      actions: [{ label: t(`${keyPrefix}.confirm`), variant: 'primary' }],
      // 확인·ESC·배경 클릭 중 무엇으로 닫혀도 마지막 화면으로 보낸다 — 닫고 사건 화면에 남으면
      // 제출은 서버가 거부하는데 화면만 살아 있어 참가자가 이유를 알 수 없다.
      onClose: () => { endedModal = null; navigate(FLOW.ENDING, { skipGuard: true }) }
    })
    endedModal.open()
  }

  // 아래 두 장치(관리자 종료 안내 · 타임오버 감시)는 행사 모드 전용이다 — 연습 모드에는 관리자도
  // 제한 시간도 없어 상태가 변하지 않는다(lib/game-solo.js).
  if (!isSoloMode()) subscribeGame((status) => {
    if (status === 'ended') { showEndNotice('gameEnded'); return }
    // 관리자가 대기 상태로 되돌리면(초기화) 이 기기의 로컬 흔적도 함께 지운다 — 같은 PC로 들어오는
    // 다음 팀이 이전 팀의 세션·언어로 시작하지 않게 한다(운영 요청 2026-08-10).
    // 모듈 캐시(로케일·진행·팀 목록)까지 확실히 비우려면 다시 불러오는 편이 안전하다.
    if (status === 'scheduled' && (session.teamId || session.step !== FLOW.ENTRY)) {
      const removed = clearParticipantState()
      console.info('[flow] 관리자 초기화 — 로컬 상태를 지우고 첫 화면으로 되돌린다', removed)
      location.reload()
    }
  })

  // 타임오버는 status 변화로 오지 않는다 — 서버는 ends_at 이 지나도 관리자가 [게임 종료]를 누를 때까지
  // status='started' 를 유지한다(제출만 거부). 그래서 초당 한 번 직접 확인한다.
  if (!isSoloMode()) setInterval(() => { if (isTimeUp()) showEndNotice('timeUp') }, 1000)

  // 라우터 가드에 넘길 서버(현재는 MOCK) 상태 — constants/flow.js가 상태 모듈을 import하지 않도록
  // 여기서 읽어 넘긴다. 진행 판정은 lib/stage-progress.js·lib/progress.js가 단일 출처다.
  function guardFacts () {
    return {
      solo: isSoloMode(), // 연습 모드는 팀·대기실 없는 가드를 쓴다 (constants/flow.js)
      gameStarted: isStarted(),
      // 타임오버도 종료로 본다 — 새로고침해도 사건 화면으로 돌아가지 않아야 한다.
      gameEnded: isEnded() || isTimeUp(),
      stagesCleared: allStagesCleared(session.teamId),
      finale: getFinale(session.teamId)
    }
  }

  async function navigate (step, { skipGuard = false } = {}) {
    // 이미 팀 선택으로 가는 길이면 굳이 알리지 않는다.
    if (!assertClaim({ notify: step !== FLOW.TEAM }) && !skipGuard) step = FLOW.TEAM
    // 진행 상태가 필요한 단계로 갈 때는 가드 판정 전에 서버에서 받아온다.
    if (session.teamId && NEEDS_PROGRESS.includes(step) && !isHydrated(session.teamId)) {
      session.step = step
      await ensureProgress()
    }
    const target = skipGuard ? step : resolveStep(step, session, guardFacts())
    session.step = target
    persist(session)
    render(target)
  }

  return {
    async start () { await navigate(session.step) }, // resume — guard keeps it honest
    goTo: navigate,
    reset () {
      // DEV 초기화 — 점유한 팀도 함께 비워야 같은 팀으로 다시 테스트할 수 있다.
      if (!isSoloMode() && session.teamId && ownsTeam(session.teamId, getDeviceId())) releaseTeam(session.teamId)
      session = normalize(defaults())
      persist(session)
      audio.stopBgm()
      navigate(FLOW.ENTRY, { skipGuard: true })
    },
    current () { return session.step },
    teamId () { return session.teamId } // DEV 도구가 현재 팀 기준으로 진행을 앞당길 때 사용
  }
}
