// [처음으로] — 셸(헤더)이 없는 화면(종반부: 임명·레이드·금배지)에서 첫 화면으로 나가는 길.
// 연습 모드 자유 이동(2026-08-19)의 일부다. 진행은 로컬에 저장돼 있어 나갔다 돌아와도 잃는 게 없고,
// 첫 화면의 [이어서 계속하기]가 이 자리로 되돌려 준다.
//
// 화면마다 레이아웃(가운데 정렬 컬럼 · 국면 전환 시 내용 교체)이 달라 흐름에 끼우면 자리가 흔들린다
// → 화면 위에 고정(position: fixed)해 어느 화면에서도 같은 자리에 있게 한다.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { t } from '../../js/lib/copy.js'

export function createHomeLink ({ onHome }) {
  const btn = el('button', { class: 'ghost-chip home-fab', type: 'button' }, [
    icon('arrowLeft', { size: 16 }),
    el('span', { text: t('common.home') })
  ])
  const handler = () => onHome && onHome()
  btn.addEventListener('click', handler)

  return {
    el: btn,
    destroy () {
      btn.removeEventListener('click', handler)
      btn.remove()
    }
  }
}
