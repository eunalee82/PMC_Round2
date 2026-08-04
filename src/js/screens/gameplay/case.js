// SCR-007~013 — Stage 게임플레이 컨트롤러. 3단 셸(헤더+좌측 사이드바) 안에서 하위 화면을 전환한다:
//   Briefing(SCR-007) → Case(SCR-008)+제출확인(SCR-009) → 결과/해설(SCR-010/011)
//   → 마지막 사건이면 Stage Result(SCR-012) → Item Acquisition(SCR-013) → 다음 Stage Briefing.
// 데이터 기반: 사건은 data/cases.js, 채점은 lib/grade.js(MOCK), 진행/점수/제출은 lib/progress.js(MOCK).
// 운영정책(§8.3): 한 스테이지의 모든 사건 제출 = 완료. 점수 무관 다음 스테이지 진입 허용. 문제별 타이머 없음.
// 새로고침 복구(§2): 진행 상황으로 현재 하위 화면을 판정해 재진입한다. 용어는 게임 용어로 출력(§15).
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { t } from '../../lib/copy.js'
import { ASSETS } from '../../constants/assets.js'
import { CASES, localizeCase } from '../../data/cases.js'
import { gradeCase } from '../../lib/grade.js'
import { findTeam } from '../../lib/teams.js'
import { remainingSeconds, ensureStarted } from '../../lib/game.js'
import { getProgress, recordSubmission, getRanking, STAGE_TOTALS } from '../../lib/progress.js'
import { createButton } from '../../../components/primitives/button.js'
import { createModal } from '../../../components/primitives/modal.js'
import { createAppShell } from '../../../components/shell/app-shell.js'
import { createEvidenceViewer } from '../../../components/game/evidence-viewer.js'
import { createQuestionChoice } from '../../../components/game/question-choice.js'
import { createCaptureGuard } from '../../../components/game/capture-guard.js'

// 스테이지 메타 — 브리핑 문구/테마/도메인 + 완료 보상 아이템(SCR-013). 아이템은 완성된 스테이지만 필요.
const STAGE_META = {
  1: {
    theme: '1', label: 'MISSION 01 · MINDSET', domain: 'Mindset',
    nameKey: 'briefing.stage1.name', missionKey: 'briefing.stage1.mission',
    item: { icon: 'shield', bg: ASSETS.backgrounds.onePass, rarityKey: 'item.stage1.rarity', nameKey: 'item.stage1.name', descKey: 'item.stage1.desc', congratsKey: 'item.stage1.congrats' }
  },
  2: { theme: '2', label: 'MISSION 02 · PERFORMANCE DOMAIN', domain: 'Performance Domain', nameKey: 'briefing.stage2.name', missionKey: 'briefing.stage2.mission' },
  3: { theme: '3', label: 'MISSION 03 · AI USE CASE', domain: 'AI Use Case', nameKey: 'briefing.stage3.name', missionKey: 'briefing.stage3.mission' }
}
const STAGE_KEYS = { 1: 'mindset', 2: 'domain', 3: 'ai' }

// DEV 전용 스테이지 점프 — 아직 사건이 없는 스테이지(예: Stage 2) 때문에 뒤 스테이지를 정상 흐름으로
// 열 수 없어서, 제작 중인 스테이지를 바로 확인할 수단을 둔다. 프로덕션 빌드에서는 DEV 메뉴가 제거되어
// 호출자가 없다(진행 판정 로직 자체는 건드리지 않는다).
let devStage = null
export function setDevStage (s) { devStage = s }

// 좌측 사이드바 스냅샷 — 진행 상황(progress) + 랭킹(getRanking).
// EVIDENCE 아이템 = 해당 스테이지의 모든 사건을 '제출 완료'했을 때 해제(정답 여부 무관).
function sidebarSnapshot (teamId, teamName, p) {
  const ranking = getRanking()
  const scored = ranking.filter((r) => r.score > 0)
  const base = scored.length ? scored : ranking.filter((r) => r.teamId === teamId)
  const rankingRows = base.slice(0, 4).map((r) => ({ rank: r.rank, name: r.name, score: r.score, isMe: r.teamId === teamId }))
  return {
    team: { name: teamName, rank: t('agent.rankRookie'), score: p.score, scoreMax: 300 },
    ranking: teamName !== 'UNASSIGNED' ? rankingRows : [],
    stageScore: [
      { key: 'mindset', label: 'Mindset', score: p.stage[1] || 0, max: STAGE_TOTALS[1] },
      { key: 'domain', label: 'Domain', score: p.stage[2] || 0, max: STAGE_TOTALS[2] },
      { key: 'ai', label: 'AI', score: p.stage[3] || 0, max: STAGE_TOTALS[3] }
    ],
    items: [
      { label: 'STAGE 1', acquired: (p.submittedStage[1] || 0) >= STAGE_TOTALS[1], icon: 'shield' },
      { label: 'STAGE 2', acquired: (p.submittedStage[2] || 0) >= STAGE_TOTALS[2] },
      { label: 'STAGE 3', acquired: (p.submittedStage[3] || 0) >= STAGE_TOTALS[3] }
    ],
    version: '1.0.0'
  }
}

