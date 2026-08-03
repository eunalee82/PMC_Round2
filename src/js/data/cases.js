// 사건(문제) 데이터 — MOCK. 화면에 내려가는 "사건"에는 정답이 없다 (CLAUDE.md §11).
// 정답·해설(SOLUTIONS)은 아래에 분리해 두었고, 서버 연결 시 questions 테이블 + 채점 RPC/Edge Function으로
// 이관한다 (CLAUDE.md §10, docs/game-flow.md §7.3). 그전까지는 lib/grade.js가 SOLUTIONS로 임시 채점한다.
// 용어: 코드에선 case/choice 등 중립어를 쓰되, 화면 출력은 게임 용어로 변환한다 (CLAUDE.md §15).
import { ASSETS } from '../constants/assets.js'

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
      type: 'image',
      src: ASSETS.questions.q1,
      alt: '사건 #007 현장에 남은 5가지 단서',
      caption: 'EVIDENCE · 현장 단서 5'
    },
    // 보기(단서) — 순서 = 화면 번호 1~5, 이미지의 단서 라벨과 일치.
    choices: [
      '단서 1: 프로젝트 일정 예측 대시보드',
      '단서 2: 변경 영향 분석서',
      '단서 3: 회의 안건',
      '단서 4: 프로젝트 운영 현황',
      '단서 5: 발생 시, 프로젝트 영향 분석'
    ]
  }
]

// ──────────────────────────────────────────────────────────────────────────
// ⚠️ 정답·해설 — 클라이언트 노출 금지 대상 (CLAUDE.md §11). 지금은 MOCK 채점용으로만 둔다.
//    서버 연결(Step 3) 시 이 블록을 삭제하고 채점 RPC/Edge Function으로 옮긴다.
//    answerIndex 는 choices 배열의 0-기준 인덱스다 (3 = 화면상 "4번").
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
    ].join('\n\n')
  }
}
