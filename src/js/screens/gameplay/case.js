// SCR — 사건(Case) 화면. 3단 셸(AppShell: 헤더 + 좌측 사이드바) 안에 사건 본문을 렌더한다 (LayOut.png).
// 좌측 패널(LeftSidebar) = 팀/Investigation Score · 랭킹 · Stage Score · Evidence 아이템.
// 문제 엔진 데모: 지금은 Stage 1 · 사건 #007 하나만. 채점은 lib/grade.js(MOCK) 결과로만 확정한다 (CLAUDE.md §7 §11).
// 진행 상황(점수·정답 수·제출 시각)은 lib/progress.js(MOCK)에 기록 → 서버 연동 시 store 구독으로 교체.
// 용어는 게임 용어로 출력 (CLAUDE.md §15): 문제=사건, 제출=판단 제출, 정답=사건 해결 …
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { t } from '../../lib/copy.js'
import { CASES } from '../../data/cases.js'
import { gradeCase } from '../../lib/grade.js'
import { findTeam } from '../../lib/teams.js'
import { remainingSeconds, ensureStarted } from '../../lib/game.js'
import { getProgress, recordSubmission, getRanking, STAGE_TOTALS } from '../../lib/progress.js'
import { createButton } from '../../../components/primitives/button.js'
import { createAppShell } from '../../../components/shell/app-shell.js'
import { createEvidenceViewer } from '../../../components/game/evidence-viewer.js'
import { createQuestionChoice } from '../../../components/game/question-choice.js'
import { createCaptureGuard } from '../../../components/game/capture-guard.js'

const STAGE_LABELS = {
  1: 'MISSION 01 · MINDSET',
  2: 'MISSION 02 · PERFORMANCE DOMAIN',
  3: 'MISSION 03 · AI USE CASE'
}

// 좌측 사이드바 스냅샷 — 진행 상황(progress) + 랭킹(getRanking)을 반영한다.
// 점수 = 20점 × 정답 수, Stage Score = 스테이지별 정답 수/총 사건 수.
// EVIDENCE 아이템 = 해당 스테이지의 모든 사건을 '제출 완료'했을 때 해제 (정답 여부 무관).
function sidebarSnapshot (teamId, teamName, p) {
  const ranking = getRanking()
  const scored = ranking.filter((r) => r.score > 0)
  const base = scored.length ? scored : ranking.filter((r) => r.teamId === teamId)
  const rankingRows = base.slice(0, 4).map((r) => ({ rank: r.rank, name: r.name, score: r.score, isMe: r.teamId === teamId }))
  return {
    team: { name: teamName, rank: '신입 수사관', score: p.score, scoreMax: 300 },
    ranking: teamName !== 'UNASSIGNED' ? rankingRows : [],
    stageScore: [
      { key: 'mindset', label: 'Mindset', score: p.stage[1] || 0, max: 3 },
      { key: 'domain', label: 'Domain', score: p.stage[2] || 0, max: 7 },
      { key: 'ai', label: 'AI', score: p.stage[3] || 0, max: 5 }
    ],
    items: [
      { label: 'STAGE 1', acquired: (p.submittedStage[1] || 0) >= STAGE_TOTALS[1] },
      { label: 'STAGE 2', acquired: (p.submittedStage[2] || 0) >= STAGE_TOTALS[2] },
      { label: 'STAGE 3', acquired: (p.submittedStage[3] || 0) >= STAGE_TOTALS[3] }
    ],
    version: '1.0.0'
  }
}

