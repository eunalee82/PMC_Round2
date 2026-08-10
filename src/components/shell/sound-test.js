// 음향 점검 — 첫 화면(SCR-001)에서 입장 전에 스피커·볼륨을 확인한다.
//
// 왜 첫 화면인가: 사건 15건 중 5건(#002·#003·#004·#007·#009·#011·#014)이 녹취 오디오를 근거로 삼는다.
// 소리가 안 나오는 걸 사건 화면에서 처음 알면 제한 시간 안에 손쓸 수 없다. 첫 화면이 유일한 사전 점검 지점이다.
//
// 설계 두 가지:
//  · 재생은 반드시 클릭(사용자 제스처)에서 시작한다 — 자동재생 정책 (CLAUDE.md §13, game-flow.md §6.2).
//  · **재생 중 시각 표시(레벨 바)를 함께 준다.** 막대는 움직이는데 소리가 없으면 원인이 기기 쪽이라는 뜻이라,
//    참가자가 스스로 "앱 문제냐 내 기기 문제냐"를 가릴 수 있다. 이게 이 화면의 진짜 목적이다.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { ASSETS } from '../../js/constants/assets.js'
import { t } from '../../js/lib/copy.js'
import { getAudioSettings, setVolume, setMuted, subscribeAudio } from '../../js/lib/audio-settings.js'

// 자동 정지 — 참가자가 멈추는 걸 잊어도 첫 화면이 계속 울지 않게 한다.
const TEST_MS = 15000
const BAR_COUNT = 5

export function createSoundTest ({ audio, onUnmute } = {}) {
  let playing = null   // 재생 중인 Audio 엘리먼트
  let stopTimer = null

  const btnLabel = el('span', { text: t('entry.soundTest.play') })
  const btnIcon = el('span', { class: 'sound-test__icon' }, [icon('play', { size: 16 })])
  const btn = el('button', { class: 'sound-test__btn', type: 'button' }, [btnIcon, btnLabel])

  const bars = el('div', { class: 'sound-test__bars', 'aria-hidden': 'true' },
    Array.from({ length: BAR_COUNT }, (_, i) => el('span', { class: 'sound-test__bar', style: `--bar-i:${i}` })))

  // 상태 문구는 aria-live 로 읽어 준다 — 소리를 못 듣는 참가자도 재생 여부를 알 수 있어야 한다.
  const status = el('p', { class: 'sound-test__status', role: 'status', 'aria-live': 'polite', text: t('entry.soundTest.hint') })

  const slider = el('input', {
    class: 'sound-test__slider', type: 'range', min: '0', max: '100', step: '1',
    'aria-label': t('audio.volume'), value: String(Math.round(getAudioSettings().volume * 100))
  })
  slider.addEventListener('input', () => setVolume(Number(slider.value) / 100))

  function paint () {
    const on = !!playing
    btnIcon.replaceChildren(icon(on ? 'pause' : 'play', { size: 16 }))
    btnLabel.textContent = on ? t('entry.soundTest.stop') : t('entry.soundTest.play')
    btn.classList.toggle('is-playing', on)
    bars.classList.toggle('is-playing', on)
    status.textContent = on ? t('entry.soundTest.playing') : t('entry.soundTest.hint')
  }

  function stop () {
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null }
    if (playing) {
      try { playing.pause() } catch { /* 이미 정리됨 */ }
      playing = null
    }
    paint()
  }

  function start () {
    // 음소거 두 곳을 모두 푼다 — 세션 음소거(첫 화면 칩)와 전역 소리 설정(헤더 볼륨).
    // 둘 중 하나라도 켜져 있으면 playSfx 가 null 을 돌려주고 참가자는 이유를 모른 채 무음을 겪는다.
    if (onUnmute) onUnmute()
    if (getAudioSettings().muted) setMuted(false)
    if (audio && audio.unlock) audio.unlock()

    const sfx = audio && audio.playSfx ? audio.playSfx(ASSETS.bgm.opening) : null
    if (!sfx) {
      // 재생 자체가 거부된 경우(정책·파일). 연출 실패가 진행을 막지 않는다 — 안내만 남긴다.
      status.textContent = t('entry.soundTest.fail')
      return
    }
    playing = sfx
    sfx.addEventListener('ended', stop, { once: true })
    stopTimer = setTimeout(stop, TEST_MS)
    paint()
  }

  btn.addEventListener('click', () => { if (playing) stop(); else start() })

  // 볼륨은 재생 중에도 즉시 반영한다 — 참가자가 슬라이더를 움직이며 귀로 맞추는 게 이 기능의 핵심이다.
  const unsub = subscribeAudio((s) => {
    slider.value = String(Math.round(s.volume * 100))
    if (playing) playing.volume = s.muted ? 0 : s.volume
  })

  const node = el('div', { class: 'sound-test' }, [
    el('span', { class: 'sound-test__label mono caps', text: t('entry.soundTest') }),
    el('div', { class: 'sound-test__row' }, [
      btn,
      bars,
      el('label', { class: 'sound-test__vol' }, [icon('volume', { size: 14 }), slider])
    ]),
    status
  ])

  return {
    el: node,
    destroy () {
      stop()
      unsub()
    }
  }
}
