// 사건(문제) 데이터 — MOCK. 화면에 내려가는 "사건"에는 정답이 없다 (CLAUDE.md §11).
// 정답·해설(SOLUTIONS)은 아래에 분리해 두었고, 서버 연결 시 questions 테이블 + 채점 RPC/Edge Function으로
// 이관한다 (CLAUDE.md §10, docs/game-flow.md §7.3). 그전까지는 lib/grade.js가 SOLUTIONS로 임시 채점한다.
// evidence.images = 단서 이미지 배열(1장 또는 다중). choices = 보기(개수 자유). 용어는 화면 출력 시 게임 용어로.
// ▶ 영문(i18n): 각 사건에 en: { title, brief, prompt, choices } 를, 정답에 SOLUTIONS[id].en = { analysis } 를
//   추가하면 en 로케일에서 사용된다(없으면 ko 폴백). 지금은 en.evidence도 국문 미디어를 그대로 가리키고
//   라벨/alt만 영문이다 — 영문 이미지·음성이 준비되면 en.evidence 안의 src만 교체한다(localizeCase가 우선 적용).
// ▶ choices 항목은 문자열 또는 { label, desc } — desc는 보기 아래 보조 설명으로 붙는다(question-choice.js).
import { ASSETS } from '../constants/assets.js'
import { getLocale } from '../lib/i18n.js'

