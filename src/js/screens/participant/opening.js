// SCR-002 Opening — 세계관 인트로. 로컬 영상 재생 이슈로 YouTube 임베드로 대체한다.
// 유튜브 임베드는 종료 자동감지(IFrame API)를 붙이지 않고, 시청 후 [팀 선택으로]로 진행한다.
// see docs/screen-list.md SCR-002, docs/game-flow.md §6.2 / §19.2.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { t, bindCopy, copyEl } from '../../lib/copy.js'
import { isSoloMode } from '../../lib/mode.js'
import { createButton } from '../../../components/primitives/button.js'

const YT_ORIGIN = 'https://www.youtube.com'
const YT_PLAYING = 1 // YT.PlayerState.PLAYING
// 소리 있는 자동재생은 브라우저 정책상 차단되므로 mute=1로 시작한 뒤 즉시 음소거를 해제한다
// (입장 버튼 클릭이 사용자 제스처로 남아 있어 대개 통과한다). 차단되면 [소리 켜기]가 대체 수단.
// rel=0 관련영상 최소화 · playsinline 모바일 인라인 · enablejsapi postMessage 제어용.
// see CLAUDE.md §12(자동재생은 muted로 시도 후 제스처로 unmute), §13(연출 실패해도 진행)
const EMBED_SRC = `${YT_ORIGIN}/embed/${ASSETS.videos.openingEmbedId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`
const UNMUTE_RETRY_MS = [250, 900, 2000, 4000] // 플레이어가 명령을 받을 준비가 될 때까지 재시도
const AUTO_UNMUTE_LIMIT = 6 // 자동 해제 시도 상한 — 브라우저가 끝까지 막으면 버튼으로 넘긴다
const UNMUTE_VERIFY_MS = 1200 // 해제 후 이 시간 안에 재생 중이 아니면 소리를 포기하고 재생을 살린다

// 사용자 제스처가 한 번이라도 있었는가(sticky activation). 없으면 음소거 해제 시도 자체가
// 재생을 멈추게 하므로 시도하지 않는다. 실제 흐름에서는 [PM보호국 입장] 클릭으로 항상 참이고,
// 오프닝 화면으로 직접 새로고침해 들어온 경우만 거짓이 된다.
function hasUserActivation () {
  const ua = navigator.userActivation
  return ua ? ua.hasBeenActive : true // 미지원 브라우저는 시도해 본다(실패해도 fallback이 받는다)
}

