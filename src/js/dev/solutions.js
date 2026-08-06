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
    // 확정 콘텐츠(2026-08-06) — 정답 인덱스는 기존과 같아(③ 증거물 C) 기존 제출 채점 결과에 영향이 없다.
    // 해설만 확정본으로 교체했다.
    answerIndex: 2, // 정답: 3번 (증거물 C)
    analysis: [
      '정답은 ③ 증거물 C입니다.',
      'PMBOK® Guide 8판의 Value-Driven Mindset은 계획된 산출물(Output) 자체보다 고객과 비즈니스가 실제로 얻는 가치(Outcome)를 우선하여 의사결정하는 것을 의미합니다.',
      '증거물 C는 이미 요구사항은 충족되었지만 고객 행동 데이터를 근거로 핵심 기능을 재설계하여 고객이 실제 원하는 결과를 달성하도록 방향을 전환한 사례로, Value-Driven Mindset을 가장 분명하게 보여줍니다.',
      '[증거물별 판단]\n① 증거물 A — 오답입니다. 고객 요청보다 범위·일정 준수를 우선하여 기존 계획을 유지한 판단입니다.\n② 증거물 B — 오답입니다. 고객가치와 관련은 있으나 품질 강화와 결함 예방 중심의 의사결정입니다.\n③ 증거물 C — 정답입니다. 기능 완성보다 고객이 실제 얻는 가치와 사용 성과를 우선하여 판단하였습니다.\n④ 증거물 D — 오답입니다. 고객 요청을 수용했지만 범위 확대를 통해 요구를 반영한 사례이지, 가치 관점의 근본적 재검토는 아닙니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ③ Evidence C.',
        'The Value-Driven Mindset of PMBOK® Guide 8th Edition means deciding with priority on the value (Outcome) the customer and the business actually gain, rather than on the planned deliverable (Output) itself.',
        'In Evidence C the requirements were already met, yet the core feature was redesigned on the basis of customer behaviour data so that the customer would reach the result they actually wanted. It shows the Value-Driven Mindset most clearly.',
        '[Evidence by evidence]\n① Evidence A — Incorrect. It kept the existing plan, prioritizing scope and schedule adherence over the customer request.\n② Evidence B — Incorrect. It relates to customer value, but the decision centres on strengthening quality and preventing defects.\n③ Evidence C — Correct. It prioritized the value and usage outcome the customer actually gains over completing the feature.\n④ Evidence D — Incorrect. The customer request was accepted, but by expanding scope to accommodate it — not a fundamental re-examination from a value standpoint.'
      ].join('\n\n')
    }
  },
  'case-002': {
    // 확정 콘텐츠(2026-08-06) — 녹취 음성이 question2/question2-1~4.mp3 로 교체되면서 대화 순서가 바뀌었다.
    // 그래서 정답이 이전 녹취 D(3)에서 **녹취 B(1)** 로 바뀌었다. 서버 시드(0003)를 반드시 재생성·재적용한다.
    answerIndex: 1, // 정답: 2번 (녹취 B)
    analysis: [
      '정답은 ② 녹취 B입니다.',
      'PMBOK® Guide 8판은 팀이 전문성을 바탕으로 자율적으로 일할 수 있는 Empowered Culture를 장려하지만, 최종 의사결정과 그 결과에 대한 책임은 Accountable Leader가 수행해야 함을 강조합니다.',
      '녹취 B는 이해관계자 간 의견이 충돌하는 중요한 의사결정을 팀에 맡기고 PM은 결과만 반영하겠다고 하여, 실행 권한을 위임한 것이 아니라 책임을 사실상 넘기고 있습니다.',
      '[녹취별 판단]\n① 녹취 A — 오답입니다. 승인 권한이 필요한 의사결정은 PM이 직접 수행하고, 팀은 분석과 검증을 담당합니다.\n② 녹취 B — 정답입니다. 이해관계가 충돌하는 상황에서 PM이 최종 판단을 하지 않고 팀에 의사결정을 맡기고 있습니다.\n③ 녹취 C — 오답입니다. 위험 허용범위 내 세부 실행은 위임했지만, PM은 지원과 관리 책임을 유지하고 있습니다.\n④ 녹취 D — 오답입니다. 기술 검토는 팀에 맡기되 최종 의사결정은 PM이 수행하고 있습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ② Recording B.',
        'PMBOK® Guide 8th Edition encourages an Empowered Culture in which the team works autonomously on the strength of its expertise, but it stresses that the final decision — and accountability for its outcome — belongs to the Accountable Leader.',
        'Recording B leaves an important decision, one where stakeholder interests conflict, to the team while the PM says only that the result will be reflected in the plan. That is not delegating authority to execute; it is handing off accountability itself.',
        '[Recording by recording]\n① Recording A — Incorrect. Decisions that require approval authority are made by the PM, while the team handles analysis and verification.\n② Recording B — Correct. With interests in conflict, the PM does not make the final judgment and leaves the decision to the team.\n③ Recording C — Incorrect. Detailed execution within the risk tolerance is delegated, but the PM keeps responsibility for support and management.\n④ Recording D — Incorrect. The technical review is left to the team, but the final decision is made by the PM.'
      ].join('\n\n')
    }
  },
  // ── STAGE 2 정답·해설 — 확정 7사건 (2026-08-06) ──
  'case-004': {
    answerIndex: 2, // 정답: 3번
    analysis: [
      '정답은 ③입니다.',
      '이 사건의 핵심 문제는 기술적 판단의 정확성보다, 거버넌스(Governance) 관점에서 적절한 의사결정 체계를 적용하지 못한 것입니다. 플랫폼 변경은 개발팀뿐 아니라 운영 조직, 유지보수 체계, 협력사까지 영향을 미치는 중요한 변경이었음에도 PM은 이를 프로젝트 내부 회의체에서만 결정하였습니다.',
      '사건 파일의 부제 「그 결정은 왜 회의실을 벗어나지 못했는가」가 암시하듯, PM은 타 조직에 큰 영향을 미치는 중대한 사안을 프로젝트 내부의 기술적 관점으로만 한정하여 결정하는 오류를 범했습니다. 출시 6주 전의 핵심 플랫폼 변경은 단순한 개발 이슈를 넘어 운영 프로세스·유지보수 체계·협력사 연계까지 파급력을 가지므로, 반드시 운영 조직을 포함한 주요 이해관계자와 사전에 검토해야 하는 사안입니다.',
      '그럼에도 PM은 기술 검토 결과에만 의존해 운영 측의 사전 검토 의견을 묵살하고 내부 회의체에서 단독으로 추진을 결정했습니다. 이는 중대한 변경에 대한 의사결정 거버넌스를 적용하지 못한 판단 실수입니다.',
      '[보기별 판단]\n① 오답입니다. 변경 이후의 모니터링도 중요하지만, 문제의 핵심은 변경을 결정하기 **전에** 적절한 의사결정 체계를 거치지 않은 것입니다.\n② 오답입니다. 영향 분석 부족도 일부 원인이지만, 더 본질적인 문제는 누가 의사결정에 참여해야 하는지에 대한 거버넌스 실패입니다.\n③ 정답입니다. 프로젝트 내부 의사결정과 주요 이해관계자 의사결정을 구분하지 못해, 거버넌스 체계를 우회한 채 변경을 승인하였습니다.\n④ 오답입니다. 작업량 산정의 보수성은 결과적으로 드러난 이슈이며, 근본 원인은 의사결정 구조와 이해관계자 참여 부족입니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ③.',
        'The core problem in this case is not the accuracy of the technical judgment but the failure to apply an appropriate decision-making structure from a governance standpoint. The platform change was a significant change affecting not only the dev team but the operations organization, the maintenance structure and the partners — yet the PM decided it inside the project\'s own meeting body alone.',
        'As the case file subtitle "Why That Decision Never Left the Meeting Room" hints, the PM made the error of confining a matter with heavy impact on other organizations to the project\'s internal technical viewpoint. A core platform change six weeks before launch reaches beyond a development issue into the operating process, the maintenance structure and partner integration, so it had to be reviewed in advance with key stakeholders including the operations organization.',
        'Even so the PM relied only on the technical review, dismissed operations\' advance review comments, and decided to proceed unilaterally in the internal meeting body. That is a failure to apply decision-making governance to a significant change.',
        '[Option by option]\n① Incorrect. Post-change monitoring matters too, but the core problem is that no appropriate decision-making structure was applied **before** the change was decided.\n② Incorrect. Insufficient impact analysis is part of the cause, but the more fundamental problem is a governance failure over who should take part in the decision.\n③ Correct. Failing to separate internal project decisions from key-stakeholder decisions, the change was approved while bypassing the governance structure.\n④ Incorrect. Conservatism in effort estimation is an issue that surfaced as a consequence; the root cause is the decision structure and the lack of stakeholder participation.'
      ].join('\n\n')
    }
  },
  'case-005': {
    // ⚠️ 유일한 **복수 정답** 사건 — answerIndex 가 아니라 answerIndexes(배열)를 쓴다.
    //    채점은 집합 일치(전부 맞아야 정답, 부분 점수 없음) — cases.js 의 multi/selectCount 와 짝이다.
    answerIndexes: [1, 2, 4], // 정답: ② 증거물 B · ③ 증거물 C · ⑤ 증거물 E
    analysis: [
      '정답은 증거물 B · C · E입니다.',
      'Scope Creep은 승인되지 않은 기능, 업무 또는 검증 활동이 영향도 분석과 변경 통제 없이 점진적으로 증가하는 현상입니다. 증거물 B·C·E는 모두 공식 변경 절차 없이 범위가 확대된 사례에 해당합니다.',
      '[증거물별 판단]\n① 증거물 A — 오답입니다. 고객 요청에 따른 변경이지만 요구사항과 계획이 함께 업데이트된 통제된 변경으로 볼 수 있습니다.\n② 증거물 B — 정답입니다. 새로운 기능이 제품에 포함되었지만 범위 관리 관점의 의사결정 흔적은 확인되지 않습니다.\n③ 증거물 C — 정답입니다. 검증 활동이 지속적으로 확대되고 있으며 프로젝트 업무 범위 증가를 시사합니다.\n④ 증거물 D — 오답입니다. 규제 대응 과정에서 일부 범위를 이관하여 전체 범위를 재조정한 사례입니다.\n⑤ 증거물 E — 정답입니다. 여러 기능이 누적 추가되고 있으나 범위 조정이나 우선순위 변경 흔적은 보이지 않습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is Evidence B, C and E.',
        'Scope creep is the incremental growth of unapproved features, work or validation activity without impact analysis and change control. Evidence B, C and E are all cases where scope expanded with no formal change procedure.',
        '[Evidence by evidence]\n① Evidence A — Incorrect. The change came from a customer request, but requirements and the plan were updated with it, so it counts as a controlled change.\n② Evidence B — Correct. A new feature ended up in the product, yet there is no trace of a scope-management decision.\n③ Evidence C — Correct. Validation activity keeps expanding, which points to growth in the project work scope.\n④ Evidence D — Incorrect. Part of the scope was transferred while handling regulation, re-balancing the overall scope.\n⑤ Evidence E — Correct. Features are accumulating, but there is no sign of scope adjustment or re-prioritization.'
      ].join('\n\n')
    }
  },
  'case-006': {
    answerIndex: 1, // 정답: 2번
    analysis: [
      '정답은 ②입니다.',
      'PMBOK® Guide 8판은 현재 상태보다 성과 추세를 기반으로 미래 일정을 예측(Forecasting)하는 것을 중요하게 봅니다.',
      '본 사례에서는 버퍼가 지속 감소하고(15일 → 5일) Validation Scope가 지속 증가하고(20건 → 38건) 있으므로, 단순 관찰이 아니라 일정 예측을 갱신하고 영향을 분석해야 합니다.',
      '[보기별 판단]\n① 오답입니다. Validation Scope 증가로 업무량 변화 가능성이 발생했으므로 최신 정보를 반영한 일정 예측 갱신이 필요합니다.\n② 정답입니다. 이미 추세 악화 신호가 관측되고 있는데 단순히 추가 관찰만 하자는 것은 PMBOK 8판의 일정 예측 및 통제 개념과 맞지 않습니다.\n③ 오답입니다. 버퍼 감소는 일정 유연성 저하를 의미할 수 있으며 일정 리스크 분석의 필요성을 시사합니다.\n④ 오답입니다. 진행률 수치만으로 미래 일정 달성을 보장할 수 없으며 성과 추세를 함께 고려해야 합니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ②.',
        'PMBOK® Guide 8th Edition treats forecasting the future schedule from performance trend — rather than from current status — as important.',
        'Here the buffer keeps shrinking (15 days → 5 days) and validation scope keeps growing (20 → 38 cases), so the schedule forecast must be updated and its impact analysed, not merely observed.',
        '[Option by option]\n① Incorrect. Growing validation scope raises the possibility of a change in workload, so the schedule forecast must be updated with the latest information.\n② Correct. Signs of a deteriorating trend are already observed; proposing only further observation does not fit the schedule forecasting and control concepts of PMBOK 8th Edition.\n③ Incorrect. A shrinking buffer can mean reduced schedule flexibility and points to the need for schedule risk analysis.\n④ Incorrect. A progress figure alone cannot guarantee future schedule achievement; the performance trend must be considered with it.'
      ].join('\n\n')
    }
  },
  'case-007': {
    answerIndex: 2, // 정답: 3번 (PM 후보 C)
    analysis: [
      '정답은 ③ PM 후보 C입니다.',
      '③은 이미 투자한 비용과 시간을 프로젝트 지속의 근거로 삼고 있으며, 이는 미래 가치보다 과거 투자에 얽매이는 매몰비용 오류(Sunk Cost Fallacy)입니다.',
      '[후보별 판단]\n① PM 후보 A — 오답입니다. Business Case와 변경 영향을 지속적으로 검토하고 있어 적절한 접근입니다.\n② PM 후보 B — 오답입니다. Forecast와 예산 관리뿐 아니라 추가 투자에 따른 가치까지 함께 판단하고 있습니다.\n③ PM 후보 C — 정답입니다. 이미 투입한 비용을 이유로 프로젝트를 계속하려는 것은 매몰비용 오류입니다.\n④ PM 후보 D — 오답입니다. Opportunity Cost와 장기적 사업 가치를 함께 고려하고 있어 적절합니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ③ PM candidate C.',
        '③ uses the cost and time already invested as the grounds for continuing the project — the sunk cost fallacy, being bound by past investment rather than future value.',
        '[Candidate by candidate]\n① PM candidate A — Incorrect. Continuously reviewing the business case and change impact is an appropriate approach.\n② PM candidate B — Incorrect. Beyond forecast and budget management, the value of additional investment is also weighed.\n③ PM candidate C — Correct. Continuing a project because money has already been spent is the sunk cost fallacy.\n④ PM candidate D — Incorrect. Opportunity cost and long-term business value are considered together, which is appropriate.'
      ].join('\n\n')
    }
  },
  'case-008': {
    answerIndex: 1, // 정답: 2번
    analysis: [
      '정답은 ②입니다.',
      '다섯 개의 메모를 보면 모든 조직이 프로젝트가 성공적으로 완료되었다는 사실에는 동의하고 있습니다. 그러나 성공을 판단하는 기준이 서로 다릅니다.\n· PM은 계획 대비 성과(KPI)와 Baseline 유지를 성공으로 인식합니다.\n· 개발팀은 계획된 요구사항과 일정 달성을 성공으로 인식합니다.\n· 고객은 계약된 기능의 제공 여부를 중요하게 봅니다.\n· 운영조직은 실제 운영 환경에서의 활용과 안정화를 중요하게 봅니다.\n· 사업부는 투자, 시장 상황, 향후 사업 확대 가능성을 중요하게 봅니다.',
      '즉, 모든 이해관계자가 프로젝트의 성공을 인정하고 있음에도 각 조직이 프로젝트를 평가하는 기준과 기대하는 가치가 서로 달랐습니다. 그 결과 종료 이후 Portfolio Review에서 후속 투자·서비스 확장·기능 확대에 대한 공통된 판단을 내리지 못하게 되었습니다.',
      'PMBOK® Guide 8판의 Stakeholder Performance Domain 관점에서는 프로젝트 수행 중 이해관계자의 기대·관점·성공 기준을 지속적으로 파악하고 정렬(Alignment)하는 것이 중요합니다.',
      '[보기별 판단]\n① 오답입니다. 사업 환경 변화나 Scope 재검토의 필요성을 직접적으로 보여주는 증거는 없습니다. 고객 역시 계약된 기능이 모두 제공되었다고 기록하고 있습니다.\n② 정답입니다. 메모 전반에서 프로젝트 성공에 대한 관점과 판단 기준이 조직마다 다르게 나타나며, 수행 과정에서 이 관점 차이를 관리하고 주요 의사결정에 반영할 필요가 있었음을 시사합니다.\n③ 오답입니다. 실제 사용량이나 사업효과 언급이 일부 있으나, 핵심 단서는 Portfolio Review 참석자들이 결과를 서로 다르게 해석했다는 점입니다. 이는 성과지표 부족보다 이해관계자 정렬 부족과 더 직접 연결됩니다.\n④ 오답입니다. 의사결정 기준 재검토의 필요성을 배제할 수는 없으나, 증거물에서 드러나는 핵심 문제는 조직 간 성공 기준과 기대의 차이이지 Governance 체계 자체의 문제는 아닙니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ②.',
        'Across the five notes every organization agrees the project completed successfully. But each judges success by a different criterion.\n· The PM sees success as performance against plan (KPIs) and holding the baseline.\n· The dev team sees success as meeting the planned requirements and schedule.\n· The customer cares whether the contracted features were delivered.\n· The operations organization cares about adoption and stabilization in the real operating environment.\n· The business unit cares about investment, market conditions and room for future business expansion.',
        'So although every stakeholder acknowledges the project\'s success, the criteria they evaluate by and the value they expect differ. As a result the Portfolio Review after closure could not reach a shared judgment on follow-up investment, service expansion or additional features.',
        'From the standpoint of the Stakeholder Performance Domain in PMBOK® Guide 8th Edition, what matters is continuously grasping and aligning stakeholder expectations, perspectives and success criteria during the project.',
        '[Option by option]\n① Incorrect. There is no evidence directly showing a change in the business environment or a need to re-examine scope. The customer too records that every contracted feature was delivered.\n② Correct. Throughout the notes the perspective and criteria for project success differ by organization, which suggests these differences needed to be managed during execution and fed into key decisions.\n③ Incorrect. Actual usage and business effect are mentioned in places, but the core clue is that the Portfolio Review attendees interpreted the outcome differently. That connects more directly to weak stakeholder alignment than to missing performance indicators.\n④ Incorrect. A need to re-examine decision criteria cannot be ruled out, but the core problem in the evidence is the gap in success criteria and expectations between organizations, not the governance system itself.'
      ].join('\n\n')
    }
  },
  'case-009': {
    answerIndex: 3, // 정답: 4번 (Chief Architect)
    analysis: [
      '정답은 ④ Chief Architect입니다.',
      '이 사건은 "누가 PM을 가장 힘들게 했는가"를 묻는 문제가 아닙니다. PMBOK® Guide 8판의 Resource Performance Domain 관점에서 핵심은 자원의 수가 아니라 자원 운영 체계입니다.',
      '인터뷰 D에서는 프로젝트의 중요한 기술 의사결정이 사실상 Chief Architect 한 사람에게 집중되어 있으며, 그의 부재 시 의사결정이 지연되는 구조가 형성되어 있습니다. 이런 구조에서는 팀 전체의 역량이 충분히 활용되지 못하고, PM은 지속적으로 특정 인물의 일정과 가용성에 의존하여 프로젝트를 운영해야 합니다.',
      '[관계자별 판단]\n① 개발조직장 — 오답입니다. 자원 제약은 존재했지만 프로젝트에 배정된 인력을 직접 축소하거나 회수한 것은 아니며, 조직 차원의 제약조건에 가깝습니다.\n② 사업부 임원 — 오답입니다. 일정 압박은 있었지만 Scope·Schedule 영역의 영향이 더 크며 Resource Domain의 핵심 문제는 아닙니다.\n③ HR Resource Manager — 오답입니다. 추가 지원을 제한했지만 사업부 차원의 자원 배분을 수행한 것으로, 프로젝트 내부 운영 구조를 결정하지는 않았습니다.\n④ Chief Architect — 정답입니다. 핵심 의사결정이 특정 인물에게 집중되어 자원 활용성과 팀 자율성을 저하시키고 병목 구조를 만들었습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ④ the Chief Architect.',
        'This case does not ask "who made the PM\'s life hardest". From the standpoint of the Resource Performance Domain in PMBOK® Guide 8th Edition, what matters is not the number of resources but the resource operating structure.',
        'Interview D shows that important technical decisions on the project are effectively concentrated in the Chief Architect alone, forming a structure where decisions stall in their absence. In such a structure the team\'s full capability goes unused, and the PM must run the project in continuous dependence on one person\'s schedule and availability.',
        '[Person by person]\n① Development organization head — Incorrect. Resource constraints existed, but the staff assigned to the project were not directly cut or withdrawn; this is closer to an organization-level constraint.\n② Business unit executive — Incorrect. There was schedule pressure, but the impact falls more in the scope and schedule areas and is not the core resource-domain problem.\n③ HR Resource Manager — Incorrect. Additional support was limited, but this was resource allocation at business-unit level and did not determine the project\'s internal operating structure.\n④ Chief Architect — Correct. Concentrating key decisions in one individual lowered resource utilization and team autonomy and created a bottleneck structure.'
      ].join('\n\n')
    }
  },
  'case-010': {
    answerIndex: 1, // 정답: 2번
    analysis: [
      '정답은 ②입니다.',
      '회고 보고서에는 리스크를 공유·기록·대응했다는 내용이 반복적으로 등장하지만, 위험 수준이 높아졌음에도 프로젝트 운영 원칙은 그대로 유지했다는 점이 드러납니다.',
      'PMBOK® Guide 8판은 리스크를 단순히 관리하는 대상이 아니라, 프로젝트의 범위(Scope)·일정(Schedule)·릴리즈(Release)·투자(Investment)·우선순위(Priority) 등의 의사결정을 조정하는 근거로 활용할 것을 강조합니다. 따라서 이 PM은 리스크를 인식하고 대응하는 역량은 갖추었지만, 리스크를 프로젝트 계획과 의사결정으로 연결하지 못할 가능성이 가장 큽니다.',
      '[보기별 판단]\n① 오답입니다. 회고만으로 새로운 리스크 탐색이 부족했다고 단정하기는 어렵습니다.\n② 정답입니다. 리스크가 증가했음에도 프로젝트 운영 방향을 조정하지 않는 사고방식이 가장 큰 위험입니다.\n③ 오답입니다. 사후 대응 성향은 보이지만, 더 본질적인 문제는 리스크를 의사결정에 반영하지 않는 점입니다.\n④ 오답입니다. 재평가 부족도 추론 가능하지만, 보고서에는 리스크 수준 변화는 인식하고 있었던 것으로 보입니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The answer is ②.',
        'The retrospective repeatedly states that risks were shared, recorded and responded to — yet it also reveals that the project\'s operating principles were held unchanged even as the risk level rose.',
        'PMBOK® Guide 8th Edition stresses using risk not merely as something to manage but as the basis for adjusting decisions on scope, schedule, release, investment and priority. This PM therefore has the capability to recognize and respond to risk, but is most likely to fail at connecting risk to the project plan and to decisions.',
        '[Option by option]\n① Incorrect. The retrospective alone is not enough to conclude that the scan for new risks was lacking.\n② Correct. The greatest danger is the mindset of not adjusting the project\'s direction even as risk grows.\n③ Incorrect. A reactive tendency is visible, but the more fundamental problem is not reflecting risk in decisions.\n④ Incorrect. Insufficient re-assessment can also be inferred, but the report suggests shifts in risk level were recognized.'
      ].join('\n\n')
    }
  },

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
