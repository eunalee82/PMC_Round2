// ⚠️ 사건 정답·해설 — **DEV/검증 전용 모듈**. 프로덕션 번들에는 포함되지 않는다.
//
// 운영 채점은 서버가 한다: Supabase `case_answers` 테이블 + `submit_answer` RPC
// (supabase/migrations/0001_init.sql · 0007). 이 파일은 두 곳에서만 쓴다.
//   1) lib/grade.js 의 mock 폴백 — `if (import.meta.env.DEV)` 안에서 동적 import 하므로
//      프로덕션 빌드에서는 분기 자체가 제거되고 이 파일도 번들에 들어가지 않는다.
//   2) scripts/export-seed.mjs · scripts/validate.mjs (Node 실행, 번들과 무관)
//
// 즉 **참가자 브라우저에는 정답이 내려가지 않는다** (CLAUDE.md §11).
// 서버 시드를 다시 만들려면: node scripts/export-seed.mjs → 0003_seed_answers.sql (커밋 금지)
import { getLocale } from '../lib/i18n.js'

// ──────────────────────────────────────────────────────────────────────────
// ⚠️ 정답·해설 — 클라이언트 노출 금지 대상 (CLAUDE.md §11). 지금은 MOCK 채점용으로만 둔다.
//    서버 연결(Step 3) 시 이 블록을 삭제하고 채점 RPC/Edge Function으로 옮긴다.
//    answerIndex 는 choices 배열의 0-기준 인덱스다 (예: 3 = 화면상 "4번").
// ──────────────────────────────────────────────────────────────────────────
export const SOLUTIONS = {
  'case-001': {
    // 확정 콘텐츠(2026-08-05) — 이미지 교체로 단서 5개 → 4개(CLUE 1~4), 해설 본문도 확정본으로 교체.
    answerIndex: 3, // 정답: ④ 단서 4 · 프로젝트 운영 현황
    analysis: [
      // 해설 문체는 15개 사건 전체가 존댓말이다 — 새 확정본도 같은 문체로 맞춘다(2026-08-05).
      '정답은 ④ 단서 4 · 프로젝트 운영 현황입니다.',
      'PMBOK® 8판의 Proactive Mindset은 현재 상태만 보고 안심하는 것이 아니라, 미래 위험과 잠재 문제를 미리 예측하고 대응하는 사고방식을 의미합니다. 단서 ④는 현재 진행률과 이슈 처리율 등 현재 상태만 보여줄 뿐 미래 위험이나 선제적 대응 관점이 나타나지 않아 Proactive Mindset과 가장 거리가 멉니다.',
      '[단서별 판단]\n① 단서 1 · 프로젝트 일정 예측 대시보드 — 오답입니다. 향후 일정 지연 가능성과 병목 위험을 예측하고 대응계획까지 검토하고 있습니다.\n② 단서 2 · 변경 영향 분석서 — 오답입니다. 변경이 일정·테스트·메모리에 미칠 영향을 사전에 분석하고 있습니다.\n③ 단서 3 · 회의 안건 — 오답입니다. 리스크 검토, Critical Path 점검, 변경 영향 검토 등 선제적 관리 활동을 포함합니다.\n④ 단서 4 · 프로젝트 운영 현황 — 정답입니다. 현재 성과 지표만 보고 있으며 미래 위험 예측이나 예방적 대응 관점이 보이지 않습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ④ Clue 4 · Project Operations Status.',
        'The Proactive Mindset of PMBOK® 8th Edition means not settling for a look at the present state, but foreseeing future risks and latent problems and acting on them in advance. Clue ④ shows only the present state — overall progress and issue resolution rate — with no view of future risk or pre-emptive response, so it is the farthest from the Proactive Mindset.',
        '[Clue by clue]\n① Clue 1 · Project Schedule Forecast Dashboard — Incorrect. It forecasts possible schedule delay and bottleneck risk, and reviews the response plans as well.\n② Clue 2 · Change Impact Analysis — Incorrect. It analyses in advance how the change will affect schedule, test cases and memory.\n③ Clue 3 · Meeting Agenda — Incorrect. It covers pre-emptive management activities: risk review, critical path check and change impact review.\n④ Clue 4 · Project Operations Status — Correct. It looks only at current performance indicators, with no future risk forecast or preventive response.'
      ].join('\n\n')
    }
  },
  // 사건 순서 2↔3 교체(2026-08-05) — 파일 순서는 CASES 와 다르다: 001 → 003 → 002
  'case-003': {
    answerIndex: 2, // 정답: 3번 (증거물 C)
    analysis: [
      '정답은 증거물 C입니다.',
      '증거물 C는 단순히 고객 요청을 반영하거나 품질을 높인 행동이 아닙니다. 길동 책임은 "요구사항을 모두 구현했는가?"보다 "고객이 실제로 원하는 결과에 도달했는가?"를 더 중요한 성공 기준으로 삼았습니다.',
      '특히 다음 행동이 Value-Driven Mindset을 보여줍니다.\n· 요구사항 충족 여부에 만족하지 않고 실제 이용 데이터를 확인했다.\n· 기능 수보다 고객이 얻는 결과를 우선했다.\n· 이미 개발한 기능이라도 가치가 낮으면 우선순위를 재조정했다.\n· 산출물의 양을 줄이면서도 실제 사용성과 고객가치를 높였다.\n· 프로젝트 성공을 일정·범위가 아니라 고객 성과로 정의했다.',
      '즉, 산출물(Output)을 완성하는 데 멈추지 않고 성과(Outcome)와 가치(Value)를 극대화한 의사결정입니다.',
      '[오답이 헷갈리는 이유]\n① 증거물 A — 좋은 범위관리지만, 판단 기준이 고객가치보다 계약 범위·일정 준수에 가깝습니다. Value-Driven이라면 단순 거절보다 기대가치·비용·일정 영향과 대안을 함께 검토했어야 합니다.\n② 증거물 B — 좋은 품질관리이자 예방적 행동으로 가치지향 요소가 있으나, 품질 강화가 기존 계획과 충돌하지 않았고 가치를 위해 우선순위·계획을 재조정한 결정까지는 아닙니다. 정답에 가장 가까운 강력한 오답입니다.\n④ 증거물 D — 겉으로는 고객 중심으로 보이지만, 고객 요청을 무조건 수용하고 팀의 지속가능성을 희생했습니다. 고객 요청이 곧 가치는 아니며, 기대효과·비용·리스크·팀 영향까지 함께 판단해야 합니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is Evidence C.',
        'Evidence C is not merely reflecting a customer request or raising quality. Lead Gildong made "Did the customer reach the outcome they actually wanted?" a more important success criterion than "Did we implement every requirement?"',
        'In particular, these actions show the Value-Driven Mindset:\n· Not satisfied with meeting requirements, he checked real usage data.\n· He prioritized the outcome the customer gains over the number of features.\n· Even for features already built, he re-prioritized when their value was low.\n· He reduced the volume of outputs while raising real usability and customer value.\n· He defined project success by customer outcome, not by schedule and scope.',
        'That is, a decision that did not stop at completing outputs (Output) but maximized outcome (Outcome) and value (Value).',
        '[Why the wrong options are confusing]\n① Evidence A — Good scope management, but the judgment leans on contract scope and schedule adherence rather than customer value. Value-Driven would weigh expected value, cost, schedule impact and alternatives instead of simply refusing.\n② Evidence B — Good quality management and preventive action, with a value-oriented element, but strengthening quality did not conflict with the plan and it did not re-prioritize for value. The strongest, closest wrong answer.\n④ Evidence D — Looks customer-centric on the surface, but accepting every customer request unconditionally sacrificed the team\'s sustainability. A customer request is not value itself; expected effect, cost, risk and team impact must be judged together.'
      ].join('\n\n')
    }
  },
  'case-002': {
    answerIndex: 3, // 정답: 4번 (녹취 D)
    analysis: [
      '정답은 녹취 D입니다.',
      'D의 말은 처음 들으면 상당히 합리적입니다. 전문가의 판단을 존중하고, 관련 조직의 합의를 유도하며, 실무자가 실행을 주도하게 하고, PM은 결과를 공식 계획에 반영합니다.',
      '그러나 이 사안은 단순한 기술 구현 방식이 아니라 품질·일정·고객 영향이 충돌하는 프로젝트 차원의 의사결정입니다. 홍길동 PM은 논의를 개발팀·품질팀에 맡길 수는 있지만, 두 조직이 서로 다른 목표를 가진 상황에서 다음 역할까지 내려놓아서는 안 됩니다.\n· 판단 기준 제시\n· 대안 간 이해상충 조정\n· 의사결정권자 식별\n· 최종 결정 또는 적절한 에스컬레이션\n· 결정 결과에 대한 책임',
      'D에서 PM은 전문가에게 "어떻게 실행할지"에 대한 권한을 준 것이 아니라, "무엇을 선택하고 그 결과를 누가 감당할지"까지 넘겼습니다. 또한 "보고자료에 반영하겠다"는 표현은 PM의 역할을 의사결정 리더가 아니라 기록자·일정 관리자 수준으로 축소합니다.',
      '[보기가 헷갈리는 이유]\n① 녹취 A — PM이 너무 직접 결정하는 것처럼 보이지만, 개발팀에는 기술적 분석·권고안 제시 권한을 주고 PM은 프로젝트 전체 영향을 통합해 결정합니다. 역할에 따른 권한과 책임이 비교적 명확합니다.\n② 녹취 B — 개발팀에 결정을 넘겼지만 그 범위가 이미 합의된 위험 허용범위 안에 있습니다. 세부 구현은 팀에 맡기되 자원 확보·결과 확인 책임을 유지하므로 적절한 Empowerment에 가깝습니다.\n③ 녹취 C — 상위 회의로 넘겼으나, 승인 권한을 벗어난 사안을 적절한 의사결정 기구로 올리는 것은 책임 회피와 다릅니다. 대안·권고안을 준비하고 결정 전에도 팀이 할 수 있는 조치를 지시하므로 Accountability가 유지됩니다.\n④ 녹취 D — 전문가 존중처럼 들리지만, 서로 충돌하는 판단을 조정하지 않고 두 조직의 합의에 맡깁니다. 결정 기준·시한·에스컬레이션 경로가 없고 PM은 결과를 기록하는 역할에 머뭅니다. 위임과 방임의 경계를 넘은 사례입니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is Recording D.',
        'D sounds quite reasonable at first: it respects the expert\'s judgment, guides the relevant organizations to consensus, lets the practitioner lead execution, and the PM reflects the result in the official plan.',
        'But this is not a mere technical implementation choice — it is a project-level decision where quality, schedule and customer impact collide. PM Hong Gildong may leave the discussion to the dev and QA teams, but with two organizations holding different goals, must not put down the following roles:\n· Setting the decision criteria\n· Coordinating conflicts of interest between alternatives\n· Identifying the decision-maker\n· Making the final call or escalating appropriately\n· Being accountable for the outcome of the decision',
        'In D, the PM did not grant authority over "how to execute" but handed off "what to choose and who bears the result." Saying "I\'ll reflect it in the report" also shrinks the PM\'s role from decision leader to a mere recorder and schedule keeper.',
        '[Why the wrong options are confusing]\n① Recording A — Looks like the PM decides too directly, but it grants the dev team authority for technical analysis and recommendations while the PM integrates the whole-project impact to decide. Authority and responsibility by role are relatively clear.\n② Recording B — The decision is handed to the dev team, but within an already-agreed risk tolerance. Implementation details are left to the team while the PM keeps responsibility for securing resources and confirming results — close to proper empowerment.\n③ Recording C — Escalated to a higher meeting, but raising a matter beyond one\'s approval authority to the proper decision body is not buck-passing. The PM prepares alternatives and recommendations and directs what the team can do even before the decision, so Accountability is maintained.\n④ Recording D — Sounds like respecting the expert, but it leaves conflicting judgments unmediated to the two organizations\' consensus. There is no decision criterion, deadline, or escalation path, and the PM stays in a recording role — crossing the line from delegation into neglect.'
      ].join('\n\n')
    }
  },
  // ── ⏳ STAGE 2 임시 정답·해설 (PLACEHOLDER) — 위 CASES의 임시 블록과 함께 교체한다 ──
  'case-s2-04': {
    answerIndex: 1, // 정답: 2번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ② 편익 실현 계획입니다.',
      'PMBOK® 8판의 Governance는 프로젝트를 "산출물을 인수하고 끝내는 활동"이 아니라 "약속한 편익이 실제로 실현되는지까지 책임지는 체계"로 봅니다. 종료 보고서에 인수 확인과 예산 반납만 있다면, 편익은 측정 책임자도 시점도 없는 상태로 방치됩니다.',
      '①③④는 모두 종료 절차를 다듬는 활동이며, 편익이 실현되는지에는 답하지 못합니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ② the benefits realization plan.',
        'Governance in PMBOK® 8th Edition treats a project not as "accept the deliverable and finish" but as a system accountable for whether the promised benefits actually materialize. If the closure report holds only acceptance and budget return, the benefit is left with no measurement owner and no measurement date.',
        '①, ③ and ④ all polish the closure procedure and none of them answers whether the benefit is realized.'
      ].join('\n\n')
    }
  },
  'case-s2-05': {
    answerIndex: 1, // 정답: 2번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ② EAC 재산정입니다.',
      'SPI 1.03은 일정이 약간 앞섰다는 뜻이지만, CPI 0.82는 1원의 가치를 얻기 위해 1.2원 이상을 쓰고 있다는 뜻입니다. 누적 실제원가가 계획의 128%인 상태에서 남은 기간이 4개월이라면, 현재 효율이 유지될 때 완료 시점 원가는 계획을 크게 초과합니다.',
      '따라서 "일정이 정상이므로 프로젝트가 정상"이라는 보고는 성립하지 않습니다. 완료시점예측(EAC)을 다시 산정하고 원가 초과 원인을 분리해 대응해야 합니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ② recalculate the EAC.',
        'SPI 1.03 means the schedule is slightly ahead, but CPI 0.82 means more than 1.2 won is being spent to earn 1 won of value. With cumulative actual cost at 128% of plan and four months remaining, holding the current efficiency puts the cost at completion far above plan.',
        'So "the schedule is fine, therefore the project is fine" does not hold. The estimate at completion (EAC) must be recalculated and the cost overrun causes isolated and addressed.'
      ].join('\n\n')
    }
  },
  'case-s2-06': {
    answerIndex: 2, // 정답: 3번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ③ 통제 절차를 거치지 않은 변경 누적(Scope Creep)입니다.',
      '개별 요청이 작다는 사실이 변경 통제를 면제해 주지는 않습니다. 17건이 기준선 갱신 없이 반영되면 범위·일정·원가 기준선과 실제 산출물이 어긋나고, 영향 분석과 회귀 시험 범위도 산정되지 않습니다.',
      '②는 결과로 드러난 증상이며, ①④는 근본 원인이 아닙니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ③ changes accumulating outside the control procedure (scope creep).',
        'A request being small does not exempt it from change control. When 17 of them land without a baseline update, the scope, schedule and cost baselines drift away from the actual deliverable, and neither impact analysis nor regression test scope is ever sized.',
        '② is a symptom that surfaced as a result; ① and ④ are not the root cause.'
      ].join('\n\n')
    }
  },
  'case-s2-07': {
    answerIndex: 2, // 정답: 3번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ③ 단일 진실 공급원(Single Source of Truth)입니다.',
      '이해관계자 신뢰는 보고 빈도나 양식이 아니라 "같은 숫자를 본다"는 사실에서 만들어집니다. 조직별로 다른 문서와 다른 산정 기준이 있으면 어떤 보고서를 고쳐도 숫자는 계속 어긋납니다.',
      '①②는 문제를 늦추거나 분산시킬 뿐이고, ④ 평균값은 근거 없는 숫자를 하나 더 만드는 선택입니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ③ a single source of truth.',
        'Stakeholder trust is built not on reporting frequency or format but on everyone seeing the same number. While each organization keeps its own document and its own calculation basis, fixing any single report leaves the numbers in conflict.',
        '① and ② only delay or spread the problem, and ④ simply manufactures one more number with no basis.'
      ].join('\n\n')
    }
  },
  'case-s2-08': {
    answerIndex: 0, // 정답: 1번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ① 리스크 관리대장 상시 갱신과 SPOF 대응입니다.',
      '리스크는 한 번 등록하는 문서 작업이 아니라 상시 관리 활동입니다. "핵심 인력 이탈"이 8개월간 갱신되지 않았다는 사실 자체가 관리 실패이며, 단일 실패점(SPOF)에는 백업 인력·지식 문서화·리뷰 실질화 같은 사전 대응이 필요합니다.',
      '②는 부분적 완화이고, ③은 사후 대응, ④는 노출 기간만 줄이며 SPOF 자체를 남겨 둡니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ① continuous risk register updates and a response to the SPOF.',
        'Risk management is a standing activity, not a one-time document entry. That "possible departure of key personnel" went eight months without an update is itself the management failure; a single point of failure calls for advance responses — backup staffing, knowledge documentation, review that is real rather than formal.',
        '② is a partial mitigation, ③ is reactive, and ④ only shortens exposure while leaving the SPOF in place.'
      ].join('\n\n')
    }
  },
  'case-s2-09': {
    answerIndex: 1, // 정답: 2번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ② 가치 단위의 완료 정의와 검증된 산출물 기준 진척 인정입니다.',
      '"코드는 다 됐다"는 진술은 검증되지 않은 자기 보고입니다. 인수 가능한 가치 단위로 완료를 정의하고 시험 통과 같은 객관적 증거로만 진척을 인정하면, 90%에서 멈추는 보고가 구조적으로 불가능해집니다.',
      '①③은 같은 기준으로 더 자주·다른 사람이 세는 것이고, ④는 과장을 제도화합니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ② define done as a unit of value and credit progress only against verified deliverables.',
        '"The code is done" is unverified self-reporting. Define completion as an acceptable unit of value and credit progress only on objective evidence such as passing a test, and a report that parks at 90% becomes structurally impossible.',
        '① and ③ just count the same basis more often or by a different person, and ④ institutionalizes the exaggeration.'
      ].join('\n\n')
    }
  },
  'case-s2-10': {
    answerIndex: 2, // 정답: 3번
    analysis: [
      '[임시 해설 — Stage 2 콘텐츠 확정 시 교체]',
      '정답은 ③ 대체 조달 경로 + 실가용 공수 기준의 자원 계획입니다.',
      '이 사건에는 두 개의 자원 리스크가 겹쳐 있습니다. 단일 공급사 의존(대체 경로 없음)과 겸직 과부하(계획 공수와 실가용 공수의 괴리)입니다. 하나만 해결하면 화재가 나도 대응 인력이 없거나, 인력이 있어도 부품이 없습니다.',
      '①은 오히려 단일 공급 의존을 강화하고, ②는 지연 자체를 막지 못하며, ④는 인원 수만 늘려 실가용 공수 문제를 그대로 둡니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        '[Temporary analysis — to be replaced when Stage 2 content is confirmed]',
        'The answer is ③ an alternative sourcing route plus a resource plan based on realistic available effort.',
        'Two resource risks overlap here: dependence on a single supplier (no alternative route) and overload from split assignments (planned effort diverging from available effort). Fix only one and either there is no one to respond when the fire happens, or there are people but no part.',
        '① actually deepens the single-supply dependence, ② does not prevent the delay itself, and ④ adds headcount while leaving the available-effort problem untouched.'
      ].join('\n\n')
    }
  },
  // ── STAGE 2 임시 정답·해설 끝 ──
  'case-011': {
    answerIndex: 3, // 정답: 4번 (품질 담당자 증언)
    analysis: [
      '정답은 ④ 품질 담당자 증언입니다.',
      'PMBOK® Guide 8판의 AI 채택 전략(Appendix X3.1.1)은 AI를 신뢰하는 것이 아니라, AI가 내놓은 결과를 비판적으로 검증하며 인간의 판단을 유지하는 것을 강조합니다.',
      '④는 "AI가 충분한 데이터를 참고했다면 신뢰할 수 있다"는 전제를 담고 있습니다. 즉 검증의 근거를 AI가 본 데이터의 양에 두고 있어, AI 출력 자체를 검증해야 한다는 가장 중요한 고려사항이 누락되었습니다.',
      '[보기별 해설]\n① 개발자 증언 — AI가 작성한 결과를 담당자가 확인·보완하므로 인간의 검증이 유지됩니다.\n② 일정 담당자 증언 — AI 초안을 활용하되 리더들이 의존관계와 자원배치를 검토하므로 적절한 활용입니다.\n③ 상품기획 담당자 증언 — AI는 다양한 대안 탐색에 활용하고 최종 결정은 팀이 내리므로 바람직합니다.\n④ 품질 담당자 증언(정답) — AI 결과의 신뢰를 전제하고 있어, AI 출력 자체에 대한 비판적 검증의 중요성이 충분히 반영되지 않았습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ④ the quality lead\'s testimony.',
        'The AI adoption strategy in PMBOK® Guide 8th Edition (Appendix X3.1.1) stresses not trusting AI, but critically verifying what AI produces while keeping human judgment in the loop.',
        '④ carries the premise that "if the AI referenced enough data, it can be trusted." It grounds verification in the volume of data the AI saw, so the single most important consideration — verifying the AI output itself — is missing.',
        '[Option-by-option]\n① The developer\'s testimony — The owner checks and supplements what the AI wrote, so human verification is preserved.\n② The schedule lead\'s testimony — An AI draft is used, but leaders review dependencies and resource allocation: appropriate use.\n③ The product planner\'s testimony — AI is used to explore alternatives while the team makes the final call: desirable.\n④ The quality lead\'s testimony (answer) — It presumes the AI result is trustworthy, so the importance of critically verifying the AI output itself is not sufficiently reflected.'
      ].join('\n\n')
    }
  },
  'case-012': {
    answerIndex: 1, // 정답: 2번 (확보 단서 B)
    analysis: [
      '정답은 ② 확보 단서 B입니다.',
      'PMBOK® Guide 8판은 AI 도입 시 기능 구현 효과뿐 아니라 운영 비용·유지 가능성·확장성 등 장기적 영향과 실행 가능성을 함께 검토할 것을 강조합니다.',
      '② 확보 단서 B는 운영 비용 증가 가능성이 제기되었음에도 이를 검토하지 않은 채 의사결정을 내렸습니다. 시범 운영 이후 드러난 문제(AI 사용 비용 급증 · 운영 조직의 인수 거부 · 추가 투자 계획 요구)와 가장 직접적으로 연결되는 단서입니다.',
      '[보기별 해설]\n① 확보 단서 A — AI 결과의 품질 검증 절차에 관한 문제로, 장기적 영향보다는 품질 관리 이슈에 가깝습니다.\n② 확보 단서 B(정답) — 미래 운영 비용 증가 가능성을 인지하고도 검토를 미루어 지속가능성과 실행 가능성을 고려하지 않았습니다.\n③ 확보 단서 C — 운영 역량 확보도 중요한 문제지만 핵심은 인력·역량 관리이며, 장기적 비용 영향과 직접 연결되는 단서는 아닙니다.\n④ 확보 단서 D — AI 기능 추가를 승인한 사실만으로는 잘못된 의사결정이라고 볼 수 없습니다. 프로젝트 변경 자체는 정상적인 관리 활동입니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ② Clue B.',
        'PMBOK® Guide 8th Edition stresses that adopting AI requires examining not only the delivered capability but also long-term impact and feasibility — operating cost, maintainability, scalability.',
        '② Clue B made the decision without examining a raised possibility of increased operating cost. It connects most directly to the problems that surfaced after pilot operation: the spike in AI usage costs, the operations organization refusing handover, and the demand for additional investment planning.',
        '[Option-by-option]\n① Clue A — Concerns the verification procedure for AI output; closer to a quality-management issue than to long-term impact.\n② Clue B (answer) — Aware of a possible rise in future operating cost, it deferred the review and so did not consider sustainability and feasibility.\n③ Clue C — Securing operational capability matters too, but its core is staffing and capability management, not a direct link to long-term cost impact.\n④ Clue D — Approving the AI capability alone cannot be judged a wrong decision; changing project scope is a normal management activity in itself.'
      ].join('\n\n')
    }
  },
  'case-013': {
    answerIndex: 3, // 정답: 4번 (Early Warning Signals)
    analysis: [
      '정답은 ④ Early Warning Signals입니다.',
      '대시보드상 일정(SPI 1.02), 비용(CPI 0.99), 마일스톤 상태는 모두 정상으로 보입니다. 그러나 AI는 결함 증가 · 재시험률 증가 · 인터페이스 변경 증가, 그리고 과거 실패 프로젝트와의 높은 유사도(81~89%)를 통해 미래 위험 패턴을 감지했습니다.',
      '현재 지표가 정상인데도 여러 지표의 변화 패턴에서 위험을 앞당겨 읽어내는 것 — PMBOK® Guide 8판의 Early Warning Signals 활용 사례입니다.',
      '[보기별 해설]\n① Risk Identification & Assessment — 리스크가 등록되어 있지만, AI 경고의 핵심 근거는 새 리스크 평가가 아니라 패턴 분석입니다.\n② Predictive Analytics for Planning — 미래 예측 요소는 있으나, 자원·일정 재계획보다 위험 징후 조기 탐지가 중심입니다.\n③ Real-Time Monitoring — 일정·비용 편차가 허용 범위를 벗어난 증거가 없으며 현재 상태는 정상입니다.\n④ Early Warning Signals(정답) — 현재 지표는 정상이어도 과거 실패 프로젝트와 유사한 패턴을 AI가 감지해 조기 경고를 생성했습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ④ Early Warning Signals.',
        'On the dashboard, schedule (SPI 1.02), cost (CPI 0.99) and milestone status all look normal. Yet the AI detected a future risk pattern from rising defects, a rising retest rate, increasing interface changes, and a high similarity to past failed projects (81–89%).',
        'Reading risk ahead of time from the change patterns across several indicators — even while current indicators are normal — is exactly the Early Warning Signals use case in PMBOK® Guide 8th Edition.',
        '[Option-by-option]\n① Risk Identification & Assessment — Risks are registered, but the core basis of the AI warning is pattern analysis, not the assessment of new risks.\n② Predictive Analytics for Planning — There is a forecasting element, but the focus is early detection of risk signals rather than resource/schedule replanning.\n③ Real-Time Monitoring — There is no evidence that schedule or cost variance exceeded the allowed range; the current state is normal.\n④ Early Warning Signals (answer) — Even with normal current indicators, the AI detected a pattern resembling past failed projects and generated an early warning.'
      ].join('\n\n')
    }
  },
  'case-s3-014': {
    answerIndex: 1, // 정답: 2번 (최 PM)
    analysis: [
      '정답은 ② 최 PM입니다.',
      'PMBOK® Guide 8판의 Risk Identification and Assessment는 AI로 잠재 리스크를 식별하는 데서 그치지 않고, 발생 가능성·영향도·우선순위를 평가해 선제적으로 대응하는 것까지 포함합니다.',
      '② 최 PM은 AI로 유사 프로젝트 데이터와 업계 벤치마크를 분석해 리스크를 식별하고, 위험 수준과 우선순위까지 평가해 대응하겠다고 답했습니다. 식별(Identification)과 평가(Assessment)를 모두 갖춘 유일한 응답입니다.',
      '[보기별 해설]\n① 이 PM — 과거 사례를 활용한 리스크 식별은 수행하지만 위험도 평가가 부족합니다.\n② 최 PM(정답) — AI로 리스크를 식별하고 위험 수준과 우선순위까지 평가해 대응합니다.\n③ 한 PM — 리스크 목록 관리에 초점이 있으며 평가(Assessment) 활동이 나타나지 않습니다.\n④ 박 PM — 유사 실패 사례 분석은 수행하지만 리스크의 가능성과 영향을 체계적으로 평가하지 않습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ② PM Choi.',
        'Risk Identification and Assessment in PMBOK® Guide 8th Edition does not stop at using AI to identify potential risks — it also covers assessing probability, impact and priority in order to respond proactively.',
        '② PM Choi analyzes comparable project data and industry benchmarks with AI to identify risks, and goes on to assess risk level and priority before responding. It is the only answer that covers both identification and assessment.',
        '[Option-by-option]\n① PM Lee — Identifies risks using past cases, but the risk-level assessment is lacking.\n② PM Choi (answer) — Identifies risks with AI and assesses risk level and priority before responding.\n③ PM Han — Focuses on maintaining a risk list; no assessment activity appears.\n④ PM Park — Analyzes comparable failure cases, but does not systematically assess probability and impact.'
      ].join('\n\n')
    }
  },
  'case-015': {
    answerIndex: 1, // 정답: 2번 (다기준 의사결정 분석)
    analysis: [
      '정답은 ② 다기준 의사결정 분석입니다.',
      '복구된 로그에는 전략 적합성 · 예상 사업 가치 · 실행 가능성 · 위험 수준 등 여러 기준을 함께 평가해 종합 점수를 산정하고 우선순위를 결정하는 과정이 나타납니다. 이는 PMBOK® Guide 8판의 다기준 의사결정 분석(Multi-Criteria Decision Analysis)에 해당합니다.',
      '자원이 부족해 4개 프로젝트를 동시에 할 수 없고, 기대 효과·리스크·전략적 중요도가 제각각인 상황 — 즉 서로 다른 축을 하나의 우선순위로 모아야 하는 문제입니다.',
      '[보기별 해설]\n① 데이터 기반 의사결정 — 데이터 활용은 포함되지만, 여러 평가 기준을 종합해 우선순위를 결정하는 것이 이 사건의 핵심입니다.\n② 다기준 의사결정 분석(정답) — 가치·전략 적합성·위험·실행 가능성 등 다양한 기준을 함께 평가해 최적의 우선순위를 도출합니다.\n③ 리스크 식별 및 평가 — 위험 수준은 평가 요소 중 하나일 뿐이고, 문제의 목적은 프로젝트 우선순위 결정입니다.\n④ 조기 경고 신호 — 프로젝트 이상 징후를 조기에 탐지하는 활용 사례이며 우선순위 선정과는 관련이 없습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ② Multi-criteria decision analysis.',
        'The recovered logs show several criteria being evaluated together — strategic fit, expected business value, feasibility, risk level — to compute a composite score and set priorities. That is Multi-Criteria Decision Analysis in PMBOK® Guide 8th Edition.',
        'Resources are short, the four projects cannot run at once, and each differs in expected benefit, risk and strategic weight — the problem is exactly one of folding different axes into a single priority order.',
        '[Option-by-option]\n① Data-driven decision making — Data is involved, but the core of this case is combining multiple evaluation criteria to set priorities.\n② Multi-criteria decision analysis (answer) — Evaluates value, strategic fit, risk and feasibility together to derive the optimal priority order.\n③ Risk identification and assessment — Risk level is only one of the criteria; the goal here is prioritizing projects.\n④ Early warning signals — A use case for early detection of project anomalies, unrelated to prioritization.'
      ].join('\n\n')
    }
  }
}

export function localizeAnalysis (sol) {
  if (!sol) return ''
  if (getLocale() === 'en' && sol.en && sol.en.analysis) return sol.en.analysis
  return sol.analysis || ''
}