export function createOpeningScreen (ctx) {
  let destroyed = false
  const timers = []
  // 다음 단계는 모드가 정한다 — 행사는 팀 선택(SCR-003), 공개 연습은 팀이 없으니 곧장 서약으로.
  const solo = isSoloMode()
  const NEXT_STEP = solo ? FLOW.OATH : FLOW.TEAM
  const NEXT_KEY = solo ? 'opening.proceedSolo' : 'opening.fallbackProceed'
  const GUIDE_KEY = solo ? 'opening.guideSolo' : 'opening.guide'
  function toNext () { if (!destroyed) ctx.goTo(NEXT_STEP) }

  const iframe = el('iframe', {
    class: 'opening__video',
    src: EMBED_SRC,
    title: 'PM보호국 오프닝',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
    referrerpolicy: 'strict-origin-when-cross-origin'
  })
  iframe.setAttribute('allowfullscreen', '')
  iframe.setAttribute('frameborder', '0')

  const stage = el('div', { class: 'opening__stage' }, [
    el('div', { class: 'opening__yt' }, [iframe])
  ])

  // IFrame API 명령 — API 스크립트를 로드하지 않고 postMessage만 사용한다(에셋 하나 덜 받는다).
  function command (func, args = []) {
    try { iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), YT_ORIGIN) } catch { /* 준비 전/차단 — 무시 */ }
  }

  // 소리는 "사용자 의도(soundWanted)"와 "플레이어 실제 상태(playerMuted)"를 분리해 다룬다.
  // 둘을 한 변수로 합치면, 자동 음소거해제가 거절돼 muted 보고를 받은 순간 이후의 재시도가
  // 오히려 mute 명령을 보내버린다. 의도는 입장 화면(SCR-001)에서 정한 세션 설정에서 출발한다.
  let soundWanted = !ctx.session.muted
  let playerMuted = true // autoplay는 항상 mute=1로 시작한다
  let playerState = -1 // YT PlayerState (미시작 -1 · 재생 1)
  let autoTries = 0
  const soundLive = () => soundWanted && !playerMuted

  const soundBtn = createButton({
    label: '', variant: 'ghost', size: 'sm',
    onClick: () => {
      soundWanted = !soundLive()
      autoTries = AUTO_UNMUTE_LIMIT // 사용자가 직접 정했으면 자동 재시도는 그만둔다
      ctx.update({ muted: !soundWanted })
      applySound()
    }
  })
  function renderSoundBtn () {
    const live = soundLive()
    soundBtn.update({ label: live ? t('opening.soundOff') : t('opening.soundOn'), icon: live ? 'volume' : 'volumeOff' })
  }
  function applySound () {
    if (soundWanted) {
      command('unMute')
      command('setVolume', [100])
      command('playVideo') // 음소거 해제 직후 브라우저가 일시정지시키는 경우 대비
    } else {
      command('mute')
    }
    renderSoundBtn()
  }
  // 자동 음소거해제 — 제스처가 있었을 때만 시도하고, 재생이 멈췄으면 소리를 포기한다.
  // (연출보다 진행: 무음이라도 오프닝은 흘러가야 한다. CLAUDE.md §4 / §13)
  function autoUnmute () {
    if (destroyed || !soundWanted || !playerMuted || autoTries >= AUTO_UNMUTE_LIMIT) return
    if (!hasUserActivation()) { renderSoundBtn(); return }
    autoTries += 1
    applySound()
    timers.push(setTimeout(() => {
      if (destroyed || playerState === YT_PLAYING) return
      soundWanted = false // 세션 설정(ctx.session.muted)은 사용자 선택이므로 건드리지 않는다
      command('mute')
      command('playVideo')
      renderSoundBtn()
    }, UNMUTE_VERIFY_MS))
  }
  renderSoundBtn()

  // 플레이어 상태 수신(enablejsapi + listening) — 실제 음소거 상태로 버튼을 맞추고,
  // 준비/재생 시점에 자동 음소거해제를 다시 시도한다(로드 전에 보낸 명령은 버려진다).
  function onMessage (e) {
    if (e.origin !== YT_ORIGIN || destroyed) return
    let data = null
    try { data = JSON.parse(e.data) } catch { return }
    if (!data) return
    if (data.info && typeof data.info.muted === 'boolean') {
      playerMuted = data.info.muted
      renderSoundBtn()
    }
    if (data.info && typeof data.info.playerState === 'number') playerState = data.info.playerState
    if (data.event === 'onReady' || playerState === YT_PLAYING) autoUnmute()
  }
  window.addEventListener('message', onMessage)

  iframe.addEventListener('load', () => {
    if (destroyed) return
    // listening 등록 = 이후 플레이어 상태(infoDelivery)를 받는다.
    try { iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), YT_ORIGIN) } catch { /* 무시 */ }
    // 플레이어 준비 시점이 불확실해 몇 번 재시도한다. 끝까지 막히면 [소리 켜기]가 대체 수단.
    for (const ms of UNMUTE_RETRY_MS) {
      timers.push(setTimeout(autoUnmute, ms))
    }
  })

  const skipBtn = createButton({ label: t('opening.skip'), variant: 'ghost', size: 'sm', icon: 'skipForward', onClick: toNext })
  bindCopy(skipBtn.el.querySelector('.btn__label'), 'opening.skip')
  const proceed = createButton({ label: t(NEXT_KEY), variant: 'primary', size: 'sm', icon: 'logIn', onClick: toNext })
  bindCopy(proceed.el.querySelector('.btn__label'), NEXT_KEY)

  const controls = el('div', { class: 'opening__controls' }, [
    soundBtn.el,
    el('div', { class: 'opening__spacer' }),
    skipBtn.el,
    proceed.el
  ])

  // Edge 에서 영상이 재생되는 동안 아래쪽 진행 버튼을 못 찾고 헤매는 팀이 있었다(운영 보고 2026-08-10).
  // 영상 위(=시선이 먼저 닿는 곳)에 다음 행동을 적어 두고, 언어를 잘못 골랐으면 첫 화면으로 돌아갈
  // 길도 같이 남긴다 — 첫 화면(SCR-001)이 언어 선택 지점이다.
  const backBtn = createButton({
    label: t('common.backToStart'), variant: 'ghost', size: 'sm', icon: 'arrowLeft',
    onClick: () => { if (!destroyed) ctx.goTo(FLOW.ENTRY) }
  })
  bindCopy(backBtn.el.querySelector('.btn__label'), 'common.backToStart')

  const topbar = el('div', { class: 'opening__topbar' }, [
    backBtn.el,
    el('p', { class: 'opening__guide' }, [
      icon('alert', { size: 16 }),
      copyEl('span', {}, GUIDE_KEY)
    ])
  ])

  const node = el('div', { class: 'screen screen--opening' }, [topbar, stage, controls])

  return {
    el: node,
    destroy () {
      destroyed = true
      timers.forEach(clearTimeout)
      window.removeEventListener('message', onMessage)
      iframe.removeAttribute('src') // 재생 중지
      soundBtn.destroy()
      skipBtn.destroy()
      proceed.destroy()
      backBtn.destroy()
    }
  }
}
