// EvidenceViewer — 사건 단서 이미지 뷰어 (docs/screen-list.md §7 EvidenceViewer).
// 이미지 로드 실패 시 텍스트 대체를 보여준다 (CLAUDE.md §4: 연출 실패해도 게임은 진행).
// 클릭/확대 버튼으로 원본을 모달에서 크게 본다.
// createEvidenceViewer(props) -> { el, destroy }  (CLAUDE.md §9 컴포넌트 계약)
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { createModal } from '../primitives/modal.js'

export function createEvidenceViewer (props = {}) {
  const { evidence = {}, label = '현장 단서' } = props
  let modal = null

  const img = el('img', {
    class: 'evidence__img',
    src: evidence.src || '',
    alt: evidence.alt || label, // 대체 텍스트 (접근성)
    loading: 'eager',
    decoding: 'async'
  })

  const zoomBtn = el('button', { class: 'evidence__zoom', type: 'button', 'aria-label': `${label} 확대` }, [
    icon('maximize', { size: 16 })
  ])

  const fallback = el('div', { class: 'evidence__fallback' }, [
    icon('file', { size: 30 }),
    el('p', { class: 'evidence__fallback-title', text: '단서 이미지를 불러오지 못했습니다.' }),
    el('p', { class: 'evidence__fallback-sub', text: evidence.alt || '' })
  ])

  const frame = el('div', { class: 'evidence__frame' }, [img, zoomBtn, fallback])
  const figure = el('figure', { class: 'evidence' }, [
    frame,
    evidence.caption ? el('figcaption', { class: 'evidence__cap mono caps', text: evidence.caption }) : null
  ])

  img.addEventListener('error', () => figure.classList.add('is-broken'))

  function openZoom () {
    if (figure.classList.contains('is-broken')) return
    const big = el('img', { class: 'evidence__zoomimg', src: evidence.src || '', alt: evidence.alt || label })
    modal = createModal({
      title: label,
      size: 'lg',
      content: [big],
      actions: [{ label: '닫기', variant: 'ghost' }],
      onClose: () => { modal = null }
    })
    modal.open()
  }

  zoomBtn.addEventListener('click', openZoom)
  img.addEventListener('click', openZoom)

  return {
    el: figure,
    destroy () {
      if (modal) modal.destroy()
      figure.remove()
    }
  }
}
