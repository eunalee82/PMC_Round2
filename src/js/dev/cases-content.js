// 사건(문제) 데이터 — 화면에 내려가는 "사건"에는 정답이 없다 (CLAUDE.md §11).
// ▶ 정답·해설은 이 파일에 없다: 서버 `case_answers` 테이블 + `submit_answer` RPC 가 채점하고,
//   DEV/검증용 사본만 `src/js/dev/solutions.js` 에 있다(프로덕션 번들 제외).
// evidence.images = 단서 이미지 배열(1장 또는 다중). choices = 보기(개수 자유). 용어는 화면 출력 시 게임 용어로.
// ▶ 영문(i18n): 각 사건에 en: { title, brief, prompt, choices } 를 추가하면 en 로케일에서 사용된다
//   (해설 영문은 dev/solutions.js → 서버 case_answers.analysis_en). 지금은 en.evidence도 국문 미디어를 가리키고
//   라벨/alt만 영문이다 — 영문 이미지·음성이 준비되면 en.evidence 안의 src만 교체한다(localizeCase가 우선 적용).
// ▶ choices 항목은 문자열 또는 { label, desc } — desc는 보기 아래 보조 설명으로 붙는다(question-choice.js).
import { ASSETS } from '../constants/assets.js'
import { getLocale } from '../lib/i18n.js'

