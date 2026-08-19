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
import { localizeCase, loadCases } from '../../data/cases.js'
import { submitCase } from '../../lib/grade.js'
import { getClaimToken } from '../../lib/entries.js'
import { isSoloMode } from '../../lib/mode.js'
import { playerName } from '../../lib/player.js'
import { remainingSeconds, isEnded, subscribe as subscribeGame, getConnection, subscribeConnection } from '../../lib/game.js'
import { getProgress, getRanking, STAGE_TOTALS, SCORE_MAX, pointsFor, subscribeProgress } from '../../lib/progress.js'
import { stageCases, builtTotal, submittedCount, isStageComplete, firstIncompleteStage } from '../../lib/stage-progress.js'
import { createButton } from '../../../components/primitives/button.js'
import { createModal } from '../../../components/primitives/modal.js'
import { createAppShell } from '../../../components/shell/app-shell.js'
import { createEvidenceViewer } from '../../../components/game/evidence-viewer.js'
import { createQuestionChoice } from '../../../components/game/question-choice.js'
import { createCaptureGuard } from '../../../components/game/capture-guard.js'

// Stage 메타·보상 아이템 표는 constants/stages.js가 단일 출처 (임명·레이드·랭킹 화면도 같은 표를 쓴다).

// 랭킹 상위 4팀 — 아직 아무도 점수를 못 냈으면 내 팀 줄만 보여준다.
function rankingTop (teamId) {
  const ranking = getRanking()
  const scored = ranking.filter((r) => r.score > 0)
  const base = scored.length ? scored : ranking.filter((r) => r.teamId === teamId)
  return base.slice(0, 4).map((r) => ({ rank: r.rank, name: r.name, score: r.score, isMe: r.teamId === teamId }))
}

