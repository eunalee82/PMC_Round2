// EvidenceViewer — 사건 단서 이미지 뷰어 (docs/screen-list.md §7). 1장 또는 다중(증거물 갤러리) 지원.
// 이미지 로드 실패 시 텍스트 대체를 보여준다 (CLAUDE.md §4: 연출 실패해도 게임은 진행). 클릭 시 확대 모달.
// evidence: { caption?, images: [{ src, alt, label? }] }  (구버전 { src, alt } 단일도 허용)
// createEvidenceViewer(props) -> { el, destroy }  (CLAUDE.md §9 컴포넌트 계약)
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { t } from '../../js/lib/copy.js'
import { createModal } from '../primitives/modal.js'
import { getAudioSettings, subscribeAudio } from '../../js/lib/audio-settings.js'

export function createEvidenceViewer (props = {}) {
  const { evidence = {}, label = '현장 단서' } = props
  const images = evidence.images || (evidence.src ? [{ src: evidence.src, alt: evidence.alt }] : [])
  const multi = images.length > 1
  let modal = null

  function openZoom (im, title) {
    const big = el('img', { class: 'evidence__zoomimg', src: im.src || '', alt: im.alt || title })
    modal = createModal({
      title,
      size: 'lg',
      content: [big],
      actions: [{ label: t('evidence.close'), variant: 'ghost' }],
      onClose: () => { modal = null }
    })
    modal.open()
  }

  function buildCell (im) {
    const cellLabel = im.label || label
    const img = el('img', {
      class: 'evidence__img', src: im.src || '', alt: im.alt || cellLabel, loading: 'lazy', decoding: 'async'
    })
    const zoomBtn = el('button', { class: 'evidence__zoom', type: 'button', 'aria-label': `${cellLabel} ${t('evidence.zoom')}` }, [
      icon('maximize', { size: 16 })
    ])
    const fallback = el('div', { class: 'evidence__fallback' }, [
      icon('file', { size: 28 }),
      el('p', { class: 'evidence__fallback-title', text: t('evidence.loadFail') }),
      el('p', { class: 'evidence__fallback-sub', text: im.alt || cellLabel })
    ])
    const frame = el('div', { class: 'evidence__frame' }, [img, zoomBtn, fallback])
    const cell = el('figure', { class: 'evidence__cell' }, [
      im.label ? el('figcaption', { class: 'evidence__celllabel mono', text: im.label }) : null,
      frame
    ])
    img.addEventListener('error', () => cell.classList.add('is-broken'))
    const open = () => { if (!cell.classList.contains('is-broken')) openZoom(im, cellLabel) }
    zoomBtn.addEventListener('click', open)
    img.addEventListener('click', open)
    return cell
  }

  const grid = el('div', { class: multi ? 'evidence__grid is-multi' : 'evidence__grid' }, images.map(buildCell))

  // 오디오 단서(녹취) — 네이티브 컨트롤(재생/일시정지/볼륨). 다운로드 버튼은 숨겨 반출 억제.
  // 전역 오디오 설정(볼륨·음소거)을 따른다 → 헤더 소리 컨트롤로 조절 가능 (듣기평가).
  const audios = evidence.audios || []
  const audioEls = []
  const audioBlock = audios.length
    ? el('div', { class: 'evidence__audios' }, audios.map((a, i) => {
      const audioEl = el('audio', { class: 'evidence__audio-el', src: a.src || '', controls: true, preload: 'none', controlsList: 'nodownload' })
      audioEls.push(audioEl)
      return el('div', { class: 'evidence__audio' }, [
        el('span', { class: 'evidence__audio-label mono caps', text: a.label || `${t('evidence.recording')} ${i + 1}` }),
        audioEl
      ])
    }))
    : null

  // audioFirst: 오디오가 '단서를 읽는 전제'인 사건(사건 #003 감독관 브리핑)은 음성이 증거물 위에 와야 한다.
  // 반대로 사건 #002처럼 현장 이미지가 배경이고 녹취가 보기인 경우는 이미지 아래가 맞다 → 데이터로 결정한다.
  const cap = evidence.caption
    ? el('figcaption', { class: 'evidence__cap mono caps', text: evidence.caption })
    : null
  const figure = el('figure', { class: 'evidence' }, evidence.audioFirst
    ? [audioBlock, images.length ? grid : null, cap]
    : [images.length ? grid : null, cap, audioBlock])

  // 전역 볼륨/음소거를 오디오 요소에 반영 + 변경 구독
  let audioUnsub = null
  if (audioEls.length) {
    const applyAudio = () => {
      const s = getAudioSettings()
      audioEls.forEach((a) => { a.volume = s.volume; a.muted = s.muted })
    }
    applyAudio()
    audioUnsub = subscribeAudio(applyAudio)
  }

  return {
    el: figure,
    destroy () {
      if (audioUnsub) audioUnsub()
      if (modal) modal.destroy()
      figure.remove()
    }
  }
}
