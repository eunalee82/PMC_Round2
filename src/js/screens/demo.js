// Design-system demo page (development only). Renders every token and common component
// on one screen so the visual language can be reviewed at a glance.
// This is NOT a game screen — real game flow is out of scope for this task.
import { el } from '../utils/dom.js'
import { icon } from '../utils/icons.js'
import { createButton } from '../../components/primitives/button.js'
import { createCard } from '../../components/primitives/card.js'
import { createModal } from '../../components/primitives/modal.js'
import { createProgressBar } from '../../components/primitives/progress-bar.js'
import { createLoadingState, createErrorState, createEmptyState } from '../../components/feedback/states.js'

const THEMES = [
  { id: '', label: 'Default', color: '#7c87ff' },
  { id: '1', label: 'Stage 1 · Mindset', color: '#8b7bff' },
  { id: '2', label: 'Stage 2 · Domain', color: '#2cc7e6' },
  { id: '3', label: 'Stage 3 · AI', color: '#37d089' },
  { id: 'raid', label: 'Final Raid', color: '#f0555f' },
  { id: 'ending', label: 'Ending · Gold', color: '#e7b24c' }
]

function section (title, note, ...children) {
  return el('section', { class: 'demo__section' }, [
    el('div', { class: 'demo__section-head' }, [
      el('h2', { class: 'demo__section-title', text: title }),
      note ? el('span', { class: 'demo__section-note', text: note }) : null
    ]),
    ...children
  ])
}

function swatch (name, value) {
  return el('div', { class: 'swatch' }, [
    el('div', { class: 'swatch__chip', style: { background: `var(${name})` } }),
    el('span', { class: 'swatch__name', text: name }),
    el('span', { class: 'swatch__val', text: value })
  ])
}