// 좌측 사이드바 스냅샷 — 진행 상황(progress) + 랭킹(getRanking).
// EVIDENCE 아이템 = 해당 스테이지의 모든 사건을 '제출 완료'했을 때 해제(정답 여부 무관).
// 연습 모드(solo)에는 겨룰 상대가 없다 → 랭킹 섹션을 비운다(빈 배열이면 화면에 줄이 그려지지 않는다).
function sidebarSnapshot (teamId, teamName, p, solo = false) {
  const rankingRows = solo ? [] : rankingTop(teamId)
  return {
    team: { name: teamName, rank: t('agent.rankRookie'), score: p.score, scoreMax: SCORE_MAX },
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

  const session = (ctx && ctx.session) || {}
  const solo = isSoloMode()
  const teamId = session.teamId || null
  const teamName = playerName(session)

  const prevStage = document.documentElement.dataset.stage
  const caseHost = el('div', { class: 'case__inner anim-fade' })

  const shell = track(createAppShell({
    // 연습 모드에는 제한 시간이 없다 → 미션 타이머 자체를 숨긴다(00:00 이 남으면 오해를 부른다).
    // [처음으로]도 연습 모드에만 붙인다 — 행사 중에는 사건 화면을 벗어나는 길을 열지 않는다.
    header: {
      running: !solo,
      timerSeconds: remainingSeconds(),
      showTimer: !solo,
      onHome: solo ? () => ctx.goHome() : null
    },
    sidebar: sidebarSnapshot(teamId, teamName, getProgress(teamId), solo)
  }))
  shell.content.append(caseHost)
  // 캡처 억제(워터마크·전체화면 게이트·복사 차단)는 행사 문제 유출을 막는 장치다.
  // 공개 연습 모드에서는 같은 문제를 누구에게나 열어 두는 것이 목적이므로 걸지 않는다
  // — 전체화면을 강제하면 "그냥 풀어보러 온" 사람에게 문턱만 된다 (운영 결정 2026-08-19).
  if (!solo) track(createCaptureGuard({ label: teamName === 'UNASSIGNED' ? '테스트' : teamName }))

  // 서버 연결 상태를 헤더에 반영 (Realtime / 5초 폴링 / 오프라인 / 연습 모드)
  shell.header.setConnection(getConnection())
  const unsubConn = subscribeConnection((mode) => shell.header.setConnection(mode))
  // 점수·랭킹 캐시가 갱신되면 사이드바를 다시 그린다(제출 직후 순위가 늦게 반영되던 문제).
  const unsubProgress = subscribeProgress(() => refreshSidebar())
  // 게임이 종료되면 제출을 시도하지 않아도 즉시 잠근다 (docs/supabase-minimum-design.md §9.1)
  let gameEnded = isEnded()
  let currentCase = null // { submitBtn, resultBox, isSubmitted }
  function applyEndedState () {
    if (!gameEnded || !currentCase || currentCase.isSubmitted()) return
    currentCase.submitBtn.update({ disabled: true })
    const box = currentCase.resultBox
    box.hidden = false
    box.className = 'case-result is-wrong'
    box.replaceChildren(el('div', { class: 'case-result__badge' }, [
      icon('alert', { size: 22 }),
      el('div', {}, [
        el('strong', { class: 'case-result__title', text: t('submitFail.game_ended') }),
        el('span', { class: 'case-result__sub', text: t('submitFail.hint') })
      ])
    ]))
  }
  const unsubGame = subscribeGame((status) => {
    gameEnded = status === 'ended'
    if (gameEnded) { shell.header.stopTimer(); applyEndedState() }
  })

  const setTheme = (s) => { document.documentElement.dataset.stage = String(s) }
  const refreshSidebar = () => shell.sidebar.update(sidebarSnapshot(teamId, teamName, getProgress(teamId), solo))
  // 스테이지 사건 목록·완료 판정은 lib/stage-progress.js가 단일 출처 — 라우터 가드와 같은 기준을 쓴다.
  const stageCasesFor = (s) => stageCases(s)

  function mountView (node) {
    currentCase = null // 사건 화면을 떠나면 종료 잠금 대상이 없다
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
    // 복수 정답 사건(사건 #005)은 정해진 개수를 다 골라야 제출할 수 있다.
    const multi = !!caseData.multi
    const need = multi ? (caseData.selectCount || 1) : 1
    const readyToSubmit = () => choice.getSelectedIndexes().length === need
    const choice = trackView(createQuestionChoice({
      choices: caseData.choices,
      multi,
      selectCount: need,
      onChange: () => submitBtn.update({ disabled: !readyToSubmit() })
    }))
    const submitBtn = trackView(createButton({
      label: t('case.submit'), variant: 'primary', size: 'lg', icon: 'crosshair', block: true, disabled: true,
      onClick: () => openConfirm()
    }))

    // SCR-009 제출 확인 — 실수 제출 방지
    function openConfirm () {
      if (!readyToSubmit()) return
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

    let submitted = false // 같은 사건 이중 제출 가드 (서버 유니크 제약과 이중화)

    async function doSubmit () {
      if (submitted) return
      if (!readyToSubmit()) return
      const picks = choice.getSelectedIndexes()
      submitted = true
      submitBtn.update({ loading: true, disabled: true })

      // 채점·저장은 서버가 한다. 화면은 응답으로만 결과를 확정한다 (CLAUDE.md §2 §7).
      // 단일 선택 사건은 기존 계약(choiceIndex)을 유지하고, 복수 정답 사건만 choiceIndexes 를 보낸다.
      const res = await submitCase({
        teamId,
        caseId: caseData.id,
        stage: caseData.stage,
        choiceIndex: multi ? null : picks[0],
        choiceIndexes: multi ? picks : null
      })
      submitBtn.update({ loading: false })

      if (!res.ok) {
        // 실패 사유를 보여주고 다시 시도할 수 있게 되돌린다(선택은 유지).
        submitted = false
        submitBtn.update({ label: t('case.submit'), disabled: false })
        resultBox.hidden = false
        resultBox.className = 'case-result is-wrong'
        resultBox.replaceChildren(el('div', { class: 'case-result__badge' }, [
          icon('alert', { size: 22 }),
          el('div', {}, [
            el('strong', { class: 'case-result__title', text: t(`submitFail.${res.reason}`) || t('submitFail.error') }),
            el('span', { class: 'case-result__sub', text: t('submitFail.hint') })
          ])
        ]))
        if (res.reason === 'game_ended' || res.reason === 'game_not_started' || res.reason === 'not_owner') {
          submitBtn.update({ label: t('case.submit'), disabled: true }) // 다시 눌러도 소용없는 상태
        }
        return
      }

      const { isCorrect, correctIndex, correctIndexes, analysis } = res
      choice.reveal(multi ? (correctIndexes || []) : correctIndex, multi ? picks : picks[0])
      // 제출이 끝나면 [판단 제출]은 비활성 상태로 남긴다 — 다시 누를 수 없고, 제출이 끝났음이 보인다.
      // (hidden 속성은 .btn의 display 규칙에 덮여 먹지 않으므로 disabled로 확실히 잠근다.)
      submitBtn.update({ label: t('case.submitted'), disabled: true })
      refreshSidebar() // 진행/점수는 서버 응답이 반영된 캐시에서 읽는다

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
        el('span', {
          class: 'case__hint',
          text: multi ? t('case.selectHintMulti').replace('{n}', String(need)) : t('case.selectHint')
        })
      ]),
      choice.el,
      submitBtn.el,
      resultBox
    ]))
    // mountView 가 currentCase 를 비우므로 마운트 뒤에 등록한다(종료 잠금 대상 지정).
    currentCase = { submitBtn, resultBox, isSubmitted: () => submitted }
    applyEndedState() // 이미 종료된 뒤 들어온 경우
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
    const score = solved * pointsFor(s) // Stage 배점: 1·2 = 7점, 3 = 6점 (constants/scoring.js)
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
  function renderRecovered () {
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
  }

  // 사건 본문은 서버에서 받아온다(보안: 번들에 없음 — 서버가 started+토큰일 때만 내려준다).
  // 받은 뒤에 현재 화면을 판정·렌더한다. 라우터 가드가 미시작/미인증이면 여기 오기 전에 되돌린다.
  async function bootstrap () {
    mountView(el('div', { class: 'case-loading' }, [el('p', { class: 'case-loading__text', text: t('case.loading') })]))
    try {
      // 연습 모드에는 팀 점유 토큰이 없다 — 본문은 공개 RPC(get_cases_public)로 받는다.
      await loadCases(teamId, solo ? null : getClaimToken(teamId))
    } catch (e) {
      console.warn('[case] 본문 로드 실패', e)
      const retry = trackView(createButton({ label: t('case.retry'), variant: 'primary', icon: 'refresh', onClick: () => bootstrap() }))
      mountView(el('div', { class: 'case-loading' }, [
        el('p', { class: 'case-loading__text', text: t('case.loadFail') }),
        retry.el
      ]))
      return
    }
    renderRecovered()
  }
  bootstrap()

  return {
    el: shell.el,
    mounted () { if (ctx && ctx.audio) ctx.audio.stopBgm() }, // 게임플레이 진입 시 BGM 정지
    destroy () {
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      if (ctx && ctx.audio) ctx.audio.stopSfx() // Stage 통과 음악이 다음 화면까지 흐르지 않게
      unsubConn()
      unsubProgress()
      unsubGame()
      closeConfirm()
      clearView()
      parts.forEach((p) => p && p.destroy && p.destroy())
    }
  }
}