export function createCaseScreen (ctx) {
  const caseData = CASES[0] // 데모: Stage 1 · Q1
  const parts = []
  const track = (c) => { parts.push(c); return c }

  // Stage 테마 — 이 화면이 살아있는 동안만 accent를 Stage 컬러로 교체 (CLAUDE.md §5, tokens [data-stage]).
  const prevStage = document.documentElement.dataset.stage
  document.documentElement.dataset.stage = String(caseData.stage)

  // 문제 입장 = 미션 타이머 시작 시점 보장 (아직 시작 전이면 지금부터 60분 카운트다운).
  ensureStarted()

  const teamId = ctx && ctx.session ? ctx.session.teamId : null
  const team = findTeam(teamId)
  const teamName = team ? team.name : 'UNASSIGNED'

  const evidence = track(createEvidenceViewer({ evidence: caseData.evidence, label: t('case.evidenceLabel') }))
  const choice = track(createQuestionChoice({
    choices: caseData.choices,
    onChange: () => submitBtn.update({ disabled: choice.getSelected() < 0 })
  }))

  const resultBox = el('div', { class: 'case-result', hidden: true })

  const submitBtn = track(createButton({
    label: t('case.submit'),
    variant: 'primary',
    size: 'lg',
    icon: 'crosshair',
    block: true,
    disabled: true,
    onClick: onSubmit
  }))

  function onSubmit () {
    const idx = choice.getSelected()
    if (idx < 0) return
    const { isCorrect, correctIndex, analysis } = gradeCase(caseData.id, idx)
    choice.reveal(correctIndex, idx)
    submitBtn.el.hidden = true
    // 제출 시각 기록(종료 시간·동점 처리용) + 정답 시 점수 가산 → 좌측 패널 갱신
    const p = recordSubmission(teamId, caseData.id, caseData.stage, isCorrect)
    shell.sidebar.update(sidebarSnapshot(teamId, teamName, p))
    renderResult(isCorrect, analysis)
  }

  function renderResult (isCorrect, analysis) {
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
      el('p', { class: 'case-report__body', text: analysis || '분석 보고서가 아직 준비되지 않았습니다.' })
    ])

    // 다음 사건은 아직 없음(데모) — 후속 Stage 연결 전까지 비활성.
    const nextBtn = track(createButton({ label: t('case.next'), variant: 'stage', icon: 'crosshair', disabled: true }))

    resultBox.replaceChildren(
      badge,
      report,
      el('p', { class: 'case-result__note', text: '다음 사건은 준비 중입니다. (엔진 데모 — 사건 #007)' }),
      nextBtn.el
    )
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // 사건 본문 (셸 main 영역에 마운트)
  const caseInner = el('div', { class: 'case__inner anim-fade' }, [
    el('header', { class: 'case__head' }, [
      el('span', { class: 'case__mission mono caps', text: STAGE_LABELS[caseData.stage] || '' }),
      el('div', { class: 'case__file' }, [
        icon('file', { size: 15 }),
        el('span', { class: 'mono', text: `${t('case.fileLabel')} ${caseData.fileNo}` })
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
  ])

  // 3단 셸 — 좌측 패널(LeftSidebar) 포함 (요구사항: 게임플레이 화면에 좌측 패널 표시)
  const shell = track(createAppShell({
    header: {
      running: true, // 게임플레이 진입 = 미션 타이머 진행 (STANDBY → MISSION TIME)
      timerSeconds: remainingSeconds(), // 시작 시각 기준 남은 시간 (60분, lib/game.js)
      onAudio: () => { if (ctx && ctx.audio) ctx.audio.setMuted(!ctx.audio.muted) }
    },
    sidebar: sidebarSnapshot(teamId, teamName, getProgress(teamId))
  }))
  shell.content.append(caseInner)

  // 캡처 억제 — 워터마크 + 전체화면 게이트 + 복사/우클릭 차단 + PrtScn 경고 (모두 '억제' 수준).
  track(createCaptureGuard({ label: team ? team.name : '테스트' }))

  return {
    el: shell.el,
    mounted () {
      // 게임플레이 진입 시 BGM 정지 (요구사항: gameplay 들어가면 음악 멈춤).
      if (ctx && ctx.audio) ctx.audio.stopBgm()
    },
    destroy () {
      // Stage 테마 원복 (다른 화면에 accent가 새지 않도록)
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      parts.forEach((p) => p.destroy && p.destroy())
    }
  }
}
