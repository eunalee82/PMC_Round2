// 관리자 오버레이(팀 현황 · 최종 랭킹) 상단 되돌아가기 바.
//
// 왜: 두 화면 모두 33행짜리 표를 담고 있어서, 하단에만 [관리자 콘솔로]가 있으면 표 끝까지
// 스크롤해야 콘솔로 돌아갈 수 있었다(운영 요청 2026-08-10). 스크롤을 따라오도록 sticky 로 두고,
// 새로 추가되는 오버레이도 같은 버튼을 갖도록 컴포넌트로 뽑았다.
//
// createAdminBackBar({ onBack }) -> { el, destroy }   (CLAUDE.md §9 컴포넌트 계약)
import { el } from '../../js/utils/dom.js'
import { createButton } from '../primitives/button.js'

export function createAdminBackBar (props = {}) {
  const { onBack = null, label = '관리자 콘솔로 돌아가기' } = props

  const btn = createButton({
    label,
    variant: 'ghost',
    size: 'sm',
    icon: 'arrowLeft',
    onClick: () => { if (onBack) onBack() }
  })

  const node = el('div', { class: 'admin-backbar' }, [btn.el])

  return {
    el: node,
    destroy () { btn.destroy() }
  }
}