export const CASES = [
  {
    id: 'case-001',
    stage: 1, // Stage 1 · Mindset
    caseNo: 1, // Stage 내 사건 순번
    // 사건 파일 번호는 단서 이미지에 인쇄된 값(CASE FILE #007)에 맞춘다 — 화면과 이미지가 어긋나면
    // 참가자가 다른 사건으로 오인한다(운영 결정 2026-08-05). caseNo(진행 순번)와는 별개 값이다.
    fileNo: '#007',
    title: '양산 D-30, 누가 미래를 놓쳤는가?',
    brief: [
      'PM보호국은 양산 30일 전 진행된 프로젝트 회의실을 조사했다.',
      '프로젝트는 당시 모든 일정이 정상으로 보고되었지만, 양산 직전 핵심 기능의 결함이 발견되어 출시가 3주 연기되었다.',
      '현장에는 PM이 남긴 여러 자료가 있었다.',
      '그런데…',
      '단 하나의 자료만 PMBOK® 8판의 Proactive Mindset과 가장 거리가 멀었다.',
      '그 증거를 찾아라.'
    ].join('\n'),
    prompt: '다음 프로젝트 현장에 남아 있는 4가지 단서 중 PMBOK® 8판의 Proactive Mindset과 가장 거리가 먼 단서는 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 현장 단서 4',
      images: [
        { src: ASSETS.questions.q1, alt: '사건 현장에 남은 4가지 단서 (CLUE 1~4)' }
      ]
    },
    // 보기(단서) — 순서 = 화면 번호 1~4 = 이미지의 CLUE 1~4.
    // 단서 이미지는 영문판 하나로 운영하므로(운영 결정 2026-08-05), 국문 화면에서는 desc의 한글 단서명이
    // 이미지의 영문 소제목(Project Schedule Forecast Dashboard 등)을 대신 짚어주는 역할을 한다.
    choices: [
      { label: '단서 1', desc: '프로젝트 일정 예측 대시보드' },
      { label: '단서 2', desc: '변경 영향 분석서' },
      { label: '단서 3', desc: '회의 안건' },
      { label: '단서 4', desc: '프로젝트 운영 현황' }
    ],
    en: {
      // 제목은 **단서 이미지에 인쇄된 영문**을 그대로 쓴다 — 이미지에 'PRODUCTION D-30, WHO MISSED THE
      // FUTURE?' 가 박혀 있어 화면 제목이 다르면 참가자가 다른 사건으로 오인한다(fileNo #007과 같은 이유).
      // 그래서 국문 '양산'의 직역인 'Mass Production' 이 아니라 이미지의 'Production' 을 따른다.
      title: 'Production D-30: Who Missed the Future?',
      // 문단은 국문과 1:1로 맞춘다 — 이전 en 판은 6문단을 4문단으로 압축해 '그런데…' 연출 호흡이 사라졌다.
      brief: [
        'The Bureau investigated the project war room as it stood 30 days before mass production.',
        'At the time every schedule was reported as on track, but a defect in a core feature was found just before mass production and the launch was delayed by three weeks.',
        'Several documents left behind by the PM were recovered at the scene.',
        'And yet…',
        'Only one of those documents was farthest from the Proactive Mindset of PMBOK® 8th Edition.',
        'Find that piece of evidence.'
      ].join('\n'),
      prompt: 'Among the four clues left at the project scene, which one is least consistent with the Proactive Mindset of PMBOK® 8th Edition?',
      evidence: {
        caption: 'EVIDENCE · 4 scene clues',
        images: [{ src: ASSETS.questions.q1, alt: 'Four clues left at the scene (CLUE 1-4)' }]
      },
      choices: [
        { label: 'Clue 1', desc: 'Project Schedule Forecast Dashboard' },
        { label: 'Clue 2', desc: 'Change Impact Analysis' },
        { label: 'Clue 3', desc: 'Meeting Agenda' },
        { label: 'Clue 4', desc: 'Project Operations Status' }
      ]
    }
  },
   {
    id: 'case-002',
    stage: 1, // Stage 1 · Mindset (Accountability & Empowered Mindset)
    caseNo: 2,
    fileNo: '#002',
    title: '권한을 준 것인가, 책임을 넘긴 것인가',
    // 확정 콘텐츠(2026-08-06). 이전 판은 문자열 안 \n 과 join('\n')이 섞여 줄 간격이 불규칙했다 —
    // 화면은 brief를 한 덩어리 텍스트로 그리므로(case.js `case__brief-body`) 문단 구분은 join만으로 만든다.
    brief: [
      '양산을 4주 앞둔 스마트 디바이스 프로젝트에서 간헐적인 통신 장애가 발견되었다.',
      '장애 발생률은 약 0.8%로 낮았지만, 실제 발생 시 사용자가 기기를 재부팅해야 하는 문제가 있었다.',
      '개발팀은 두 가지 대응안을 제시했다.',
      '· 대응안 1: 구조를 수정하여 근본 원인을 제거한다. 단, 일정이 최대 1주 지연될 수 있다.',
      '· 대응안 2: 소프트웨어 재시도 기능을 추가하여 발생 가능성을 낮춘 뒤 예정대로 출시한다. 일정 영향은 거의 없지만 잔여 위험은 남는다.',
      '이 프로젝트에서는 PM이 일정, 품질, 고객 영향을 종합적으로 고려하여 주요 의사결정을 조정하고, 기술 담당자는 전문 분야의 분석과 대안을 제시하도록 역할이 정의되어 있었다.',
      'PM보호국 감독관은 홍길동 PM과 개발자 사이에서 오간 네 개의 대화를 확보했다.',
      '모든 대화는 실무 현장에서 충분히 합리적으로 들린다.',
      '그러나 그중 하나는 팀의 자율성을 존중하는 것처럼 보이지만, PMBOK® Guide 8판이 강조하는 Accountable Leader의 역할을 충분히 수행하지 못한 사례였다.'
    ].join('\n'),
    prompt: '다음 대화 중 팀의 자율성을 지원하는 것처럼 보이지만, PMBOK® Guide 8판 관점에서 가장 부적절한 대화는 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 현장 자료 + 대화 녹취 4',
      images: [
        { src: ASSETS.questions.q2, alt: '사건 #002 현장 — 프로젝트 상황판(일정 지연 D-28 · 오픈 이슈 27건 · 품질 리스크 HIGH)과 대화 중인 PM·개발자' }
      ],
      audios: [
        { src: ASSETS.questionAudio.q2_1, label: '녹취 A' },
        { src: ASSETS.questionAudio.q2_2, label: '녹취 B' },
        { src: ASSETS.questionAudio.q2_3, label: '녹취 C' },
        { src: ASSETS.questionAudio.q2_4, label: '녹취 D' }
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
      // 국문 확정본과 정보량을 맞춘다 — 이전 en 판은 brief·prompt가 "PM이 의사결정 책임을 팀에 넘겼다"까지
      // 밝혀 국문보다 힌트를 더 줬다(로케일 간 난이도 불공평). 문단 구성도 국문과 1:1로 맞췄다.
      brief: [
        'Four weeks before mass production of a smart-device project, an intermittent communication fault was found.',
        'The fault rate was low at about 0.8%, but when it occurred the user had to reboot the device.',
        'The dev team proposed two options.',
        '· Option 1: Fix the architecture to remove the root cause. The schedule may slip by up to one week.',
        '· Option 2: Lower the occurrence with a software retry feature and ship on schedule. Little schedule impact, but residual risk remains.',
        'On this project, roles were defined so that the PM coordinates key decisions by weighing schedule, quality and customer impact together, while technical leads provide analysis and alternatives in their own domain.',
        'The Bureau\'s auditor secured four conversations between PM Hong Gildong and the developers.',
        'Every conversation sounds reasonable enough in practice.',
        'Yet one of them, while appearing to respect the team\'s autonomy, failed to fully carry out the role of the Accountable Leader that PMBOK® Guide 8th Edition emphasizes.'
      ].join('\n'),
      prompt: 'Among the following conversations, which one appears to support the team\'s autonomy but is the most inappropriate from the standpoint of PMBOK® Guide 8th Edition?',
      evidence: {
        caption: 'EVIDENCE · scene material + 4 recordings',
        images: [{ src: ASSETS.questions.q2, alt: 'Case #002 scene — project status board (schedule delay D-28, 27 open issues, quality risk HIGH) with the PM and a developer talking' }],
        // 영문 녹취 도착(2026-08-06) → 국문 음성 대신 _en 을 쓴다.
        audios: [
          { src: ASSETS.questionAudio.q2_1_en, label: 'Recording A' },
          { src: ASSETS.questionAudio.q2_2_en, label: 'Recording B' },
          { src: ASSETS.questionAudio.q2_3_en, label: 'Recording C' },
          { src: ASSETS.questionAudio.q2_4_en, label: 'Recording D' }
        ]
      },
      choices: ['Recording A', 'Recording B', 'Recording C', 'Recording D']
    }
  },
  {
    id: 'case-003',
    stage: 1, // Stage 1 · Mindset (Value-Driven Mindset)
    caseNo: 3,
    fileNo: '#003',
    title: '성공한 프로젝트, 진짜 가치는 어디에 있었나',
    // 확정 콘텐츠(2026-08-06) — 사건 맥락은 브리핑 음성(question3.mp3)에만 담는다. 개요에 텍스트로
    // 옮겨 적지 않는다는 운영 결정이라 en.brief 도 같은 두 줄로 맞췄다(이전 en 판에는 프로젝트 성과
    // 5항목이 텍스트로 있어 국문보다 정보가 많았다).
    brief: [
      '다음은 PM보호국 감독관이 사건을 브리핑하는 음성 기록이다.',
      '음성을 듣고, 제공된 4개의 확보 단서를 분석하여 물음에 답하시오.'
    ].join('\n'),
    prompt: '다음 4개의 확보 증거물 중, 홍길동 PM이 PMBOK® Guide 8판의 Value-Driven Mindset에 기반하여 의사결정했음을 보여주는 결정적 단서는 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 감독관 브리핑 + 길동 책임 다이어리 4',
      audioFirst: true, // 브리핑 음성을 먼저 듣고 증거물을 판독하는 사건 → 오디오가 이미지 위
      images: [
        { src: ASSETS.questions.q3_1, alt: '증거물 A 다이어리 기록', label: '증거물 A' },
        { src: ASSETS.questions.q3_2, alt: '증거물 B 다이어리 기록', label: '증거물 B' },
        { src: ASSETS.questions.q3_3, alt: '증거물 C 다이어리 기록', label: '증거물 C' },
        { src: ASSETS.questions.q3_4, alt: '증거물 D 다이어리 기록', label: '증거물 D' }
      ],
      audios: [
        { src: ASSETS.questionAudio.q3, label: '사건 브리핑' }
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
        'The following is an audio record of a Bureau auditor briefing the case.',
        'Listen to it, analyse the four secured clues, and answer the question.'
      ].join('\n'),
      prompt: 'Among the four secured pieces of evidence, which is the decisive clue showing that PM Hong Gildong decided on the basis of the Value-Driven Mindset of PMBOK® Guide 8th Edition?',
      // 이 사건만 국문·영문 단서 이미지가 따로 있다(2026-08-06 영문판 도착) — 그래서 en.evidence의 src를 교체한다.
      evidence: {
        caption: 'EVIDENCE · auditor briefing + 4 diary entries',
        audioFirst: true,
        images: [
          { src: ASSETS.questions.q3_1_en, alt: 'Evidence A diary entry', label: 'Evidence A' },
          { src: ASSETS.questions.q3_2_en, alt: 'Evidence B diary entry', label: 'Evidence B' },
          { src: ASSETS.questions.q3_3_en, alt: 'Evidence C diary entry', label: 'Evidence C' },
          { src: ASSETS.questions.q3_4_en, alt: 'Evidence D diary entry', label: 'Evidence D' }
        ],
        audios: [
          { src: ASSETS.questionAudio.q3_en, label: 'Case briefing' }
        ]
      },
      choices: ['Evidence A', 'Evidence B', 'Evidence C', 'Evidence D']
    }
  },

  // ════════════════════════════════════════════════════════════════════════
  // STAGE 2 · Performance Domain — 확정 콘텐츠 7사건 (2026-08-06)
  //   주제 매핑(docs/game-flow.md §9.2): #004 Governance · #005 Scope · #006 Schedule · #007 Financial ·
  //      #008 Stakeholders · #009 Resources · #010 Risk
  //   ⚠️ /images/questions/question4.webp 는 **이 스테이지의 어느 사건도 쓰지 않는다.** 내용이 '출시 17분 후
  //      AUTH ERROR · 성능시험이 보안 우회 시나리오 미포함'이라 #004(플랫폼 변경 거버넌스)와 맞지 않는다.
  //      쓰는 사건이 없으므로 assets.js 에 등록하지 않았다(CLAUDE.md §16.1).
  // ════════════════════════════════════════════════════════════════════════
  {
    id: 'case-004',
    stage: 2, // Stage 2 · Performance Domain (Governance — 의사결정 체계·이해관계자 참여)
    caseNo: 1,
    fileNo: '#004',
    title: '그 결정은 왜 회의실을 벗어나지 못했는가',
    brief: [
      '스마트 물류 플랫폼 프로젝트는 출시 6주 전 핵심 기술 플랫폼을 변경하였다.',
      '프로젝트 팀은 해당 변경이 시스템 안정성 향상에 도움이 될 것으로 기대하였으며, 개발 일정에도 큰 영향은 없을 것으로 판단하였다.',
      '그러나 실제 적용 과정에서 추가 검증 작업과 협력사 연계 수정이 예상보다 크게 증가하였고, 운영 프로세스와 유지보수 체계에도 변화가 필요해졌다.',
      '결국 프로젝트는 출시가 2개월 연기되었으며 추가 비용도 발생하였다.',
      '사건 발생 후 PM보호국은 당시 상황을 확인하기 위해 프로젝트 관계자들을 인터뷰하였다.',
      '다음은 PM보호국 감독관이 프로젝트 관계자들을 인터뷰한 내용이다.'
    ].join('\n'),
    prompt: '인터뷰 내용을 종합적으로 분석할 때, 프로젝트 지연의 원인이 된 PM의 판단 방식으로 가장 적절한 것은 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 관계자 인터뷰 녹취',
      audioFirst: true, // 인터뷰가 판단 근거다 → 오디오를 먼저 듣게 한다
      audios: [
        { src: ASSETS.questionAudio.q4, label: '관계자 인터뷰 녹취 (인터뷰 1~4)' }
      ]
    },
    choices: [
      '기술적 위험이 관리 가능하다고 판단된 만큼, 변경 이후 발생 가능한 영향을 더욱 지속적으로 추적하고 점검했어야 한다.',
      '기술 전문가들의 의견을 참고하되, 변경이 여러 조직에 미치는 영향을 더욱 폭넓고 체계적으로 분석했어야 한다.',
      '프로젝트 내부에서 판단할 사항과 주요 이해관계자가 함께 검토해야 할 사항을 구분하여 적절한 의사결정 체계를 적용했어야 한다.',
      '일정 압박이 있는 상황일수록 변경으로 인한 추가 작업과 검증 부담을 더욱 보수적으로 산정했어야 한다.'
    ],
    en: {
      title: 'Why That Decision Never Left the Meeting Room',
      brief: [
        'Six weeks before launch, the smart logistics platform project changed its core technology platform.',
        'The project team expected the change to improve system stability and judged that it would not greatly affect the development schedule.',
        'In practice, however, the additional verification work and the partner-integration rework grew far more than expected, and the operating process and maintenance structure needed to change as well.',
        'The launch was ultimately postponed by two months and additional cost was incurred.',
        'After the incident the Bureau interviewed the project stakeholders to establish what had happened.',
        'The following are the Bureau auditor\'s interviews with the project stakeholders.'
      ].join('\n'),
      prompt: 'Analysing the interviews as a whole, which best describes the PM\'s way of deciding that caused the project delay?',
      evidence: {
        caption: 'EVIDENCE · stakeholder interview recording',
        audioFirst: true,
        audios: [
          { src: ASSETS.questionAudio.q4_en, label: 'Stakeholder interview recording (interviews 1-4)' }
        ]
      },
      choices: [
        'Since the technical risk was judged manageable, the possible effects after the change should have been tracked and checked more continuously.',
        'While drawing on the technical experts\' opinions, the impact of the change across multiple organizations should have been analysed more broadly and systematically.',
        'Matters to be decided inside the project should have been separated from matters requiring review with key stakeholders, applying the appropriate decision-making structure.',
        'The tighter the schedule pressure, the more conservatively the extra work and verification burden from the change should have been estimated.'
      ]
    }
  },
  {
    id: 'case-005',
    stage: 2, // Stage 2 · Performance Domain (Scope — Scope Creep 조기 경고 신호)
    caseNo: 2,
    fileNo: '#005',
    // ⚠️ 이 사건만 **복수 정답**이다 — 5개 중 3개를 고른다. 엔진은 multi/selectCount 로 판단하고
    //    정답은 solutions.js 의 answerIndexes(배열)에 있다. 채점은 전부 일치해야 정답(부분 점수 없음).
    multi: true,
    selectCount: 3,
    title: '사라진 두 달',
    brief: [
      '차량용 인포테인먼트 플랫폼 Project Orion은 양산 직전 단계에 있었다.',
      '프로젝트는 예정된 출시일보다 정확히 2개월 늦게 종료되었다.',
      '그러나 프로젝트 종료 후 진행된 감사 결과는 이상했다.',
      '· 공식 승인된 변경 요청은 거의 없었다.\n· 예산 초과도 크지 않았다.\n· 주요 리스크도 모두 관리되고 있는 것으로 보고되어 있었다.',
      '그런데도 프로젝트는 점점 늦어졌고, 팀원들은 출시 직전까지 과도한 업무에 시달렸다.',
      '감사팀은 프로젝트 기록을 추적하던 중 일정 지연의 원인이 될 수 있는 다섯 건의 기록을 발견하였다.',
      '기록 자체는 모두 사소해 보였지만, 감사팀은 이들 중 일부가 프로젝트 범위를 서서히 확장시켜 결국 두 달의 지연을 초래했을 가능성이 있다고 판단하였다.',
      '현재 PM보호국은 해당 기록들을 증거물로 확보하여 분석 중이다.'
    ].join('\n'),
    prompt: 'PMBOK® Guide 8판 관점에서, Scope Creep이 발생하고 있다는 조기 경고 신호(Early Warning Sign)에 해당하는 증거물 3개를 고르시오.',
    evidence: {
      caption: 'EVIDENCE · 확보 증거물 5',
      images: [
        { src: ASSETS.questions.q5_1, alt: '증거물 A 기록', label: '증거물 A' },
        { src: ASSETS.questions.q5_2, alt: '증거물 B 기록', label: '증거물 B' },
        { src: ASSETS.questions.q5_3, alt: '증거물 C 기록', label: '증거물 C' },
        { src: ASSETS.questions.q5_4, alt: '증거물 D 기록', label: '증거물 D' },
        { src: ASSETS.questions.q5_5, alt: '증거물 E 기록', label: '증거물 E' }
      ]
    },
    choices: [
      '증거물 A',
      '증거물 B',
      '증거물 C',
      '증거물 D',
      '증거물 E'
    ],
    en: {
      title: 'The Two Months That Vanished',
      brief: [
        'Project Orion, an in-vehicle infotainment platform, was in its final stage before mass production.',
        'The project closed exactly two months later than the planned launch date.',
        'The audit run after closure, however, produced an odd result.',
        '· Almost no change requests had been formally approved.\n· The budget overrun was not large either.\n· All key risks were reported as being under control.',
        'Even so the project kept slipping, and the team was buried in excessive work right up to launch.',
        'While tracing the project records, the audit team found five entries that could account for the schedule delay.',
        'Each record looked trivial on its own, but the audit team judged that some of them may have gradually expanded the project scope and ultimately caused the two-month delay.',
        'The Bureau has secured those records as evidence and is analysing them.'
      ].join('\n'),
      // 국문이 'Scope Creep'·'Early Warning Sign'을 고유 용어로 표기한다 — 영문도 대문자 표기를 유지한다
      // (사건 #013의 보기 'Early Warning Signals'와 같은 용어라 표기가 흔들리면 참가자가 다른 개념으로 읽는다).
      prompt: 'From the standpoint of PMBOK® Guide 8th Edition, choose the three pieces of evidence that are Early Warning Signs of Scope Creep.',
      evidence: {
        caption: 'EVIDENCE · 5 secured records',
        images: [
          { src: ASSETS.questions.q5_1, alt: 'Evidence A record', label: 'Evidence A' },
          { src: ASSETS.questions.q5_2, alt: 'Evidence B record', label: 'Evidence B' },
          { src: ASSETS.questions.q5_3, alt: 'Evidence C record', label: 'Evidence C' },
          { src: ASSETS.questions.q5_4, alt: 'Evidence D record', label: 'Evidence D' },
          { src: ASSETS.questions.q5_5, alt: 'Evidence E record', label: 'Evidence E' }
        ]
      },
      choices: ['Evidence A', 'Evidence B', 'Evidence C', 'Evidence D', 'Evidence E']
    }
  },
  {
    id: 'case-006',
    stage: 2, // Stage 2 · Performance Domain (Schedule — 추세 기반 예측)
    caseNo: 3,
    fileNo: '#006',
    title: '초록색 경고등',
    brief: [
      'PM보호국은 전사 프로젝트를 실시간 분석하는 AI 기반 감시 시스템 PMS(Project Monitoring System)를 운영하고 있다.',
      'PMS는 프로젝트의 일정, 범위, 품질, 리스크 관련 데이터를 지속적으로 분석하여 프로젝트 실패 가능성이 높아지는 징후를 조기에 탐지한다.',
      '2026년 8월 6일 오전 02:17. PMS는 전략 프로젝트인 MediaSphere에 대해 예상치 못한 경고를 발생시켰다.',
      '[PMS 자동 알림]\n· Project: MediaSphere\n· Current Status: GREEN\n· Alert Level: YELLOW\n· Analysis Result: Future Schedule Risk Detected / Schedule Predictability Degrading / Trend-Based Review Recommended',
      '문제는 프로젝트 공식 상태가 GREEN이라는 점이었다. 프로젝트 PM은 즉시 다음과 같은 의견을 제출했다.',
      '"전체 진행률은 이미 85%입니다. 일정 버퍼도 아직 5일 남아 있습니다. 현재 일정 상태는 GREEN이며 특별한 문제는 없습니다."',
      '그러나 PMS는 경고를 철회하지 않았다. PM보호국은 PMS가 경고를 발생시킨 이유를 조사하기 위해 Week 4 시점의 Schedule Health Board를 확보하였다.'
    ].join('\n'),
    prompt: '다음 중 PMBOK® Guide 8판의 Schedule Performance Domain 관점에서 가장 부적절한 해석은 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · Week 4 Schedule Health Board',
      images: [
        { src: ASSETS.questions.q6, alt: 'MediaSphere 프로젝트의 Week 4 Schedule Health Board — 진행률 85%, 일정 버퍼 15일→5일 감소, Validation Scope 20→38건 증가, 미해결 결함 31건, 상태 GREEN' }
      ]
    },
    choices: [
      'Validation Scope가 지속적으로 증가하고 있으므로 프로젝트 일정 예측은 최신 정보를 반영하여 갱신될 필요가 있다.',
      '현재 시점에서 프로젝트 상태는 GREEN이며 일정 버퍼도 남아 있으므로, 우선은 기존 일정 기준선을 유지하면서 향후 몇 주간의 추세를 추가 관찰하는 것이 적절하다.',
      '일정 버퍼가 15일에서 5일로 감소하고 있으므로 일정 유연성이 감소하고 있다고 볼 수 있다. 따라서 일정 위험 요인을 추가로 분석할 필요가 있다.',
      '진행률이 85%라는 정보만으로 프로젝트가 계획된 일정 내에 완료될 것이라고 결론 내릴 수는 없다. 향후 완료 시점은 현재 성과와 최근 추세를 함께 고려하여 예측해야 한다.'
    ],
    en: {
      title: 'The Green Warning Light',
      brief: [
        'The Bureau operates PMS (Project Monitoring System), an AI-based watch system that analyses every project in the company in real time.',
        'PMS continuously analyses schedule, scope, quality and risk data to detect early signs that a project\'s probability of failure is rising.',
        '6 August 2026, 02:17. PMS raised an unexpected alert on the strategic project MediaSphere.',
        '[PMS automatic alert]\n· Project: MediaSphere\n· Current Status: GREEN\n· Alert Level: YELLOW\n· Analysis Result: Future Schedule Risk Detected / Schedule Predictability Degrading / Trend-Based Review Recommended',
        'The problem was that the project\'s official status was GREEN. The project PM submitted this opinion at once:',
        '"Overall progress is already 85%. There are still five days of schedule buffer left. The current schedule status is GREEN and there is no particular problem."',
        'PMS did not withdraw the alert. To investigate why it fired, the Bureau secured the Schedule Health Board as of Week 4.'
      ].join('\n'),
      prompt: 'Which of the following is the least appropriate interpretation from the standpoint of the Schedule Performance Domain in PMBOK® Guide 8th Edition?',
      evidence: {
        caption: 'EVIDENCE · Week 4 Schedule Health Board',
        images: [
          { src: ASSETS.questions.q6, alt: 'Week 4 Schedule Health Board for MediaSphere — 85% progress, schedule buffer falling from 15 to 5 days, validation scope rising from 20 to 38 cases, 31 open defects, status GREEN' }
        ]
      },
      choices: [
        'Validation scope keeps increasing, so the project schedule forecast needs to be updated to reflect the latest information.',
        'The project status is GREEN at present and schedule buffer remains, so it is appropriate to hold the existing schedule baseline for now and observe the trend for a few more weeks.',
        'Schedule buffer is falling from 15 days to 5 days, so schedule flexibility is decreasing. The schedule risk factors therefore need further analysis.',
        'Progress of 85% alone cannot support the conclusion that the project will finish within the planned schedule. The completion date must be forecast from current performance together with the recent trend.'
      ]
    }
  },
  {
    id: 'case-007',
    stage: 2, // Stage 2 · Performance Domain (Financial — 매몰비용 오류)
    caseNo: 4,
    // ⚠️ 표시 번호 #007 이 Stage 1 의 case-001 과 겹친다 — case-001 은 단서 이미지에 'CASE FILE #007' 이
    //    인쇄돼 있어 화면도 #007 로 맞춰 둔 상태다(2026-08-05 운영 결정). id 는 서로 달라 제출·점수는
    //    안전하지만, 참가자에게는 같은 번호가 두 번 보인다. 정리하려면 둘 중 하나의 fileNo 를 바꿔야 한다.
    fileNo: '#007',
    title: '1,500억의 선택',
    brief: [
      '회사는 미래 사업 경쟁력을 좌우할 차세대 AI Mobility Platform 프로젝트를 추진하기로 했다.',
      '총 투자 규모는 1,500억 원. 프로젝트의 성공 여부가 회사의 향후 성장에 큰 영향을 미치는 만큼, 경영진은 PM 선발을 가장 중요한 과제로 판단했다.',
      '이에 PM보호국은 핵심 전략 프로젝트를 맡길 PM 후보들의 의사결정 역량을 검증하기 위해 긴급 심사에 착수했다.',
      '특히 대규모 투자가 필요한 프로젝트인 만큼, Finance Performance Domain에 대한 이해를 집중적으로 확인하기로 했다.',
      '감독관은 네 후보에게 동일한 질문을 던졌다.',
      '"당신이 이 프로젝트의 PM이라면 Finance를 어떤 원칙으로 관리하시겠습니까?"',
      '네 명의 후보자 음성 답변을 모두 청취한 후 물음에 답하시오.'
    ].join('\n'),
    prompt: '다음 PM 후보들의 발언 중 PMBOK® Guide 8판의 Finance Performance Domain을 가장 잘못 이해하고 있어, 이 프로젝트에 투입해서는 안 될 후보는 누구인가?',
    evidence: {
      caption: 'EVIDENCE · PM 후보 답변 녹취 4',
      audioFirst: true, // 음성이 보기 그 자체다 → 오디오를 먼저 듣게 한다
      audios: [
        { src: ASSETS.questionAudio.q7_1, label: 'PM 후보 A' },
        { src: ASSETS.questionAudio.q7_2, label: 'PM 후보 B' },
        { src: ASSETS.questionAudio.q7_3, label: 'PM 후보 C' },
        { src: ASSETS.questionAudio.q7_4, label: 'PM 후보 D' }
      ]
    },
    choices: [
      'PM 후보 A',
      'PM 후보 B',
      'PM 후보 C',
      'PM 후보 D'
    ],
    en: {
      title: 'A 150 Billion Won Decision',
      brief: [
        'The company decided to launch a next-generation AI Mobility Platform project that would shape its future competitiveness.',
        'Total investment: 150 billion won. Because the project\'s success would weigh heavily on the company\'s growth, the executives treated selecting the PM as the single most important task.',
        'The Bureau therefore opened an urgent review to verify the decision-making capability of the PM candidates for this key strategic project.',
        'Given the scale of investment required, the review focused on their understanding of the Finance Performance Domain.',
        'The auditor put the same question to all four candidates:',
        '"If you were the PM of this project, on what principles would you manage finance?"',
        'Listen to all four recorded answers, then answer the question.'
      ].join('\n'),
      prompt: 'Among these PM candidates, who misunderstands the Finance Performance Domain of PMBOK® Guide 8th Edition most badly and must not be assigned to this project?',
      evidence: {
        caption: 'EVIDENCE · 4 PM candidate answer recordings',
        audioFirst: true,
        audios: [
          { src: ASSETS.questionAudio.q7_1_en, label: 'PM candidate A' },
          { src: ASSETS.questionAudio.q7_2_en, label: 'PM candidate B' },
          { src: ASSETS.questionAudio.q7_3_en, label: 'PM candidate C' },
          { src: ASSETS.questionAudio.q7_4_en, label: 'PM candidate D' }
        ]
      },
      choices: ['PM candidate A', 'PM candidate B', 'PM candidate C', 'PM candidate D']
    }
  },
  {
    id: 'case-008',
    stage: 2, // Stage 2 · Performance Domain (Stakeholders — 성공 기준 정렬)
    caseNo: 5,
    fileNo: '#008',
    title: '회의실에 남겨진 다섯 장의 메모',
    brief: [
      '차세대 Smart Mobility Platform 프로젝트는 회사의 핵심 전략 프로젝트였다.',
      '프로젝트는 계획된 일정과 예산 안에서 완료되었고, 계약된 기능과 품질 기준도 모두 충족하였다. 최종 Gate Review에서도 "Project Completed"로 승인되었다.',
      '그러나 프로젝트 종료 이후 실시된 Portfolio Review에서는 다음 안건이 모두 보류되었다.',
      '· Follow-up Investment\n· Additional Features\n· Service Expansion\n· Customer Rollout',
      '감사 결과 기술적 결함이나 프로젝트 관리 절차상의 문제는 발견되지 않았다. 조사 과정에서 프로젝트에 참여했던 주요 조직들은 모두 프로젝트가 성공적으로 완료되었다는 점에는 동의하였다.',
      '그러나 Portfolio Review 참석자들은 프로젝트 결과에 대해 서로 다른 해석을 제시한 것으로 확인되었다.',
      '경영진은 이러한 상황이 프로젝트 수행 과정과 어떤 관련이 있었는지 확인하기 위해 PM보호국에 조사를 의뢰하였다. PM보호국은 봉인된 회의실에서 발견된 다섯 장의 수기 메모를 확보하였다.'
    ].join('\n'),
    prompt: '메모의 내용을 종합적으로 검토할 때, PM보호국 감독관이 조사보고서에 기록할 결론으로 가장 적절한 것은 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 봉인된 회의실의 수기 메모 5',
      images: [
        { src: ASSETS.questions.q8_1, alt: '수기 메모 1 — PM 관점', label: '메모 1' },
        { src: ASSETS.questions.q8_2, alt: '수기 메모 2 — 개발팀 관점', label: '메모 2' },
        { src: ASSETS.questions.q8_3, alt: '수기 메모 3 — 고객 관점', label: '메모 3' },
        { src: ASSETS.questions.q8_4, alt: '수기 메모 4 — 운영조직 관점', label: '메모 4' },
        { src: ASSETS.questions.q8_5, alt: '수기 메모 5 — 사업부 관점', label: '메모 5' }
      ]
    },
    choices: [
      '프로젝트는 계획된 범위와 요구사항을 충실히 수행하였다. 향후 유사 프로젝트에서는 사업 환경 변화에 맞추어 제품 기능과 제공 범위를 주기적으로 재검토하는 관리 활동을 강화할 필요가 있다.',
      '프로젝트는 승인된 계획에 따라 안정적으로 수행되었다. 향후 유사 프로젝트에서는 프로젝트 운영 과정에서 각 조직이 프로젝트를 바라보는 관점과 판단 기준을 지속적으로 확인하고, 필요한 경우 프로젝트 운영과 주요 의사결정에 함께 반영하는 관리 활동을 강화할 필요가 있다.',
      '프로젝트는 계획된 산출물을 성공적으로 제공하였다. 향후 유사 프로젝트에서는 프로젝트 종료 이후의 활용성과 사업효과를 예측·관리할 수 있는 성과지표를 프로젝트 수행 기간부터 함께 운영할 필요가 있다.',
      '프로젝트는 승인 절차와 주요 의사결정을 계획에 따라 수행하였다. 향후 유사 프로젝트에서는 사업 전략과 조직 운영 방향을 반영하여 주요 관리기준과 의사결정 기준을 정기적으로 재검토하는 활동을 강화할 필요가 있다.'
    ],
    en: {
      title: 'Five Notes Left in the Meeting Room',
      brief: [
        'The next-generation Smart Mobility Platform project was a key strategic project for the company.',
        'It completed within the planned schedule and budget, and met every contracted feature and quality criterion. The final Gate Review approved it as "Project Completed".',
        'Yet at the Portfolio Review held after closure, all of the following items were put on hold.',
        '· Follow-up Investment\n· Additional Features\n· Service Expansion\n· Customer Rollout',
        'The audit found no technical defect and no flaw in the project management process. During the investigation every organization that had taken part agreed that the project had completed successfully.',
        'The Portfolio Review attendees, however, turned out to have offered conflicting interpretations of the project outcome.',
        'To understand how this related to the way the project had been run, the executives asked the Bureau to investigate. The Bureau secured five handwritten notes found in the sealed meeting room.'
      ].join('\n'),
      prompt: 'Taking the notes as a whole, which conclusion is the most appropriate for the Bureau auditor to record in the investigation report?',
      evidence: {
        caption: 'EVIDENCE · 5 handwritten notes from the sealed meeting room',
        images: [
          { src: ASSETS.questions.q8_1, alt: 'Handwritten note 1 — the PM\'s view', label: 'Note 1' },
          { src: ASSETS.questions.q8_2, alt: 'Handwritten note 2 — the dev team\'s view', label: 'Note 2' },
          { src: ASSETS.questions.q8_3, alt: 'Handwritten note 3 — the customer\'s view', label: 'Note 3' },
          { src: ASSETS.questions.q8_4, alt: 'Handwritten note 4 — the operations organization\'s view', label: 'Note 4' },
          { src: ASSETS.questions.q8_5, alt: 'Handwritten note 5 — the business unit\'s view', label: 'Note 5' }
        ]
      },
      choices: [
        'The project faithfully delivered the planned scope and requirements. Similar projects should strengthen the practice of periodically re-examining product features and delivery scope against changes in the business environment.',
        'The project ran steadily according to the approved plan. Similar projects should strengthen the practice of continuously checking how each organization views the project and what criteria it judges by, and of feeding that into project operation and key decisions where needed.',
        'The project successfully delivered the planned outputs. Similar projects should run performance indicators that forecast and manage post-closure adoption and business effect, starting during project execution.',
        'The project carried out its approval process and key decisions according to plan. Similar projects should strengthen the practice of periodically re-examining key management and decision criteria against business strategy and organizational direction.'
      ]
    }
  },
  {
    id: 'case-009',
    stage: 2, // Stage 2 · Performance Domain (Resources — 특정 개인 의존 구조)
    caseNo: 6,
    fileNo: '#009',
    title: 'PM을 무너뜨린 사람',
    brief: [
      '프로젝트명: AI Connected Mobility Platform',
      '참여 조직: 상품기획, 개발1, 개발2, AI, Cloud, 품질, 보안, UX, 해외법인, ODM · 참여 인원: 96명',
      '프로젝트는 양산 6주 전까지 일정, 품질 모두 정상으로 보고되었다.',
      '그러나 프로젝트 PM은 갑작스럽게 휴직계를 제출했다. PM의 책상에서는 메모 한 장이 발견되었다.',
      '"사람은 충분했다. 그런데도 항상 사람이 부족했다."',
      'PM보호국은 프로젝트 관계자 4명을 조사했다. 다음은 조사 과정에서 확보된 관계자 4명의 인터뷰 녹취다.',
      'PMBOK® Guide 8판의 Resource Performance Domain은 프로젝트 수행에 필요한 자원을 확보하는 것뿐 아니라, 자원이 효과적으로 활용되고 특정 개인에게 과도하게 의존하지 않는 운영 체계를 구축하는 것을 중요하게 본다.'
    ].join('\n'),
    prompt: '위 인터뷰를 종합적으로 검토할 때, PM이 지속적으로 과도한 업무를 떠안게 되는 환경을 만드는 데 가장 큰 영향을 준 인물은 누구인가?',
    evidence: {
      caption: 'EVIDENCE · 관계자 인터뷰 녹취 4',
      audioFirst: true, // 인터뷰 음성이 보기 그 자체다
      audios: [
        { src: ASSETS.questionAudio.q9_1, label: '인터뷰 A · 개발조직장' },
        { src: ASSETS.questionAudio.q9_2, label: '인터뷰 B · 사업부 임원' },
        { src: ASSETS.questionAudio.q9_3, label: '인터뷰 C · HR Resource Manager' },
        { src: ASSETS.questionAudio.q9_4, label: '인터뷰 D · Chief Architect' }
      ]
    },
    choices: [
      '개발조직장',
      '사업부 임원',
      'HR Resource Manager',
      'Chief Architect'
    ],
    en: {
      title: 'The Person Who Broke the PM',
      brief: [
        'Project: AI Connected Mobility Platform',
        'Participating organizations: product planning, Dev 1, Dev 2, AI, Cloud, quality, security, UX, overseas subsidiary, ODM · Headcount: 96',
        'Until six weeks before mass production, both schedule and quality were reported as normal.',
        'Then the project PM abruptly filed for leave of absence. A note was found on the PM\'s desk.',
        '"We had enough people. And yet we were always short of people."',
        'The Bureau interviewed four people connected to the project. The following are the interview recordings secured during that investigation.',
        'The Resource Performance Domain of PMBOK® Guide 8th Edition treats as important not only securing the resources a project needs, but also building an operating structure in which resources are used effectively and no single individual is depended on excessively.'
      ].join('\n'),
      prompt: 'Taking the interviews as a whole, who had the greatest influence in creating an environment where the PM continually absorbed excessive work?',
      evidence: {
        caption: 'EVIDENCE · 4 stakeholder interview recordings',
        audioFirst: true,
        audios: [
          { src: ASSETS.questionAudio.q9_1_en, label: 'Interview A · Development organization head' },
          { src: ASSETS.questionAudio.q9_2_en, label: 'Interview B · Business unit executive' },
          { src: ASSETS.questionAudio.q9_3_en, label: 'Interview C · HR Resource Manager' },
          { src: ASSETS.questionAudio.q9_4_en, label: 'Interview D · Chief Architect' }
        ]
      },
      choices: ['Development organization head', 'Business unit executive', 'HR Resource Manager', 'Chief Architect']
    }
  },
  {
    id: 'case-010',
    stage: 2, // Stage 2 · Performance Domain (Risk — 리스크를 의사결정으로 연결)
    caseNo: 7,
    fileNo: '#010',
    title: '회고 보고서',
    brief: [
      'PM보호국은 핵심 전략 프로젝트에 투입될 PM들의 프로젝트 회고 보고서(Closing Report)를 정기적으로 분석한다.',
      '감독관들은 회고를 단순한 프로젝트 기록이 아니라, PM이 프로젝트를 어떤 관점으로 운영하고 의사결정하는지를 보여주는 \'행동 패턴의 증거\'로 판단한다.',
      '최근 한 PM의 회고 보고서를 검토하던 중, 담당 감독관은 보고서 일부를 읽자마자 분석을 중단하고 즉시 「주의 대상 PM」으로 분류하였다.',
      '감독관의 메모에는 다음과 같은 내용만 남아 있었다.',
      '"이 PM이 다음 프로젝트를 맡는다면, 같은 유형의 리스크가 반복될 가능성이 높다."',
      'PM보호국은 해당 회고 보고서를 사건 파일로 등록하고, 다음 프로젝트에서 가장 우려되는 위험이 무엇인지 분석하기 시작했다.'
    ].join('\n'),
    prompt: 'PM보호국 감독관은 이 회고 보고서를 근거로 다음 프로젝트에서 가장 우려되는 리스크 관리상의 문제를 예측하였다. PMBOK® Guide 8판의 Risk Performance Domain 관점에서 가장 적절한 판단은 무엇인가?',
    evidence: {
      caption: 'EVIDENCE · 확보된 프로젝트 회고 보고서(발췌)',
      images: [
        { src: ASSETS.questions.q10, alt: '프로젝트 회고 보고서 발췌 — 운영 원칙, 진행 중 대응, 핵심 교훈' }
      ]
    },
    choices: [
      '프로젝트 진행 중 새롭게 발생하는 위험과 기회를 지속적으로 탐색하기보다, 최초에 식별한 리스크를 중심으로 관리할 가능성이 높다.',
      '리스크를 기록하고 대응하는 데는 충실하지만, 변화하는 리스크를 근거로 범위·일정·릴리즈·우선순위 등 프로젝트 계획을 적시에 조정하지 않을 가능성이 높다.',
      '실제 문제가 발생한 이후 대응하는 방식에 익숙하여, 선행 위험 신호를 활용한 예방 중심의 리스크 관리가 부족할 가능성이 높다.',
      '리스크를 공유하고 Risk Register를 관리하는 데 집중하여, 리스크의 중요도 변화와 잔여 리스크를 지속적으로 재평가하지 않을 가능성이 높다.'
    ],
    en: {
      title: 'The Retrospective Report',
      brief: [
        'The Bureau regularly analyses the project closing reports of PMs who may be assigned to key strategic projects.',
        'Auditors treat a retrospective not as a mere project record but as evidence of behavioural pattern — showing how a PM runs a project and makes decisions.',
        'While reviewing one PM\'s retrospective recently, the assigned auditor stopped the analysis partway through the report and immediately classified the PM as one "to watch".',
        'The auditor\'s memo contained only this:',
        '"If this PM takes the next project, the same type of risk is likely to repeat."',
        'The Bureau registered the retrospective as a case file and began analysing what is most concerning about the next project.'
      ].join('\n'),
      prompt: 'The Bureau auditor forecast the most concerning risk-management problem for the next project from this retrospective. Which judgment is the most appropriate from the standpoint of the Risk Performance Domain in PMBOK® Guide 8th Edition?',
      evidence: {
        caption: 'EVIDENCE · secured project retrospective report (excerpt)',
        images: [
          { src: ASSETS.questions.q10_en, alt: 'Project retrospective report excerpt — operating principles, in-flight response, key lessons' }
        ]
      },
      choices: [
        'Rather than continuously scanning for risks and opportunities that emerge during the project, the PM is likely to manage around the risks identified at the outset.',
        'The PM is diligent about recording and responding to risks, but is likely to fail to adjust the project plan — scope, schedule, release, priority — in time on the basis of changing risk.',
        'Being used to responding after a problem has actually occurred, the PM is likely to be weak at prevention-oriented risk management using leading risk signals.',
        'Focusing on sharing risks and maintaining the risk register, the PM is likely to fail to continuously re-assess shifts in risk significance and residual risk.'
      ]
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
        // 홍길동 PM의 성별은 사양에 없다 — 국문에 없는 정보를 영문이 만들지 않도록 중성 대명사를 쓴다.
        '"The PM tells us to make active use of AI… but do they really understand the AI principles PMBOK 8th Edition sets out?"',
        'The Bureau interviewed the project stakeholders and secured the following testimonies. All four aim to raise the project\'s productivity and quality with AI. But one of them contains a PM remark that misreads the AI adoption strategy of PMBOK® Guide 8th Edition, Appendix X3.1.1 (Strategies for AI Adoption).'
      ].join('\n'),
      // 국문 '가장 중요한 고려사항'에 없는 강조(single)를 넣지 않는다.
      prompt: 'Among the testimonies, whose account shows that the most important consideration in the PM\'s AI adoption strategy is missing?',
      evidence: {
        caption: 'EVIDENCE · recorded testimony of project participants',
        // 영문 증언 도착(2026-08-06) → 국문 음성 대신 _en 을 쓴다.
        audios: [
          { src: ASSETS.questionAudio.q11_en, label: 'Participant testimony recording' }
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
      // 영문판 단서 이미지 도착(2026-08-06) → 국문 이미지 대신 _en 을 쓴다.
      evidence: {
        caption: 'EVIDENCE · 4 secured clues',
        images: [
          { src: ASSETS.questions.q12_1_en, alt: 'Clue A', label: 'Clue A' },
          { src: ASSETS.questions.q12_2_en, alt: 'Clue B', label: 'Clue B' },
          { src: ASSETS.questions.q12_3_en, alt: 'Clue C', label: 'Clue C' },
          { src: ASSETS.questions.q12_4_en, alt: 'Clue D', label: 'Clue D' }
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
        // 영문 녹취 도착(2026-08-06) → 국문 음성 대신 _en 을 쓴다.
        audios: [
          { src: ASSETS.questionAudio.q14_1_en, label: 'PM Lee interview' },
          { src: ASSETS.questionAudio.q14_2_en, label: 'PM Choi interview' },
          { src: ASSETS.questionAudio.q14_3_en, label: 'PM Han interview' },
          { src: ASSETS.questionAudio.q14_4_en, label: 'PM Park interview' }
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
      // 영문판 로그 이미지 도착(2026-08-06) → 국문 이미지 대신 _en 을 쓴다.
      evidence: {
        caption: 'EVIDENCE · 4 recovered logs (partially damaged)',
        images: [
          { src: ASSETS.questions.q15_a_en, alt: 'Recovered log A', label: 'Log A' },
          { src: ASSETS.questions.q15_b_en, alt: 'Recovered log B', label: 'Log B' },
          { src: ASSETS.questions.q15_c_en, alt: 'Recovered log C', label: 'Log C' },
          { src: ASSETS.questions.q15_d_en, alt: 'Recovered log D', label: 'Log D' }
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


// ── i18n 리졸버 — 현재 로케일이 en이고 en 필드가 있으면 그것을, 없으면 ko(기본)를 돌려준다. ──
// evidence(이미지/오디오)는 로케일 공용이므로 항상 원본을 유지한다.
export function localizeCase (c) {
  if (getLocale() === 'en' && c.en) return { ...c, ...c.en, evidence: c.en.evidence || c.evidence }
  return c
}
