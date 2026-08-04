// 사건(문제) 데이터 — MOCK. 화면에 내려가는 "사건"에는 정답이 없다 (CLAUDE.md §11).
// 정답·해설(SOLUTIONS)은 아래에 분리해 두었고, 서버 연결 시 questions 테이블 + 채점 RPC/Edge Function으로
// 이관한다 (CLAUDE.md §10, docs/game-flow.md §7.3). 그전까지는 lib/grade.js가 SOLUTIONS로 임시 채점한다.
// evidence.images = 단서 이미지 배열(1장 또는 다중). choices = 보기(개수 자유). 용어는 화면 출력 시 게임 용어로.
// ▶ 영문(i18n): 각 사건에 en: { title, brief, prompt, choices } 를, 정답에 SOLUTIONS[id].en = { analysis } 를
//   추가하면 en 로케일에서 사용된다(없으면 ko 폴백). evidence(이미지/오디오)는 로케일 공용.
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