export function createCaseScreen (ctx) {
  const parts = [] // 화면 수명 컴포넌트(셸·가드)
  const track = (c) => { parts.push(c); return c }
  // 하위 화면 컴포넌트 수명 — 화면 전환 시 '이전 화면'만 정리해야 한다.
  // 조립 중인 컴포넌트는 nextParts에 모으고 mountView 시점에 viewParts로 승격한다.
  // (한 배열만 쓰면 clearView가 방금 만든 컴포넌트를 destroy해 — destroy()는 el.remove() —
  //  단서 뷰어·보기·버튼이 마운트 직전에 DOM에서 사라진다.)
  let viewParts = [] // 현재 마운트된 하위 화면 컴포넌트
  let nextParts = [] // 조립 중인 다음 하위 화면 컴포넌트
  const trackView = (c) => { nextParts.push(c); return c }
  const trackMounted = (c) => { viewParts.push(c); return c } // 이미 마운트된 화면에 덧붙이는 컴포넌트
  const clearView = () => { viewParts.forEach((p) => p && p.destroy && p.destroy()); viewParts = [] }
  let confirmModal = null
  const closeConfirm = () => { if (confirmModal) { confirmModal.destroy(); confirmModal = null } }

  const teamId = ctx && ctx.session ? ctx.session.teamId : null
  const team = findTeam(teamId)
  const teamName = team ? team.name : 'UNASSIGNED'

  ensureStarted() // 문제 입장 = 미션 타이머 시작 보장

  const prevStage = document.documentElement.dataset.stage
  const caseHost = el('div', { class: 'case__inner anim-fade' })

  const shell = track(createAppShell({
    header: { running: true, timerSeconds: remainingSeconds() },
    sidebar: sidebarSnapshot(teamId, teamName, getProgress(teamId))
  }))
  shell.content.append(caseHost)
  track(createCaptureGuard({ label: team ? team.name : '테스트' }))

  const setTheme = (s) => { document.documentElement.dataset.stage = String(s) }
  const refreshSidebar = () => shell.sidebar.update(sidebarSnapshot(teamId, teamName, getProgress(teamId)))
  const stageCasesFor = (s) => CASES.filter((c) => c.stage === s).sort((a, b) => a.caseNo - b.caseNo)
  const submittedCount = (s) => { const p = getProgress(teamId); return stageCasesFor(s).filter((c) => p.submitted.includes(c.id)).length }
  const stageComplete = (s) => { const cs = stageCasesFor(s); return cs.length > 0 && submittedCount(s) >= cs.length }
  function firstIncompleteStage () { for (let s = 1; s <= 3; s++) { if (!stageComplete(s)) return s } return 3 }

  function mountView (node) {
    clearView() // 이전 화면 컴포넌트만 해제
    viewParts = nextParts
    nextParts = []
    caseHost.replaceChildren(node)
    caseHost.scrollTop = 0
  }

  // ── SCR-007 Stage Briefing ──
  function showBriefing (s) {
    setTheme(s)
    const meta = STAGE_META[s]
    const cases = stageCasesFor(s)
    const ready = cases.length > 0
    const startBtn = trackView(createButton({
      label: ready ? t('briefing.start') : t('briefing.pending'),
      variant: 'primary', size: 'lg', icon: 'crosshair', block: true, disabled: !ready,
      onClick: () => showCase(s, 0)
    }))
    const metaRow = (k, v) => el('div', { class: 'brief__meta-row' }, [
      el('span', { class: 'brief__meta-key caps mono', text: k }),
      el('span', { class: 'brief__meta-val', text: v })
    ])
    mountView(el('div', { class: 'brief' }, [
      el('span', { class: 'brief__label caps mono', text: t('briefing.label') }),
      el('div', { class: 'brief__stageno mono', text: `STAGE ${s}` }),
      el('h1', { class: 'brief__name', text: t(meta.nameKey) }),
      el('p', { class: 'brief__mission', text: t(meta.missionKey) }),
      el('div', { class: 'brief__meta' }, [
        metaRow(t('briefing.domain'), meta.domain),
        metaRow(t('briefing.cases'), `${cases.length || STAGE_TOTALS[s]}`),
        metaRow(t('briefing.reward'), meta.item ? t(meta.item.nameKey) : '—')
      ]),
      startBtn.el
    ]))
  }

  // ── SCR-008/009/010/011 Case + 제출확인 + 결과 ──
  function showCase (s, i) {
    setTheme(s)
    const cases = stageCasesFor(s)
    if (i >= cases.length) { showStageResult(s); return }
    const caseData = localizeCase(cases[i]) // 로케일 반영(en 없으면 ko)

    const evidence = trackView(createEvidenceViewer({ evidence: caseData.evidence, label: t('case.evidenceLabel') }))
    const resultBox = el('div', { class: 'case-result', hidden: true })
    const choice = trackView(createQuestionChoice({
      choices: caseData.choices,
      onChange: () => submitBtn.update({ disabled: choice.getSelected() < 0 })
    }))
    const submitBtn = trackView(createButton({
      label: t('case.submit'), variant: 'primary', size: 'lg', icon: 'crosshair', block: true, disabled: true,
      onClick: () => openConfirm()
    }))

    // SCR-009 제출 확인 — 실수 제출 방지
    function openConfirm () {
      if (choice.getSelected() < 0) return
      closeConfirm()
      confirmModal = createModal({
        title: t('confirm.title'),
        size: 'sm',
        content: [el('p', { class: 'auth-hint', text: t('confirm.msg') })],
        actions: [
          { label: t('confirm.cancel'), variant: 'ghost' },
          { label: t('confirm.submit'), variant: 'primary', onClick: () => doSubmit() }
        ],
        onClose: () => { confirmModal = null }
      })
      confirmModal.open()
    }

    function doSubmit () {
      const idx = choice.getSelected()
      if (idx < 0) return
      const { isCorrect, correctIndex, analysis } = gradeCase(caseData.id, idx)
      choice.reveal(correctIndex, idx)
      submitBtn.el.hidden = true
      recordSubmission(teamId, caseData.id, caseData.stage, isCorrect) // 제출 시각 + 정답 시 가산(중복 무시)
      refreshSidebar()

      resultBox.hidden = false
      resultBox.className = 'case-result ' + (isCorrect ? 'is-correct' : 'is-wrong')
      const badge = el('div', { class: 'case-result__badge' }, [
        icon(isCorrect ? 'check' : 'alert', { size: 22 }),
        el('div', {}, [
          el('strong', { class: 'case-result__title', text: isCorrect ? t('case.resolved') : t('case.incorrect') }),
          el('span', { class: 'case-result__sub', text: isCorrect ? t('case.resolvedKo') : t('case.incorrectKo') })
        ])
      ])
      const report = el('div', { class: 'case-report' }, [
        el('span', { class: 'case-report__label caps mono', text: t('case.analysisTitle') }),
        el('p', { class: 'case-report__body', text: analysis || t('case.noAnalysis') })
      ])
      const hasNext = i + 1 < cases.length
      const nextBtn = trackMounted(createButton({ // 이미 마운트된 사건 화면에 덧붙는다
        label: hasNext ? t('case.next') : t('case.nextLast'),
        variant: 'stage', icon: 'crosshair',
        onClick: () => (hasNext ? showCase(s, i + 1) : showStageResult(s))
      }))
      resultBox.replaceChildren(badge, report, nextBtn.el)
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    mountView(el('div', { class: 'case-view' }, [
      el('header', { class: 'case__head' }, [
        el('span', { class: 'case__mission mono caps', text: STAGE_META[s].label }),
        el('div', { class: 'case__file' }, [
          icon('file', { size: 15 }),
          el('span', { class: 'mono', text: `${t('case.fileLabel')} ${caseData.fileNo} · ${i + 1}/${cases.length}` })
        ]),
        el('h1', { class: 'case__title', text: caseData.title })
      ]),
      el('section', { class: 'case__brief' }, [
        el('span', { class: 'case__label caps mono', text: t('case.briefLabel') }),
        el('p', { class: 'case__brief-body', text: caseData.brief })
      ]),
      evidence.el,
      el('section', { class: 'case__prompt' }, [
        el('p', { class: 'case__prompt-text', text: caseData.prompt }),
        el('span', { class: 'case__hint', text: t('case.selectHint') })
      ]),
      choice.el,
      submitBtn.el,
      resultBox
    ]))
  }

  // ── SCR-012 Stage Result ──
  function showStageResult (s) {
    setTheme(s)
    refreshSidebar()
    const p = getProgress(teamId)
    const total = stageCasesFor(s).length
    const solved = p.stage[s] || 0
    const score = solved * 20
    const rate = total ? Math.round((solved / total) * 100) : 0
    const stat = (k, v) => el('div', { class: 'sresult__stat' }, [
      el('span', { class: 'sresult__stat-val mono', text: v }),
      el('span', { class: 'sresult__stat-key caps', text: k })
    ])
    const rewardBtn = trackView(createButton({
      label: t('result.reward'), variant: 'primary', size: 'lg', icon: 'award', block: true,
      onClick: () => showItem(s)
    }))
    mountView(el('div', { class: 'sresult' }, [
      el('span', { class: 'case__mission mono caps', text: STAGE_META[s].label }),
      el('h1', { class: 'sresult__title mono', text: t('result.title') }),
      el('p', { class: 'sresult__sub', text: t('result.sub') }),
      el('div', { class: 'sresult__stats' }, [
        stat(t('result.solved'), `${solved}/${total}`),
        stat(t('result.score'), String(score)),
        stat(t('result.rate'), `${rate}%`)
      ]),
      rewardBtn.el
    ]))
  }

  // ── SCR-013 Item Acquisition (갑질 미러 방패) ──
  function showItem (s) {
    setTheme(s)
    refreshSidebar() // 좌측 아이템 슬롯 활성화(제출 완료로 이미 해제됨)
    const meta = STAGE_META[s]
    const item = meta.item
    const hasNext = s < 3
    const nextBtn = trackView(createButton({
      label: s === 1 ? t('item.next') : t('item.equip'),
      variant: 'gold', size: 'lg', icon: 'crosshair', block: true,
      onClick: () => (hasNext ? showBriefing(s + 1) : showBriefing(s)) // Stage 3 이후(임명)는 이후 단계
    }))
    const hero = item
      ? el('div', { class: 'item-acq__hero', style: item.bg ? { backgroundImage: `linear-gradient(rgba(6,7,11,0.55), rgba(6,7,11,0.82)), url('${item.bg}')` } : null }, [
        el('span', { class: 'item-acq__silhouette' }, [icon(item.icon || 'award', { size: 92 })])
      ])
      : null
    mountView(el('div', { class: 'item-acq' }, [
      hero,
      el('span', { class: 'item-acq__rarity caps mono', text: item ? t(item.rarityKey) : t('item.acquire') }),
      el('h1', { class: 'item-acq__name', text: item ? t(item.nameKey) : '' }),
      el('p', { class: 'item-acq__desc', text: item ? t(item.descKey) : '' }),
      el('p', { class: 'item-acq__congrats', text: item ? t(item.congratsKey) : '' }),
      nextBtn.el
    ]))
  }

  // ── 새로고침 복구: 진행 상황으로 현재 하위 화면 판정 (DEV 점프가 있으면 그 스테이지) ──
  const stage = devStage || firstIncompleteStage()
  const cases = stageCasesFor(stage)
  const done = submittedCount(stage)
  if (cases.length === 0 || done === 0) {
    showBriefing(stage) // 사건 없는 스테이지(예: Stage 2 준비 중) 또는 스테이지 시작 전 → 브리핑
  } else if (done < cases.length) {
    const p = getProgress(teamId)
    const idx = cases.findIndex((c) => !p.submitted.includes(c.id))
    showCase(stage, idx < 0 ? 0 : idx) // 진행 중 → 첫 미제출 사건부터
  } else {
    showBriefing(stage) // 방어적: 완료 스테이지면 firstIncompleteStage가 다음을 가리킴
  }

  return {
    el: shell.el,
    mounted () { if (ctx && ctx.audio) ctx.audio.stopBgm() }, // 게임플레이 진입 시 BGM 정지
    destroy () {
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      closeConfirm()
      clearView()
      parts.forEach((p) => p && p.destroy && p.destroy())
    }
  }
}
