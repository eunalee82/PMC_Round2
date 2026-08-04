// QuestionChoice — 판단 보기 (docs/screen-list.md §7 QuestionChoice).
// 라디오 그룹 semantics + 키보드 접근. 제출 전엔 선택만, 제출 후엔 lock/reveal로 결과를 표시한다.
// 채점/정답 판정은 하지 않는다 — 화면(screen)이 lib/grade.js 결과를 reveal()로 내려준다 (CLAUDE.md §9).
// choices 항목은 문자열 또는 { label, desc } — desc는 보기 아래 보조 설명으로 흐리게 붙는다
// (예: 사건 #013처럼 보기가 'PMBOK 용어 + 설명' 두 단으로 이루어진 경우).
// createQuestionChoice(props) -> { el, getSelected, lock, reveal, destroy }
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'

export function createQuestionChoice (props = {}) {
  const { choices = [], onChange = null } = props
  let selected = -1
  let locked = false

  const options = choices.map((choice, i) => {
    const label = typeof choice === 'string' ? choice : (choice.label || '')
    const desc = typeof choice === 'string' ? '' : (choice.desc || '')
    const opt = el('button', {
      class: 'choice',
      type: 'button',
      role: 'radio',
      'aria-checked': 'false',
      dataset: { index: String(i) }
    }, [
      el('span', { class: 'choice__marker mono', text: String(i + 1) }),
      // 데이터(신뢰) 문자열이지만 일관성을 위해 textContent로만 넣는다 (CLAUDE.md §9)
      el('span', { class: 'choice__text' }, [
        el('span', { class: 'choice__label', text: label }),
        desc ? el('span', { class: 'choice__desc', text: desc }) : null
      ]),
      el('span', { class: 'choice__state' }, [icon('check', { size: 16 })])
    ])
    opt.addEventListener('click', () => {
      if (locked) return
      selected = i
      sync()
      if (typeof onChange === 'function') onChange(i)
    })
    return opt
  })

  function sync () {
    options.forEach((opt, i) => {
      opt.classList.toggle('is-selected', i === selected)
      opt.setAttribute('aria-checked', i === selected ? 'true' : 'false')
    })
  }

  const node = el('div', { class: 'choices', role: 'radiogroup', 'aria-label': '판단 보기' }, options)

  return {
    el: node,
    getSelected () { return selected },
    lock () { locked = true; node.classList.add('is-locked') },
    // 결과 공개 — 정답/오답 하이라이트 (오답 연출은 절제, CLAUDE.md §4 / SCR-011)
    reveal (correctIndex, chosenIndex) {
      locked = true
      node.classList.add('is-locked', 'is-revealed')
      options.forEach((opt, i) => {
        opt.classList.remove('is-selected')
        opt.setAttribute('aria-checked', i === chosenIndex ? 'true' : 'false')
        if (i === correctIndex) opt.classList.add('is-correct')
        if (i === chosenIndex && chosenIndex !== correctIndex) opt.classList.add('is-wrong')
      })
    },
    destroy () { node.remove() }
  }
}
