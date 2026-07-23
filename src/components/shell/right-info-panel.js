// RightInfoPanel — contextual info (LayOut.png / screen-list SCR-006):
// PMBOK perspectives · current concept · Agent Level (EXP) · help.
// NOTE: EXP/Agent Level is present in LayOut.png but under-specified in docs (implementation-plan §12).
import { el } from '../../js/utils/dom.js'
import { createProgressBar } from '../primitives/progress-bar.js'

function section (label, ...children) {
  return el('div', { class: 'rpanel__section' }, [
    label ? el('span', { class: 'caps', text: label }) : null,
    ...children
  ])
}

export function createRightInfoPanel (props = {}) {
  const {
    perspectives = [],
    concept = '',
    level = { rank: '신입 수사관', exp: 0, expMax: 100 },
    help = ''
  } = props

  const exp = createProgressBar({ value: level.exp, max: level.expMax, variant: 'accent', label: '', showValue: false })

  const node = el('aside', { class: 'rpanel', 'aria-label': '정보 패널' }, [
    section('PMBOK 8th 관점', ...perspectives.map((p) => el('div', { class: 'perspective' }, [
      el('span', { class: 'perspective__mark' }),
      el('div', {}, [
        el('div', { class: 'perspective__title', text: p.title }),
        el('div', { class: 'perspective__desc', text: p.desc })
      ])
    ]))),
    concept ? section('현재 개념', el('p', { class: 'concept', text: concept })) : null,
    section('Agent Level',
      el('div', { class: 'level' }, [
        el('span', { class: 'level__rank', text: level.rank }),
        el('span', { class: 'level__num', text: `EXP ${level.exp} / ${level.expMax}` })
      ]),
      exp.el
    ),
    help ? section('도움말', el('p', { class: 'help', text: help })) : null
  ])

  return { el: node, destroy () { exp.destroy(); node.remove() } }
}