export function createDemoPage () {
  const parts = []
  const track = (c) => { parts.push(c); return c.el }

  // ── Theme switcher ──
  const chips = THEMES.map((t) => el('button', {
    class: t.id === '' ? 'theme-chip is-active' : 'theme-chip',
    type: 'button',
    dataset: { stage: t.id },
    on: {
      click: () => {
        if (t.id) document.documentElement.dataset.stage = t.id
        else delete document.documentElement.dataset.stage
        chips.forEach((c) => c.classList.toggle('is-active', c.dataset.stage === t.id))
      }
    }
  }, [
    el('span', { class: 'theme-chip__dot', style: { background: t.color } }),
    document.createTextNode(t.label)
  ]))

  const toolbar = el('div', { class: 'demo__toolbar' }, [
    el('span', { class: 'demo__toolbar-label', text: 'Stage Theme' }),
    ...chips
  ])

  // ── Colors ──
  const colors = section('색상 (Colors)', 'Stage 테마를 바꾸면 Accent 계열이 함께 변합니다', el('div', { class: 'demo__grid' }, [
    swatch('--bg-0', '#08090d'),
    swatch('--bg-1', '#0e1016'),
    swatch('--bg-2', '#14161f'),
    swatch('--bg-3', '#1b1e29'),
    swatch('--text-1', '#f4f5f7'),
    swatch('--text-2', '66%'),
    swatch('--text-3', '42%'),
    swatch('--brand-a', '#7b5cff'),
    swatch('--brand-b', '#4e9bff'),
    swatch('--accent', 'stage-swap'),
    swatch('--gold', '#e7b24c'),
    swatch('--gold-2', '#c9922e'),
    swatch('--success', '#3fcf8e'),
    swatch('--danger', '#f0555f'),
    swatch('--warning', '#e8b34a'),
    swatch('--info', '#55a8ff')
  ]))

  // ── Typography ──
  const typeRow = (tag, node) => el('div', { class: 'type-row' }, [el('span', { class: 'type-row__tag', text: tag }), node])
  const typography = section('타이포그래피 (Typography)', 'system font · tabular numbers',
    typeRow('4xl', el('div', { style: { fontSize: 'var(--text-4xl)', fontWeight: 'var(--fw-black)', letterSpacing: 'var(--tracking-tight)' }, text: 'PM보호국' })),
    typeRow('2xl', el('div', { style: { fontSize: 'var(--text-2xl)', fontWeight: 'var(--fw-bold)' }, text: '사건 해결 성공' })),
    typeRow('lg', el('div', { style: { fontSize: 'var(--text-lg)', fontWeight: 'var(--fw-semibold)' }, text: 'Mission Briefing' })),
    typeRow('base', el('div', { text: '단서를 살펴보고 가장 올바른 PM 판단을 제출하세요.' })),
    typeRow('sm', el('div', { class: 'text-2', style: { fontSize: 'var(--text-sm)' }, text: '보조 설명 텍스트 — secondary' })),
    typeRow('caps', el('span', { class: 'caps', text: 'Investigation Score' })),
    typeRow('mono', el('div', { class: 'mono', style: { fontSize: 'var(--text-xl)', fontWeight: 'var(--fw-bold)' }, text: '400 · 12.5s · 07/15' }))
  )

  // ── Spacing & Radius ──
  const spaceSpec = (name, w) => el('div', { class: 'spec' }, [
    el('div', { class: 'spec__box', style: { width: w } }),
    el('span', { class: 'spec__label', text: name })
  ])
  const radiusSpec = (name, r) => el('div', { class: 'spec' }, [
    el('div', { class: 'spec__radius', style: { borderRadius: `var(${r})` } }),
    el('span', { class: 'spec__label', text: `${name}` })
  ])
  const spacing = section('간격 & 라운딩 (Spacing / Radius)', '4px 기반 스케일',
    el('div', { class: 'demo__row' }, [
      spaceSpec('s-2', 'var(--s-2)'), spaceSpec('s-4', 'var(--s-4)'), spaceSpec('s-6', 'var(--s-6)'),
      spaceSpec('s-8', 'var(--s-8)'), spaceSpec('s-12', 'var(--s-12)'), spaceSpec('s-16', 'var(--s-16)')
    ]),
    el('div', { class: 'demo__row' }, [
      radiusSpec('r-sm', '--r-sm'), radiusSpec('r-md', '--r-md'), radiusSpec('r-lg', '--r-lg'),
      radiusSpec('r-xl', '--r-xl'), radiusSpec('r-full', '--r-full')
    ])
  )

  // ── Shadows & Glow ──
  const fxTile = (cls, label) => el('div', { class: `fx-tile ${cls}`, text: label })
  const effects = section('그림자 & Glow (Elevation / Glow)', 'Gold Glow는 배지·최종 보상 전용',
    el('div', { class: 'demo__grid' }, [
      fxTile('s1', 'shadow-1'),
      fxTile('s2', 'shadow-2'),
      fxTile('s3', 'shadow-3'),
      fxTile('g-accent', 'glow-accent'),
      fxTile('g-gold', 'glow-gold')
    ])
  )

  // ── Buttons ──
  const variantBtns = ['primary', 'secondary', 'ghost', 'stage', 'danger', 'gold'].map((v) =>
    track(createButton({ label: v, variant: v }))
  )
  const sizeBtns = ['sm', 'md', 'lg'].map((s) => track(createButton({ label: s.toUpperCase(), variant: 'secondary', size: s })))
  const stateBtns = [
    track(createButton({ label: '사건 접수 시작', variant: 'primary', icon: 'crosshair' })),
    track(createButton({ label: '불러오는 중', variant: 'primary', loading: true })),
    track(createButton({ label: '비활성', variant: 'secondary', disabled: true })),
    track(createButton({ label: '아이콘 버튼', variant: 'stage', icon: 'star' }))
  ]
  const blockBtn = track(createButton({ label: '판단 제출', variant: 'primary', icon: 'check', block: true }))
  const buttons = section('버튼 (Button)', 'variant · size · state',
    el('div', { class: 'demo__row' }, variantBtns),
    el('div', { class: 'demo__row' }, sizeBtns),
    el('div', { class: 'demo__row' }, stateBtns),
    el('div', { style: { maxWidth: '360px' } }, [blockBtn])
  )

  // ── Cards ──
  const cardBody = (t) => el('p', { class: 'text-2', style: { fontSize: 'var(--text-sm)' }, text: t })
  const cards = section('카드 (Card)', 'default · elevated · panel · glow',
    el('div', { class: 'demo__cards' }, [
      track(createCard({ title: 'Default', body: cardBody('기본 패널 표면입니다.') })),
      track(createCard({ variant: 'elevated', title: 'Elevated', body: cardBody('그림자로 떠 있는 카드.') })),
      track(createCard({ variant: 'panel', title: 'Panel', body: cardBody('그라디언트 패널 배경.') })),
      track(createCard({ title: 'Glow', glow: true, body: cardBody('Accent Glow가 적용된 카드.') }))
    ])
  )

  // ── Progress / meters ──
  const meterPrimary = track(createProgressBar({ label: 'Progress', value: 7, max: 15 }))
  const meterAccent = track(createProgressBar({ label: 'EXP', value: 35, max: 100, variant: 'accent' }))
  const meterHealth = track(createProgressBar({ label: '빌런왕 HP', value: 62, max: 100, variant: 'health' }))
  const meterGold = track(createProgressBar({ label: 'Badge', value: 90, max: 100, variant: 'gold' }))
  const metersReal = section('진행 표시 (Progress / Meters)', 'primary · accent · health · gold',
    el('div', { class: 'demo__grid' }, [meterPrimary, meterAccent, meterHealth, meterGold])
  )

  // ── Modal ──
  const modal = createModal({
    title: '판단을 제출하시겠습니까?',
    content: el('p', { text: '제출 후에는 수정할 수 없습니다. 선택한 판단으로 사건을 종결합니다.' }),
    actions: [
      { label: '다시 검토', variant: 'ghost' },
      { label: '최종 제출', variant: 'primary' }
    ]
  })
  parts.push(modal)
  const openModalBtn = track(createButton({ label: '모달 열기', variant: 'secondary', icon: 'panel', onClick: () => modal.open() }))
  const modalSection = section('모달 (Modal)', 'ESC · 배경 클릭 · 닫기 버튼으로 종료',
    el('div', { class: 'demo__row' }, [openModalBtn])
  )

  // ── States ──
  const loading = track(createLoadingState({ message: '사건 파일을 불러오는 중…' }))
  const error = track(createErrorState({ title: '연결이 불안정합니다', message: 'PM보호국 서버와 다시 연결을 시도합니다.', onRetry: () => {} }))
  const empty = track(createEmptyState({ title: '표시할 사건이 없습니다', message: '관리자가 게임을 시작하면 사건이 배정됩니다.' }))
  const wrapState = (node) => el('div', { class: 'card' }, [node])
  const states = section('상태 (Loading / Error / Empty)', '',
    el('div', { class: 'demo__states' }, [wrapState(loading.el), wrapState(error.el), wrapState(empty.el)])
  )

  const node = el('div', { class: 'demo anim-fade' }, [
    el('div', { class: 'demo__hero' }, [
      el('div', { class: 'demo__row' }, [
        el('span', { class: 'stamp', text: 'CLASSIFIED · PMB-2026' }),
        el('span', { class: 'demo__eyebrow', text: 'CASE FILE // DESIGN SYSTEM' })
      ]),
      el('h1', { class: 'demo__title', text: 'PM보호국 UI 시스템' }),
      el('p', { class: 'demo__lead', text: '검은색 기반의 수사 터미널 UI. 케이스 파일 무드의 토큰·공통 컴포넌트·3단 대시보드 셸을 한 화면에서 확인합니다.' })
    ]),
    toolbar,
    colors,
    typography,
    spacing,
    effects,
    buttons,
    cards,
    metersReal,
    modalSection,
    states
  ])

  return {
    el: node,
    mount (parent) { parent.append(node); return node },
    destroy () { parts.forEach((p) => p.destroy && p.destroy()); node.remove() }
  }
}
