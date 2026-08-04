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
import { FLOW } from '../../constants/flow.js'
import { STAGE_META, STAGE_ITEM_ICONS } from '../../constants/stages.js'
import { localizeCase } from '../../data/cases.js'
import { gradeCase } from '../../lib/grade.js'
import { findTeam } from '../../lib/teams.js'
import { remainingSeconds, ensureStarted } from '../../lib/game.js'
import { getProgress, recordSubmission, getRanking, STAGE_TOTALS } from '../../lib/progress.js'
import { stageCases, builtTotal, submittedCount, isStageComplete, firstIncompleteStage } from '../../lib/stage-progress.js'
import { createButton } from '../../../components/primitives/button.js'
import { createModal } from '../../../components/primitives/modal.js'
import { createAppShell } from '../../../components/shell/app-shell.js'
import { createEvidenceViewer } from '../../../components/game/evidence-viewer.js'
import { createQuestionChoice } from '../../../components/game/question-choice.js'
import { createCaptureGuard } from '../../../components/game/capture-guard.js'

// Stage 메타·보상 아이템 표는 constants/stages.js가 단일 출처 (임명·레이드·랭킹 화면도 같은 표를 쓴다).

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
    items: [1, 2, 3].map((s) => ({
      label: `STAGE ${s}`,
      name: t(STAGE_META[s].item.nameKey), // 슬롯 tooltip — 장비 이름을 확인할 수 있게
      acquired: (p.submittedStage[s] || 0) >= builtTotal(s),
      icon: STAGE_ITEM_ICONS[s]
    })),
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
  // 스테이지 사건 목록·완료 판정은 lib/stage-progress.js가 단일 출처 — 라우터 가드와 같은 기준을 쓴다.
  const stageCasesFor = (s) => stageCases(s)

  function mountView (node) {
    clearView() // 이전 화면 컴포넌트만 해제
    viewParts = nextParts
    nextParts = []
    caseHost.replaceChildren(node)
    // 하위 화면 전환 시 맨 위에서 시작 — 셸의 스크롤러(.app-main)와 flow root 둘 다 되돌린다.
    caseHost.scrollTop = 0
    if (shell.content.parentElement) shell.content.parentElement.scrollTop = 0
    if (ctx && ctx.scrollToTop) ctx.scrollToTop()
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
    // 사건 조사 중에는 무음 — Stage 통과 음악(quiz-pass)이 다음 사건까지 흐르지 않게 끊는다
    // (docs/game-flow.md §22: Stage 진행 = 무음 또는 낮은 볼륨).
    if (ctx && ctx.audio) ctx.audio.stopSfx()
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

    let submitted = false // 같은 사건 이중 제출 가드 (서버 이관 후에도 클라이언트 1차 방어로 유지)

    function doSubmit () {
      if (submitted) return
      const idx = choice.getSelected()
      if (idx < 0) return
      submitted = true
      const { isCorrect, correctIndex, analysis } = gradeCase(caseData.id, idx)
      choice.reveal(correctIndex, idx)
      // 제출이 끝나면 [판단 제출]은 비활성 상태로 남긴다 — 다시 누를 수 없고, 제출이 끝났음이 보인다.
      // (hidden 속성은 .btn의 display 규칙에 덮여 먹지 않으므로 disabled로 확실히 잠근다.)
      submitBtn.update({ label: t('case.submitted'), disabled: true })
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
          el('span', { class: 'mono', text: `${t('case.fileLabel')} ${caseData.fileNo} · ${i + 1}/${cases.length}` }),
          // 임시(Mock) 사건 표시 — 데이터의 placeholder 플래그만 본다. 확정 콘텐츠로 교체하면 자동으로 사라진다.
          caseData.placeholder
            ? el('span', { class: 'case__temp mono caps', text: t('case.temp'), title: t('case.tempHint') })
            : null
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
    // Stage 통과 사운드 (docs/game-flow.md §22). 실패해도 조용히 넘어간다 — 연출은 진행을 막지 않는다.
    if (ctx && ctx.audio) ctx.audio.playSfx(ASSETS.bgm.quizPass, { volume: 0.7 })
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

  // ── SCR-013 Item Acquisition (Stage 1 방패 / Stage 2 승인서 / Stage 3 배째 마스터) ──
  function showItem (s) {
    setTheme(s)
    refreshSidebar() // 좌측 아이템 슬롯 활성화(제출 완료로 이미 해제됨)
    const meta = STAGE_META[s]
    const item = meta.item
    const hasNext = s < 3
    const nextBtn = trackView(createButton({
      // 다음 단계 라벨은 스테이지 메타가 정한다. Stage 3 = 감독관 임명(SCR-015)으로 넘어간다.
      label: t((item && item.nextKey) || 'item.equip'),
      variant: 'gold', size: 'lg', icon: 'crosshair', block: true,
      onClick: () => (hasNext ? showBriefing(s + 1) : ctx.goTo(FLOW.APPOINT))
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
      // Final Raid 효과 — 아이템이 실제로 무엇을 해주는지 한 줄로 못 박는다(획득 실감).
      item && item.effectKey
        ? el('div', { class: 'item-acq__effect' }, [
          el('span', { class: 'item-acq__effect-key caps mono', text: t('item.effectLabel') }),
          el('span', { class: 'item-acq__effect-val', text: t(item.effectKey) })
        ])
        : null,
      el('p', { class: 'item-acq__desc', text: item ? t(item.descKey) : '' }),
      el('p', { class: 'item-acq__congrats', text: item ? t(item.congratsKey) : '' }),
      nextBtn.el
    ]))
  }

  // ── 새로고침 복구: 진행 상황으로 현재 하위 화면 판정 (CLAUDE.md §2) ──
  // 판정 순서: (1) 미완료 스테이지가 있으면 그 스테이지의 브리핑/첫 미제출 사건,
  //           (2) 세 스테이지를 모두 마쳤으면 Stage 3 결과 화면 — 결과→보상→감독관 임명으로 이어진다.
  //           (마지막 사건 제출 직후 새로고침해도 아이템 획득 연출을 건너뛰지 않는다.)
  const stage = firstIncompleteStage(teamId)
  const cases = stageCasesFor(stage)
  const done = submittedCount(teamId, stage)
  if (isStageComplete(teamId, stage)) {
    showStageResult(stage) // = Stage 3 완료 상태(firstIncompleteStage가 3을 반환)
  } else if (cases.length === 0 || done === 0) {
    showBriefing(stage) // 사건 없는 스테이지 또는 스테이지 시작 전 → 브리핑
  } else {
    const p = getProgress(teamId)
    const idx = cases.findIndex((c) => !p.submitted.includes(c.id))
    showCase(stage, idx < 0 ? 0 : idx) // 진행 중 → 첫 미제출 사건부터
  }

  return {
    el: shell.el,
    mounted () { if (ctx && ctx.audio) ctx.audio.stopBgm() }, // 게임플레이 진입 시 BGM 정지
    destroy () {
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      if (ctx && ctx.audio) ctx.audio.stopSfx() // Stage 통과 음악이 다음 화면까지 흐르지 않게
      closeConfirm()
      clearView()
      parts.forEach((p) => p && p.destroy && p.destroy())
    }
  }
}
