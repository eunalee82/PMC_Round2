// QuestionChoice — 판단 보기 (docs/screen-list.md §7 QuestionChoice).
// 라디오 그룹 semantics + 키보드 접근. 제출 전엔 선택만, 제출 후엔 lock/reveal로 결과를 표시한다.
// 채점/정답 판정은 하지 않는다 — 화면(screen)이 lib/grade.js 결과를 reveal()로 내려준다 (CLAUDE.md §9).
// choices 항목은 문자열 또는 { label, desc } — desc는 보기 아래 보조 설명으로 흐리게 붙는다
// (예: 사건 #013처럼 보기가 'PMBOK 용어 + 설명' 두 단으로 이루어진 경우).
// multi: true 면 **복수 선택**(체크박스 semantics) — selectCount 개까지만 고를 수 있다(사건 #005).
// createQuestionChoice(props) -> { el, getSelected, getSelectedIndexes, lock, reveal, destroy }
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'

export function createQuestionChoice (props = {}) {
  const { choices = [], onChange = null, multi = false, selectCount = 1 } = props
  let selected = -1 // 단일 선택 모드의 선택 인덱스
  const picked = new Set() // 복수 선택 모드의 선택 인덱스 집합
  let locked = false

  const options = choices.map((choice, i) => {
    const label = typeof choice === 'string' ? choice : (choice.label || '')
    const desc = typeof choice === 'string' ? '' : (choice.desc || '')
    const opt = el('button', {
      class: 'choice',
      type: 'button',
      role: multi ? 'checkbox' : 'radio',
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
      if (multi) {
        if (picked.has(i)) picked.delete(i)
        else if (picked.size < selectCount) picked.add(i)
        else return // 정해진 개수를 넘겨 고를 수 없다 — 먼저 하나를 해제해야 한다
      } else {
        selected = i
      }
      sync()
      if (typeof onChange === 'function') onChange(multi ? [...picked].sort((a, b) => a - b) : i)
    })
    return opt
  })

  function sync () {
    options.forEach((opt, i) => {
      const on = multi ? picked.has(i) : i === selected
      opt.classList.toggle('is-selected', on)
      opt.setAttribute('aria-checked', on ? 'true' : 'false')
    })
    // 정원이 찼으면 미선택 보기를 흐리게 — 왜 눌리지 않는지 보이게 한다
    if (multi) node.classList.toggle('is-full', picked.size >= selectCount)
  }

  const node = el('div', {
    class: multi ? 'choices is-multi' : 'choices',
    role: multi ? 'group' : 'radiogroup',
    'aria-label': '판단 보기'
  }, options)

  // 정답/선택을 배열·단일 어느 쪽으로 받아도 동작하게 정규화한다
  const toSet = (v) => new Set(Array.isArray(v) ? v : (v == null || v < 0 ? [] : [v]))

  return {
    el: node,
    getSelected () { return multi ? [...picked].sort((a, b) => a - b) : selected },
    getSelectedIndexes () { return multi ? [...picked].sort((a, b) => a - b) : (selected < 0 ? [] : [selected]) },
    lock () { locked = true; node.classList.add('is-locked') },
    // 결과 공개 — 정답/오답 하이라이트 (오답 연출은 절제, CLAUDE.md §4 / SCR-011)
    // 복수 정답 사건에서는 correct·chosen 이 배열로 온다.
    reveal (correct, chosen) {
      locked = true
      node.classList.add('is-locked', 'is-revealed')
      const correctSet = toSet(correct)
      const chosenSet = toSet(chosen)
      options.forEach((opt, i) => {
        opt.classList.remove('is-selected')
        opt.setAttribute('aria-checked', chosenSet.has(i) ? 'true' : 'false')
        if (correctSet.has(i)) opt.classList.add('is-correct')
        if (chosenSet.has(i) && !correctSet.has(i)) opt.classList.add('is-wrong')
      })
    },
    destroy () { node.remove() }
  }
}