export const CASES = [
  {
    id: 'case-007',
    stage: 1, // Stage 1 · Mindset
    caseNo: 1, // Stage 내 사건 순번
    fileNo: '#007',
    title: '양산 D-30, 누가 미래를 놓쳤는가?',
    brief: [
      'PM보호국은 양산 30일 전 진행된 프로젝트 회의실을 조사했다.',
      '프로젝트는 당시 모든 일정이 정상으로 보고되었지만, 양산 직전 핵심 기능의 결함이 발견되어 출시가 3주 연기되었다.',
      '현장에는 PM이 남긴 여러 자료가 있었다. 그런데… 단 하나의 자료만 PMBOK® 8판의 Proactive Mindset과 가장 거리가 멀었다.',
      '그 증거를 찾아라.'
    ].join('\n'),
    prompt: '다음 프로젝트 현장에 남아 있는 5가지 단서 중 PMBOK® 8판의 Proactive Mindset과 가장 거리가 먼 단서는 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 현장 단서 5',
      images: [
        { src: ASSETS.questions.q1, alt: '사건 #007 현장에 남은 5가지 단서' }
      ]
    },
    // 보기(단서) — 순서 = 화면 번호 1~5, 이미지의 단서 라벨과 일치.
    choices: [
      '단서 1: 프로젝트 일정 예측 대시보드',
      '단서 2: 변경 영향 분석서',
      '단서 3: 회의 안건',
      '단서 4: 프로젝트 운영 현황',
      '단서 5: 발생 시, 프로젝트 영향 분석'
    ],
    en: {
      title: 'Mass Production D-30: Who Missed the Future?',
      brief: [
        'The Bureau investigated the meeting room of a project 30 days before mass production.',
        'At the time every schedule was reported as normal, but a defect in a core feature was found right before mass production, delaying the launch by three weeks.',
        'The PM had left several documents at the scene. Yet… only one of them was farthest from the Proactive Mindset of PMBOK® 8th Edition.',
        'Find that piece of evidence.'
      ].join('\n'),
      prompt: 'Among the five clues left at the project scene, which is farthest from the Proactive Mindset of PMBOK® 8th Edition?',
      evidence: {
        caption: 'EVIDENCE · 5 scene clues',
        images: [{ src: ASSETS.questions.q1, alt: 'Five clues left at the scene of Case #007' }]
      },
      choices: [
        'Clue 1: Project schedule forecast dashboard',
        'Clue 2: Change impact analysis',
        'Clue 3: Meeting agenda',
        'Clue 4: Project operations status',
        'Clue 5: "If it occurs" project impact analysis'
      ]
    }
  },
  {
    id: 'case-014',
    stage: 1, // Stage 1 · Mindset (Value-Driven Mindset)
    caseNo: 2,
    fileNo: '#014',
    title: '성공한 프로젝트, 진짜 가치는 어디에 있었나',
    brief: [
      'PM보호국은 최근 성공적으로 종료된 스마트홈 제어 플랫폼 프로젝트의 성과를 조사하고 있다. 프로젝트는 다음 결과를 달성했다.',
      '· 예정된 양산 일정 준수\n· 승인 예산 내 프로젝트 완료\n· 주요 기능 100% 구현\n· 출시 후 고객 불만 35% 감소\n· 서비스 이용률 예상 대비 18% 증가',
      '성과만 보면 완벽한 프로젝트다. 그러나 종료 직후 길동 책임은 이렇게 말했다. "일정과 범위를 지킨 것이 성공의 전부는 아니다. 우리가 지켜야 했던 것은 기능이 아니라 고객이 얻는 결과였다."',
      'PM보호국은 길동 책임의 업무용 다이어리에서 네 장의 기록을 확보했다. 네 기록 모두 유능한 PM의 행동처럼 보인다. 하지만 그중 단 한 장만이 PMBOK® 8판의 Value-Driven Mindset을 가장 분명하게 보여준다.'
    ].join('\n'),
    prompt: '다음 네 장의 일기 중, 길동 책임이 프로젝트의 산출물보다 가치와 결과를 우선하여 판단한 기록을 찾아라.',
    evidence: {
      caption: 'EVIDENCE · 길동 책임 다이어리 4',
      images: [
        { src: ASSETS.questions.q2_1, alt: '증거물 A 다이어리 기록', label: '증거물 A' },
        { src: ASSETS.questions.q2_2, alt: '증거물 B 다이어리 기록', label: '증거물 B' },
        { src: ASSETS.questions.q2_3, alt: '증거물 C 다이어리 기록', label: '증거물 C' },
        { src: ASSETS.questions.q2_4, alt: '증거물 D 다이어리 기록', label: '증거물 D' }
      ]
    },
    // 보기 = 증거물 A~D (순서 = 화면 번호 1~4)
    choices: [
      '증거물 A',
      '증거물 B',
      '증거물 C',
      '증거물 D'
    ],
    en: {
      title: 'A Successful Project — Where Was the Real Value?',
      brief: [
        'The Bureau is examining the outcomes of a recently completed smart-home control platform project. The project achieved the following results.',
        '· Met the planned mass-production schedule\n· Completed within the approved budget\n· 100% of key features implemented\n· 35% drop in customer complaints after launch\n· 18% higher service usage than expected',
        'By results alone it looks like a perfect project. Yet right after closure, Lead Gildong said: "Keeping the schedule and scope is not the whole of success. What we had to protect was not features, but the outcome the customer gains."',
        'The Bureau secured four entries from Lead Gildong\'s work diary. All four look like the acts of a capable PM. But only one most clearly shows the Value-Driven Mindset of PMBOK® 8th Edition.'
      ].join('\n'),
      prompt: 'Among the four diary entries, find the record where Lead Gildong prioritized value and outcome over the project\'s outputs.',
      evidence: {
        caption: 'EVIDENCE · 4 diary entries',
        images: [
          { src: ASSETS.questions.q2_1, alt: 'Evidence A diary entry', label: 'Evidence A' },
          { src: ASSETS.questions.q2_2, alt: 'Evidence B diary entry', label: 'Evidence B' },
          { src: ASSETS.questions.q2_3, alt: 'Evidence C diary entry', label: 'Evidence C' },
          { src: ASSETS.questions.q2_4, alt: 'Evidence D diary entry', label: 'Evidence D' }
        ]
      },
      choices: ['Evidence A', 'Evidence B', 'Evidence C', 'Evidence D']
    }
  },
  {
    id: 'case-021',
    stage: 1, // Stage 1 · Mindset (Accountability & Empowered Mindset)
    caseNo: 3,
    fileNo: '#021',
    title: '권한을 준 것인가, 책임을 넘긴 것인가',
    brief: [
      '양산을 4주 앞둔 스마트 디바이스 프로젝트에서 간헐적인 통신 장애가 발견되었다. 장애 발생률은 약 0.8%로 낮지만, 실제 발생 시 사용자가 기기를 재부팅해야 한다. 개발팀은 두 가지 대응안을 제시했다.',
      '· 대응안 1: 구조를 수정해 근본 원인을 제거한다. 일정이 최대 1주 지연될 수 있다.\n· 대응안 2: 소프트웨어 재시도 기능으로 발생 가능성을 낮춘 뒤 예정대로 출시한다. 일정 영향은 거의 없지만 잔여 위험이 남는다.',
      '이 프로젝트에서는 PM이 일정·품질·고객 영향이 결합된 주요 의사결정을 조정하고, 기술 담당자는 자신의 전문영역에서 해결안을 제안하도록 역할이 정해져 있었다. PM보호국 감사관은 홍길동 PM과 개발자 사이에서 오간 네 개의 대화를 확보했다.',
      '모든 대화는 실무 현장에서 충분히 합리적으로 들린다. 그러나 그중 하나는 팀을 Empower한 것처럼 보이지만, 실제로는 PM이 Accountability를 약화시키고 의사결정 책임까지 팀에 넘긴 대화이다.'
    ].join('\n'),
    prompt: '다음 대화(녹취) 중 PMBOK® 8판의 Accountability와 Empowered Mindset 관점에서 가장 문제가 큰 대화를 찾아라.',
    evidence: {
      caption: 'EVIDENCE · 현장 자료 + 대화 녹취 4',
      images: [
        { src: ASSETS.questions.q3, alt: '사건 #021 현장 자료' }
      ],
      audios: [
        { src: ASSETS.questionAudio.q3_1, label: '녹취 A' },
        { src: ASSETS.questionAudio.q3_2, label: '녹취 B' },
        { src: ASSETS.questionAudio.q3_3, label: '녹취 C' },
        { src: ASSETS.questionAudio.q3_4, label: '녹취 D' }
      ]
    },
    // 보기 = 녹취 A~D (순서 = 화면 번호 1~4)
    choices: [
      '녹취 A',
      '녹취 B',
      '녹취 C',
      '녹취 D'
    ],
    en: {
      title: 'Empowerment, or Passing the Buck?',
      brief: [
        'Four weeks before mass production of a smart-device project, an intermittent communication fault was found. The fault rate is low at about 0.8%, but when it occurs the user must reboot the device. The dev team proposed two options.',
        '· Option 1: Fix the architecture to remove the root cause. The schedule may slip by up to one week.\n· Option 2: Lower the occurrence with a software retry feature and ship on schedule. Little schedule impact, but residual risk remains.',
        'On this project, roles were set so that the PM coordinates key decisions combining schedule, quality and customer impact, while technical leads propose solutions in their domain. The Bureau\'s auditor secured four conversations between PM Hong Gildong and the developers.',
        'Every conversation sounds reasonable enough in practice. But one of them looks like empowering the team while the PM actually weakens Accountability and hands off the decision responsibility itself to the team.'
      ].join('\n'),
      prompt: 'Among the following conversations (recordings), find the one that is most problematic from the standpoint of Accountability and the Empowered Mindset of PMBOK® 8th Edition.',
      evidence: {
        caption: 'EVIDENCE · scene material + 4 recordings',
        images: [{ src: ASSETS.questions.q3, alt: 'Case #021 scene material' }],
        audios: [
          { src: ASSETS.questionAudio.q3_1, label: 'Recording A' },
          { src: ASSETS.questionAudio.q3_2, label: 'Recording B' },
          { src: ASSETS.questionAudio.q3_3, label: 'Recording C' },
          { src: ASSETS.questionAudio.q3_4, label: 'Recording D' }
        ]
      },
      choices: ['Recording A', 'Recording B', 'Recording C', 'Recording D']
    }
  },
  // ════════════════════════════════════════════════════════════════════════
  // ⏳ STAGE 2 · 임시 데이터 (PLACEHOLDER) — 여기부터 case-s2-10 까지가 교체 대상이다.
  //    Stage 2 콘텐츠(7사건)는 아직 확정되지 않았다. 전체 흐름(Stage 1 → 2 → 3 → Final Raid → 엔딩)을
  //    끊김 없이 테스트·시연하기 위한 최소 Mock이며, 다음 규칙만 지키면 확정 콘텐츠로 그대로 교체된다.
  //      · 데이터 구조·게임 엔진은 손대지 않는다 — 이 배열 항목과 SOLUTIONS 항목만 바꾼다.
  //      · placeholder: true 를 지우면 화면의 '임시 데이터' 표시가 사라진다(case.js가 이 필드만 본다).
  //      · 사건 수 7개 = STAGE_TOTALS[2] (점수 만점 300점 = 20점 × 15사건) 유지.
  //      · 단서 미디어가 준비되면 evidence(images/audios)를 추가한다 — 지금은 텍스트 단서만 사건 개요에 있다.
  //    주제는 docs/game-flow.md §9.2의 Q4~Q10(Governance·Financial·Scope·Stakeholders·Risk·Schedule·Resources)을 따른다.
  //    fileNo(#T04~#T10)는 임시 번호다 — 확정 시 실제 사건 파일 번호로 바꾼다.
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'case-s2-04',
    stage: 2,
    caseNo: 1,
    fileNo: '#T04',
    placeholder: true,
    title: '완료된 프로젝트, 사라진 편익',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      '통합 물류 플랫폼 프로젝트가 일정과 예산을 지켜 종료되었다. 그러나 6개월 후 경영진은 "약속된 물류비 12% 절감이 확인되지 않는다"며 감사를 요청했다.',
      'PM보호국은 프로젝트 종료 보고서를 확보했다. 보고서에는 산출물 인수 확인과 잔여 예산 반납 내역은 있었지만, 편익이 언제·누구에 의해 측정되는지에 대한 기록은 없었다.'
    ].join('\n\n'),
    prompt: 'PMBOK® 8판의 Governance 관점에서, 이 프로젝트가 놓친 가장 핵심적인 활동은 무엇인가?',
    choices: [
      '프로젝트 종료 시 산출물 인수 확인 절차를 강화한다',
      '편익 실현 계획을 수립하고 종료 이후의 측정 책임자와 시점을 정한다',
      '잔여 예산을 조기에 반납해 재무 성과를 개선한다',
      '프로젝트 종료 보고서의 승인 단계를 한 단계 추가한다'
    ],
    en: {
      title: 'A Completed Project, a Missing Benefit',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'An integrated logistics platform project closed on schedule and on budget. Six months later, executives requested an audit: "the promised 12% cut in logistics cost cannot be confirmed."',
        'The Bureau obtained the closure report. It recorded deliverable acceptance and the return of remaining budget, but nothing about when the benefits would be measured, or by whom.'
      ].join('\n\n'),
      prompt: 'From the Governance standpoint of PMBOK® 8th Edition, what is the most essential activity this project missed?',
      choices: [
        'Strengthen the deliverable acceptance procedure at project closure',
        'Establish a benefits realization plan and assign the owner and timing of post-closure measurement',
        'Return the remaining budget early to improve financial performance',
        'Add one more approval step to the closure report'
      ]
    }
  },
  {
    id: 'case-s2-05',
    stage: 2,
    caseNo: 2,
    fileNo: '#T05',
    placeholder: true,
    title: '숫자는 정상이라고 말했다',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      '스마트 홈 허브 프로젝트의 6개월차 성과 지표가 보고되었다.',
      '· 계획 대비 진척(SPI): 1.03\n· 원가 효율(CPI): 0.82\n· 누적 실제원가: 계획의 128%\n· 남은 기간: 4개월',
      'PM은 임원회의에서 "일정은 오히려 앞서 있으므로 프로젝트는 정상"이라고 보고했다.'
    ].join('\n\n'),
    prompt: '이 지표에 대한 PMBOK® 8판 Financial 관점의 가장 적절한 해석은 무엇인가?',
    choices: [
      '일정이 앞서 있으므로 원가는 후속 기간에 자연히 회복된다',
      '일정을 앞당기기 위해 원가를 초과 투입한 상태이며, 완료 시점 원가 초과가 예상되므로 EAC를 재산정해야 한다',
      'SPI가 1을 넘었으므로 성과 기준선을 상향 조정해야 한다',
      'CPI는 회계 마감 시점의 오차이므로 다음 분기까지 판단을 보류한다'
    ],
    en: {
      title: 'The Numbers Said It Was Fine',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'Month-six performance indicators were reported for a smart-home hub project.',
        '· Schedule performance (SPI): 1.03\n· Cost performance (CPI): 0.82\n· Cumulative actual cost: 128% of plan\n· Time remaining: 4 months',
        'At the executive meeting the PM reported that "the schedule is in fact ahead, so the project is normal."'
      ].join('\n\n'),
      prompt: 'What is the most appropriate reading of these indicators from the Financial standpoint of PMBOK® 8th Edition?',
      choices: [
        'The schedule is ahead, so cost will naturally recover in the remaining periods',
        'Cost was over-consumed to pull the schedule ahead; an overrun at completion is expected, so the EAC must be recalculated',
        'SPI exceeded 1, so the performance baseline should be raised',
        'CPI is an accounting cut-off error, so judgment should be deferred to next quarter'
      ]
    }
  },
  {
    id: 'case-s2-06',
    stage: 2,
    caseNo: 3,
    fileNo: '#T06',
    placeholder: true,
    title: '작은 요청 열일곱 개',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      '결제 서비스 개편 프로젝트에서 사업부는 3개월간 17건의 "간단한 화면 수정"을 요청했다. 각 요청은 2일 이내 작업으로 판단되어 담당 개발자가 즉시 반영했다.',
      '변경 요청서는 작성되지 않았고, 일정과 예산 기준선도 그대로 유지되었다. 통합 시험 단계에서 회귀 결함 44건이 발생하며 출시가 3주 지연되었다.'
    ].join('\n\n'),
    prompt: 'PMBOK® 8판 Scope 관점에서 이 사건의 근본 원인은 무엇인가?',
    choices: [
      '개발자의 작업 속도가 요청량을 따라가지 못했다',
      '통합 시험 계획에 회귀 시험 범위가 정의되지 않았다',
      '작은 변경이 통제 절차를 거치지 않고 누적되어 범위가 잠식(Scope Creep)되었다',
      '사업부가 요청 우선순위를 제시하지 않았다'
    ],
    en: {
      title: 'Seventeen Small Requests',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'On a payment-service redesign project, the business unit made 17 requests for "simple screen tweaks" over three months. Each was judged to be under two days of work, so the assigned developer applied it immediately.',
        'No change requests were written and the schedule and cost baselines were left untouched. During integration testing 44 regression defects surfaced and the launch slipped three weeks.'
      ].join('\n\n'),
      prompt: 'From the Scope standpoint of PMBOK® 8th Edition, what is the root cause of this case?',
      choices: [
        'The developers could not keep pace with the volume of requests',
        'The integration test plan did not define the regression test scope',
        'Small changes bypassed the control procedure and accumulated, letting scope creep in',
        'The business unit did not provide a priority order for its requests'
      ]
    }
  },
  {
    id: 'case-s2-07',
    stage: 2,
    caseNo: 4,
    fileNo: '#T07',
    placeholder: true,
    title: '세 개의 진행률',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      'PM보호국은 같은 날 작성된 세 개의 보고 자료를 확보했다.',
      '· 개발팀 주간 보고: 진행률 78%\n· PMO 대시보드: 진행률 64%\n· 고객사 제출 보고서: 진행률 85%',
      '세 자료는 모두 각 조직이 관리하는 별도 문서에서 산출되었고, 산정 기준도 서로 달랐다. 고객사는 이후 "보고가 신뢰되지 않는다"며 주간 회의 참석을 중단했다.'
    ].join('\n\n'),
    prompt: 'PMBOK® 8판 Stakeholders 관점에서 가장 먼저 확보해야 할 것은 무엇인가?',
    choices: [
      '보고 주기를 주간에서 격주로 조정해 자료 작성 부담을 줄인다',
      '고객사 전용 보고 양식을 새로 만들어 별도 관리한다',
      '진행률의 단일 진실 공급원(Single Source of Truth)과 공통 산정 기준을 정의한다',
      '조직별 진행률을 평균해 대표값으로 보고한다'
    ],
    en: {
      title: 'Three Different Progress Rates',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'The Bureau secured three reports written on the same day.',
        '· Dev team weekly report: 78% complete\n· PMO dashboard: 64% complete\n· Report submitted to the client: 85% complete',
        'All three came from separate documents maintained by separate organizations, each using a different calculation basis. The client later stopped attending the weekly meeting, saying "the reporting cannot be trusted."'
      ].join('\n\n'),
      prompt: 'From the Stakeholders standpoint of PMBOK® 8th Edition, what must be secured first?',
      choices: [
        'Change the reporting cycle from weekly to biweekly to reduce the reporting burden',
        'Create a separate report format dedicated to the client',
        'Define a single source of truth for progress along with a common calculation basis',
        'Average the per-organization progress rates and report the result as representative'
      ]
    }
  },
  {
    id: 'case-s2-08',
    stage: 2,
    caseNo: 5,
    fileNo: '#T08',
    placeholder: true,
    title: '한 사람만 아는 모듈',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      '차량용 제어 소프트웨어 프로젝트의 통신 스택은 입사 9년차 A책임이 혼자 설계·구현했다. 문서는 최신화되지 않았고, 코드 리뷰도 형식적으로만 수행되었다.',
      '리스크 관리대장에는 "핵심 인력 이탈 가능성"이 프로젝트 착수 시점에 한 번 등록된 뒤 8개월간 갱신되지 않았다. 양산 5주 전, A책임이 4주간 병가에 들어갔다.'
    ].join('\n\n'),
    prompt: 'PMBOK® 8판 Risk 관점에서 PM이 사전에 수행해야 했던 조치로 가장 적절한 것은 무엇인가?',
    choices: [
      '리스크 관리대장을 상시 갱신하며 단일 실패점(SPOF)에 대해 백업 인력·문서화 등 대응책을 실행한다',
      '핵심 인력에게 추가 보상을 지급해 이탈 가능성을 낮춘다',
      '리스크가 실제로 발생한 시점에 신속하게 대체 인력을 투입한다',
      '통신 스택 개발 일정을 앞당겨 리스크 노출 기간을 줄인다'
    ],
    en: {
      title: 'The Module Only One Person Knows',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'On an automotive control software project, the communication stack was designed and built single-handedly by Lead A, a nine-year veteran. The documentation was not kept current and code review was performed only as a formality.',
        'The risk register listed "possible departure of key personnel" once at project start and was not updated for eight months. Five weeks before mass production, Lead A went on four weeks of sick leave.'
      ].join('\n\n'),
      prompt: 'From the Risk standpoint of PMBOK® 8th Edition, what should the PM have done in advance?',
      choices: [
        'Keep the risk register continuously updated and execute responses for the single point of failure — backup staffing, documentation',
        'Pay the key person extra compensation to lower the chance of departure',
        'Bring in a replacement quickly at the moment the risk actually materializes',
        'Pull the communication stack schedule forward to shorten the risk exposure window'
      ]
    }
  },
  {
    id: 'case-s2-09',
    stage: 2,
    caseNo: 6,
    fileNo: '#T09',
    placeholder: true,
    title: '90%에서 멈춘 일정',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      '가전 진단 서비스 프로젝트의 주요 기능들이 7주 연속 "진행률 90%"로 보고되었다. 담당자들은 "코드는 다 됐고 마무리만 남았다"고 설명했다.',
      '실제로는 어느 기능도 통합 시험을 통과하지 못한 상태였다. 출시 4주 전, 완료로 보고된 기능 중 실제 인수 가능한 것은 절반에 미치지 못했다.'
    ].join('\n\n'),
    prompt: 'PMBOK® 8판 Schedule 관점에서 이런 진척률 과장을 막는 가장 효과적인 방법은 무엇인가?',
    choices: [
      '주간 보고 횟수를 늘려 진행 상황을 더 자주 확인한다',
      '완료 정의(DoD)를 인수 가능한 가치 단위로 정하고, 검증된 산출물 기준으로만 진척을 인정한다',
      '진행률 보고를 담당자 대신 PM이 직접 산정한다',
      '90%를 초과한 항목은 자동으로 100%로 처리해 보고를 단순화한다'
    ],
    en: {
      title: 'A Schedule Stuck at 90%',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'Key features of an appliance diagnostics project were reported at "90% complete" for seven consecutive weeks. The owners explained that "the code is done, only wrap-up remains."',
        'In reality not one feature had passed integration testing. Four weeks before launch, fewer than half of the features reported as complete were actually acceptable.'
      ].join('\n\n'),
      prompt: 'From the Schedule standpoint of PMBOK® 8th Edition, what most effectively prevents this kind of inflated progress?',
      choices: [
        'Increase the frequency of weekly reporting to check progress more often',
        'Define done (DoD) as an acceptable unit of value and credit progress only against verified deliverables',
        'Have the PM calculate the progress rate personally instead of the owners',
        'Automatically round anything above 90% to 100% to simplify reporting'
      ]
    }
  },
  {
    id: 'case-s2-10',
    stage: 2,
    caseNo: 7,
    fileNo: '#T10',
    placeholder: true,
    title: '한 곳에 걸린 공급망',
    brief: [
      '[임시 사건 — Stage 2 콘텐츠 확정 시 교체]',
      '웨어러블 신제품 프로젝트는 핵심 센서를 단일 공급사에서만 조달했다. 단가가 가장 낮고 기존 검증 이력이 있다는 이유였다.',
      '동시에 개발팀 6명 중 3명은 다른 두 프로젝트에 60%씩 겸직 배정되어 실제 가용 공수가 계획의 70% 수준이었다. 양산 3주 전 공급사 화재로 센서 납기가 6주 지연되었고, 대체 검증을 수행할 인력도 남아 있지 않았다.'
    ].join('\n\n'),
    prompt: 'PMBOK® 8판 Resources 관점에서 이 프로젝트가 사전에 확보해야 했던 것은 무엇인가?',
    choices: [
      '센서 단가를 더 낮춰 예산 여유를 확보한다',
      '공급사 계약에 지연 배상 조항을 강화한다',
      '이원화 공급 등 대체 조달 경로와, 과부하 없는 실가용 공수 기준의 자원 계획을 확보한다',
      '개발팀 인원을 6명에서 8명으로 늘려 총 공수를 키운다'
    ],
    en: {
      title: 'A Supply Chain Hanging on One Hook',
      brief: [
        '[Temporary case — to be replaced when Stage 2 content is confirmed]',
        'A new wearable project sourced its core sensor from a single supplier — lowest unit price, and an existing qualification history.',
        'At the same time, three of the six developers were assigned 60% each to two other projects, leaving actual available effort at about 70% of plan. Three weeks before mass production a fire at the supplier delayed sensor delivery by six weeks, and no one was left to qualify an alternative.'
      ].join('\n\n'),
      prompt: 'From the Resources standpoint of PMBOK® 8th Edition, what should this project have secured in advance?',
      choices: [
        'A lower sensor unit price to create budget headroom',
        'Stronger delay-penalty clauses in the supplier contract',
        'An alternative sourcing route such as dual supply, plus a resource plan based on realistic available effort without overload',
        'Two more developers, growing the team from six to eight to increase total effort'
      ]
    }
  },
  // ══════════════ STAGE 2 임시 데이터 끝 ══════════════
  {
    id: 'case-011',
    stage: 3, // Stage 3 · AI Use Case (Strategies for AI Adoption — PMBOK 8판 Appendix X3.1.1)
    caseNo: 1,
    fileNo: '#011',
    title: 'AI 혁신을 주문한 PM, 무엇을 잘못 이해했나',
    brief: [
      '경영진은 차세대 스마트 디바이스 개발 프로젝트를 전략 프로젝트로 지정하며 다음과 같이 지시했다.',
      '"AI를 적극 활용하여 프로젝트의 생산성과 품질을 높이고, 고객에게 더 큰 가치를 제공하라."',
      '이에 따라 홍길동 PM은 프로젝트 초기부터 AI를 활용한 프로젝트 혁신을 추진하였다. 회의록 작성, 일정 계획, 요구사항 분석, 리스크 검토 등 프로젝트 전반에 AI 활용이 빠르게 확산되었다.',
      '그러나 프로젝트가 진행되던 중 일부 팀원들은 한 가지 의문을 갖게 되었다.',
      '"PM께서 AI는 적극 활용하자고 하시는데… 정말 PMBOK 8판에서 말하는 AI 활용 원칙을 제대로 이해하고 계신 걸까?"',
      'PM보호국은 프로젝트 관계자들을 조사해 다음 증언을 확보하였다. 네 증언은 모두 AI를 활용해 프로젝트의 생산성과 품질을 높이려는 목적을 담고 있다. 그러나 한 명의 증언에는 PMBOK® Guide 8판 Appendix X3.1.1(Strategies for AI Adoption)의 AI 채택 전략을 잘못 이해한 PM의 발언이 포함되어 있다.'
    ].join('\n'),
    prompt: '다음 증언 중, PM의 AI 채택 전략상 가장 중요한 고려사항이 누락되었음을 보여주는 증언은 누구의 것인가?',
    evidence: {
      caption: 'EVIDENCE · 프로젝트 참가자 증언 녹취',
      audios: [
        { src: ASSETS.questionAudio.q11, label: '참가자 증언 녹취' }
      ]
    },
    // 보기 = 증언자 4명 (순서 = 화면 번호 1~4, 녹취 등장 순서와 일치)
    choices: [
      '개발자 증언',
      '일정 담당자 증언',
      '상품기획 담당자 증언',
      '품질 담당자 증언'
    ],
    en: {
      title: 'The PM Who Ordered AI Innovation — What Did They Misunderstand?',
      brief: [
        'Executives designated the next-generation smart-device project as a strategic project and gave this direction:',
        '"Make active use of AI to raise the project\'s productivity and quality, and deliver greater value to the customer."',
        'PM Hong Gildong accordingly drove AI-based project innovation from the very start. AI use spread quickly across the project — meeting minutes, schedule planning, requirements analysis, risk review.',
        'As the project progressed, however, some team members began to wonder:',
        '"The PM keeps telling us to use AI actively… but does he really understand the AI principles of PMBOK 8th Edition?"',
        'The Bureau interviewed the project stakeholders and secured the following testimonies. All four aim to raise the project\'s productivity and quality with AI. But one of them contains a PM remark that misreads the AI adoption strategy of PMBOK® Guide 8th Edition, Appendix X3.1.1 (Strategies for AI Adoption).'
      ].join('\n'),
      prompt: 'Among the testimonies, whose account shows that the single most important consideration in the PM\'s AI adoption strategy is missing?',
      evidence: {
        caption: 'EVIDENCE · recorded testimony of project participants',
        audios: [
          { src: ASSETS.questionAudio.q11, label: 'Participant testimony recording' }
        ]
      },
      choices: [
        'The developer\'s testimony',
        'The schedule lead\'s testimony',
        'The product planner\'s testimony',
        'The quality lead\'s testimony'
      ]
    }
  },
  {
    id: 'case-012',
    stage: 3, // Stage 3 · AI Use Case (AI 기반 기능 도입의 장기적 영향·실행 가능성)
    caseNo: 2,
    fileNo: '#012',
    title: 'AI가 알아서 해줄 겁니다',
    brief: [
      '스마트 가전 SW 개발 프로젝트는 출시를 4개월 앞두고 있었다. 주요 기능 개발은 대부분 완료된 상태였으며, 시스템 통합 시험 단계 진입을 준비하고 있었다.',
      '이때 사업부에서 새로운 요구사항이 접수되었다.',
      '"AI를 활용한 테스트 자동화 기능을 추가하여 테스트 생산성을 향상시킨다."',
      '프로젝트 PM은 긴급 검토회의를 개최하였고, 검토 결과를 바탕으로 해당 요구사항을 프로젝트 범위에 반영하기로 결정하였다.',
      '그러나 프로젝트가 시범 운영 단계에 진입한 이후 다양한 문제가 발생하였다.',
      '· AI 사용 비용 급증\n· 생성된 테스트 케이스의 품질 편차 발생\n· 모델 성능 저하 발생 시 원인 분석 지연\n· 운영 조직의 인수 거부\n· 추가 투자 계획 수립 요구',
      'PM보호국은 프로젝트 실패의 원인이 특정 의사결정에서 시작되었다고 판단하고, 긴급 검토회의에서 네 개의 단서를 확보하였다.'
    ].join('\n'),
    prompt: '다음 확보 단서 중, PMBOK® Guide 8판이 강조하는 "AI 기반 기능 도입의 장기적 영향과 실행 가능성"을 충분히 검토하지 않은 의사결정을 찾아라.',
    evidence: {
      caption: 'EVIDENCE · 확보 단서 4',
      images: [
        { src: ASSETS.questions.q12_1, alt: '확보 단서 A', label: '확보 단서 A' },
        { src: ASSETS.questions.q12_2, alt: '확보 단서 B', label: '확보 단서 B' },
        { src: ASSETS.questions.q12_3, alt: '확보 단서 C', label: '확보 단서 C' },
        { src: ASSETS.questions.q12_4, alt: '확보 단서 D', label: '확보 단서 D' }
      ]
    },
    // 보기 = 확보 단서 A~D (순서 = 화면 번호 1~4, 이미지 라벨과 일치)
    choices: [
      '확보 단서 A',
      '확보 단서 B',
      '확보 단서 C',
      '확보 단서 D'
    ],
    en: {
      title: '"The AI Will Take Care of It"',
      brief: [
        'A smart-appliance software project was four months from launch. Most core feature development was complete and the team was preparing to enter system integration testing.',
        'At that point the business unit submitted a new requirement.',
        '"Add an AI-based test automation capability to improve testing productivity."',
        'The PM convened an emergency review meeting and, based on its outcome, decided to take the requirement into the project scope.',
        'After the project entered pilot operation, however, a range of problems surfaced.',
        '· AI usage costs spiked\n· Quality of generated test cases varied widely\n· Root-cause analysis lagged when model performance degraded\n· The operations organization refused handover\n· Additional investment planning was demanded',
        'The Bureau concluded that the project\'s failure began with one specific decision, and secured four pieces of evidence from the emergency review meeting.'
      ].join('\n'),
      prompt: 'Among the secured clues, find the decision that failed to adequately examine the "long-term impact and feasibility of adopting an AI-based capability" emphasized by PMBOK® Guide 8th Edition.',
      evidence: {
        caption: 'EVIDENCE · 4 secured clues',
        images: [
          { src: ASSETS.questions.q12_1, alt: 'Clue A', label: 'Clue A' },
          { src: ASSETS.questions.q12_2, alt: 'Clue B', label: 'Clue B' },
          { src: ASSETS.questions.q12_3, alt: 'Clue C', label: 'Clue C' },
          { src: ASSETS.questions.q12_4, alt: 'Clue D', label: 'Clue D' }
        ]
      },
      choices: ['Clue A', 'Clue B', 'Clue C', 'Clue D']
    }
  },
  {
    id: 'case-013',
    stage: 3, // Stage 3 · AI Use Case (Early Warning Signals)
    caseNo: 3,
    fileNo: '#013',
    title: 'AI는 왜 경고를 보냈는가?',
    brief: [
      '차세대 스마트팩토리 플랫폼 프로젝트는 출시를 4개월 앞두고 있었다. 프로젝트는 순조롭게 진행되는 것으로 보였다.',
      '· 일정 상태 정상\n· 비용 상태 정상\n· 주요 마일스톤 달성\n· 프로젝트 상태 GREEN',
      '프로젝트 매니저는 임원회의에서 다음과 같이 보고하였다.',
      '"현재 특별한 문제는 없으며 계획대로 진행 중입니다."',
      '그러나 같은 날, AI 관제 시스템은 관리자의 추가 검토를 권고하는 경고를 생성하였다.',
      '이후 감사 과정에서 AI의 상세 분석 로그는 삭제되었고, 사건 현장에서는 대시보드 스크린샷 1장만 발견되었다. PM보호국은 이 스크린샷을 분석하여 AI가 어떤 방식으로 위험을 감지했는지 밝혀내고자 한다.'
    ].join('\n'),
    prompt: '프로젝트 상태는 전반적으로 정상으로 보인다. 그럼에도 AI가 추가 검토를 권고한 가장 적절한 이유는 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 현장에서 복구된 AI 프로젝트 대시보드',
      images: [
        { src: ASSETS.questions.q13, alt: '사건 현장에서 복구된 AI 프로젝트 대시보드' }
      ]
    },
    // 보기 = PMBOK AI 활용 유형 4개. desc는 보기 아래 보조 설명으로 붙는다(question-choice.js).
    choices: [
      { label: 'Risk Identification & Assessment', desc: 'AI가 새롭게 등록된 리스크들의 발생 가능성과 영향을 평가하여 경고를 생성하였다.' },
      { label: 'Predictive Analytics for Planning', desc: 'AI가 향후 자원 부족과 일정 병목 현상을 예측하여 계획 재수립이 필요하다고 판단하였다.' },
      { label: 'Real-Time Monitoring', desc: 'AI가 기준선 대비 일정과 비용 편차를 감시하던 중 허용 범위를 초과한 이상 징후를 발견하였다.' },
      { label: 'Early Warning Signals', desc: 'AI가 현재 지표는 정상으로 보이지만 여러 지표의 변화 패턴이 과거 문제 프로젝트와 유사하게 나타남을 감지하였다.' }
    ],
    en: {
      title: 'Why Did the AI Raise a Warning?',
      brief: [
        'A next-generation smart-factory platform project was four months from launch, and everything appeared to be on track.',
        '· Schedule status normal\n· Cost status normal\n· Key milestones met\n· Project status GREEN',
        'The project manager reported the following at the executive meeting:',
        '"There are no particular problems at present; we are proceeding as planned."',
        'That same day, however, the AI monitoring system generated a warning recommending further review by the manager.',
        'The AI\'s detailed analysis logs were later deleted during the audit, and only a single dashboard screenshot was found at the scene. The Bureau intends to analyze that screenshot and determine how the AI detected the risk.'
      ].join('\n'),
      prompt: 'The project status looks normal overall. What is the most appropriate reason the AI still recommended further review?',
      evidence: {
        caption: 'EVIDENCE · AI project dashboard recovered at the scene',
        images: [
          { src: ASSETS.questions.q13, alt: 'AI project dashboard recovered at the scene of the case' }
        ]
      },
      choices: [
        { label: 'Risk Identification & Assessment', desc: 'The AI assessed the probability and impact of newly registered risks and generated the warning.' },
        { label: 'Predictive Analytics for Planning', desc: 'The AI forecast future resource shortfalls and schedule bottlenecks and judged that replanning was needed.' },
        { label: 'Real-Time Monitoring', desc: 'While watching schedule and cost variance against the baseline, the AI found an anomaly exceeding the allowed range.' },
        { label: 'Early Warning Signals', desc: 'Although current indicators look normal, the AI detected that the change patterns across several indicators resemble past troubled projects.' }
      ]
    }
  },
  {
    // id는 fileNo가 아니라 스테이지로 구분한다 — Stage 1의 'case-014'(사건 파일 #014)와 사건 파일
    // 번호가 겹치기 때문. id는 제출·중복방지·점수의 키라서 반드시 유일해야 한다 (lib/progress.js).
    id: 'case-s3-014',
    stage: 3, // Stage 3 · AI Use Case (Risk Identification and Assessment)
    caseNo: 4,
    fileNo: '#014',
    title: '코드네임 D-90',
    brief: [
      'PM보호국 상황실에 긴급 구조 요청이 접수되었다.',
      '차세대 AI 기반 서비스 개발 프로젝트. 출시까지 남은 시간은 90일.',
      '그러나 최근 프로젝트에서는 심상치 않은 징후가 발견되고 있다.',
      '· 요구사항 변경 증가\n· 품질 이슈 반복 발생\n· 일정 버퍼 소진\n· 핵심 인력 업무 과부하',
      '아직 치명적인 문제는 발생하지 않았지만, 경영진은 향후 대형 위기로 이어질 가능성을 우려하고 있다. PM보호국은 즉시 현장에 특별 PM을 투입하기로 결정했다.',
      '후보는 4명. 모두 AI를 활용해 프로젝트를 관리해 본 경험이 있다고 주장하고 있다. PM보호국 면접관은 후보 PM들에게 다음과 같은 질문을 던졌다.',
      '"현재 프로젝트는 아직 큰 사고가 발생하지 않았지만 여러 위험 신호가 나타나고 있습니다. 만약 당신이 투입된다면 AI를 활용하여 앞으로 발생할 수 있는 리스크를 어떻게 파악하고 평가하겠습니까?"'
    ].join('\n'),
    prompt: '다음 인터뷰 응답 중, PMBOK® Guide 8판의 AI Use Case "Risk Identification and Assessment(리스크 식별 및 평가)"를 가장 충실하게 활용할 것으로 판단되는 PM은 누구인가?',
    evidence: {
      caption: 'EVIDENCE · 후보 PM 인터뷰 녹취 4',
      audios: [
        { src: ASSETS.questionAudio.q14_1, label: '이 PM 인터뷰' },
        { src: ASSETS.questionAudio.q14_2, label: '최 PM 인터뷰' },
        { src: ASSETS.questionAudio.q14_3, label: '한 PM 인터뷰' },
        { src: ASSETS.questionAudio.q14_4, label: '박 PM 인터뷰' }
      ]
    },
    // 보기 = 후보 PM 4명 (순서 = 녹취 순서 = 화면 번호 1~4)
    choices: [
      '이 PM',
      '최 PM',
      '한 PM',
      '박 PM'
    ],
    en: {
      title: 'Codename D-90',
      brief: [
        'An emergency rescue request reached the Bureau\'s situation room.',
        'A next-generation AI-based service development project. Ninety days remain until launch.',
        'Lately, however, troubling signs have been surfacing on the project.',
        '· Rising requirement changes\n· Recurring quality issues\n· Schedule buffer exhausted\n· Key personnel overloaded',
        'No fatal problem has occurred yet, but executives worry this could grow into a major crisis. The Bureau decided to deploy a special PM to the site immediately.',
        'There are four candidates. All claim experience managing projects with AI. The Bureau\'s interviewer put the following question to them:',
        '"The project has not yet suffered a major incident, but several risk signals are appearing. If you were deployed, how would you use AI to identify and assess the risks that may arise?"'
      ].join('\n'),
      prompt: 'Among the interview responses, which PM appears to make the fullest use of the PMBOK® Guide 8th Edition AI use case "Risk Identification and Assessment"?',
      evidence: {
        caption: 'EVIDENCE · 4 candidate PM interview recordings',
        audios: [
          { src: ASSETS.questionAudio.q14_1, label: 'PM Lee interview' },
          { src: ASSETS.questionAudio.q14_2, label: 'PM Choi interview' },
          { src: ASSETS.questionAudio.q14_3, label: 'PM Han interview' },
          { src: ASSETS.questionAudio.q14_4, label: 'PM Park interview' }
        ]
      },
      choices: ['PM Lee', 'PM Choi', 'PM Han', 'PM Park']
    }
  },
  {
    id: 'case-015',
    stage: 3, // Stage 3 · AI Use Case (Multi-Criteria Decision Analysis)
    caseNo: 5,
    fileNo: '#015',
    title: '사라진 우선순위표',
    brief: [
      'PM보호국 긴급상황실. 디지털 전환 전략을 담당하는 A사업부에서 구조 요청이 접수되었다.',
      '사업부는 올해 안에 4개 프로젝트를 추진해야 하지만, 예상치 못한 인력 부족으로 모든 프로젝트를 동시에 수행할 수 없는 상황에 처했다. 심지어 프로젝트마다 기대 효과도 다르고, 리스크 수준도 다르며, 전략적 중요도 역시 제각각이다.',
      '긴급 투입된 PM은 AI를 활용하여 우선순위를 결정한 후 경영진에 보고했지만, 보고서가 손상되어 일부 로그만 남게 되었다.',
      'PM보호국은 남은 단서를 통해 PM이 활용한 AI Use Case를 확인하려고 한다.'
    ].join('\n'),
    prompt: '위 프로젝트 상황에 가장 적합한 PMBOK® Guide 8판의 AI Use Case는 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 복구된 로그 4 (일부 손상)',
      images: [
        { src: ASSETS.questions.q15_a, alt: '복구된 로그 A', label: '로그 A' },
        { src: ASSETS.questions.q15_b, alt: '복구된 로그 B', label: '로그 B' },
        { src: ASSETS.questions.q15_c, alt: '복구된 로그 C', label: '로그 C' },
        { src: ASSETS.questions.q15_d, alt: '복구된 로그 D', label: '로그 D' }
      ]
    },
    // 보기 = AI Use Case 4종 (순서 = 화면 번호 1~4)
    choices: [
      '데이터 기반 의사결정',
      '다기준 의사결정 분석',
      '리스크 식별 및 평가',
      '조기 경고 신호'
    ],
    en: {
      title: 'The Missing Priority List',
      brief: [
        'The Bureau\'s emergency room. A rescue request arrived from Business Unit A, which owns the digital transformation strategy.',
        'The unit must launch four projects this year, but an unexpected staffing shortfall means it cannot run them all at once. Worse, each project has a different expected benefit, a different risk level, and a different strategic weight.',
        'The PM deployed to the site used AI to decide the priorities and reported to the executives, but the report was damaged and only fragments of the log remain.',
        'The Bureau intends to identify the AI use case the PM applied from what is left.'
      ].join('\n'),
      prompt: 'Which AI use case from PMBOK® Guide 8th Edition best fits this project situation?',
      evidence: {
        caption: 'EVIDENCE · 4 recovered logs (partially damaged)',
        images: [
          { src: ASSETS.questions.q15_a, alt: 'Recovered log A', label: 'Log A' },
          { src: ASSETS.questions.q15_b, alt: 'Recovered log B', label: 'Log B' },
          { src: ASSETS.questions.q15_c, alt: 'Recovered log C', label: 'Log C' },
          { src: ASSETS.questions.q15_d, alt: 'Recovered log D', label: 'Log D' }
        ]
      },
      choices: [
        'Data-driven decision making',
        'Multi-criteria decision analysis',
        'Risk identification and assessment',
        'Early warning signals'
      ]
    }
  }
]

// ──────────────────────────────────────────────────────────────────────────
// ⚠️ 정답·해설 — 클라이언트 노출 금지 대상 (CLAUDE.md §11). 지금은 MOCK 채점용으로만 둔다.
//    서버 연결(Step 3) 시 이 블록을 삭제하고 채점 RPC/Edge Function으로 옮긴다.
//    answerIndex 는 choices 배열의 0-기준 인덱스다 (예: 3 = 화면상 "4번").
// ──────────────────────────────────────────────────────────────────────────
export const SOLUTIONS = {
  'case-007': {
    answerIndex: 3, // 정답: 4번
    analysis: [
      '이 문제의 함정은 ④도 좋은 PM 활동처럼 보인다는 점입니다.',
      '실제로 이슈를 관리하고, 버그를 해결하며, 진행률을 관리하는 것은 중요한 PM 업무입니다.',
      '그러나 PMBOK 8판의 Proactive Mindset은 현재를 잘 관리하는 것을 넘어 미래를 예측하고, 문제를 예방하며, 필요한 의사결정을 앞당기는 것을 강조합니다.',
      '①, ②, ③, ⑤는 모두 미래를 예측하거나 미래의 문제를 줄이기 위한 활동입니다.',
      '반면 ④는 이미 발생한 이슈를 얼마나 잘 처리했는지에 초점이 맞춰져 있습니다.'
    ].join('\n\n'),
    en: {
      analysis: [
        'The trap here is that ④ also looks like good PM work.',
        'Managing issues, fixing bugs, and tracking progress are indeed important PM duties.',
        'But the Proactive Mindset of PMBOK 8th goes beyond managing the present well — it stresses foreseeing the future, preventing problems, and bringing necessary decisions forward.',
        '①, ②, ③, and ⑤ are all activities that predict the future or reduce future problems.',
        '④, by contrast, focuses on how well an issue that has already occurred was handled.'
      ].join('\n\n')
    }
  },
  'case-014': {
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
  'case-021': {
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

// ── i18n 리졸버 — 현재 로케일이 en이고 en 필드가 있으면 그것을, 없으면 ko(기본)를 돌려준다. ──
// evidence(이미지/오디오)는 로케일 공용이므로 항상 원본을 유지한다.
export function localizeCase (c) {
  if (getLocale() === 'en' && c.en) return { ...c, ...c.en, evidence: c.en.evidence || c.evidence }
  return c
}
export function localizeAnalysis (sol) {
  if (!sol) return ''
  if (getLocale() === 'en' && sol.en && sol.en.analysis) return sol.en.analysis
  return sol.analysis || ''
}
