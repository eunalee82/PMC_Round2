// UI copy registry — all editable on-screen strings by key (CLAUDE.md §15 direction).
// Screens render via lib/copy.js `t(key)` / `copyEl(...)`; DEV edit-mode overrides live in localStorage.
// Keep keys stable; edit values freely.

const OATH_TEXT = `본인은 PM보호국 신입 수사관으로서
프로젝트의 Value를 최우선으로 판단하며,
왜곡된 실행과 잘못된 의사결정을 발견할 경우
PMBOK® 8th Edition의 원칙에 따라
사건을 공정하게 조사할 것을 서약합니다.`

export const COPY = {
  // SCR-001 Entry
  'entry.brandline': 'LG SW PM COMPETITION 2026',
  'entry.eyebrow': 'PROJECT MANAGEMENT PROTECTION BUREAU',
  'entry.title': 'PM보호국',
  'entry.subtitle': 'PMBOK® 8th Edition 기반 PM 역량 검증 크라임씬 게임',
  'entry.alert': '긴급 사건 접수 — 사무관 자격 시험 15문항',
  'entry.enter': 'PM보호국 입장',
  'entry.foot': 'PMB-OS · CLASSIFIED',

  // SCR-002 Opening
  'opening.skip': '건너뛰기',
  'opening.briefingStamp': 'PMB 브리핑',
  'opening.briefing1': '현대의 프로젝트는 기술이 아니라 잘못된 판단으로 실패한다.',
  'opening.briefing2': '그 실패를 만드는 존재를 PM보호국은 "빌런"이라 부른다.',
  'opening.briefing3': '신입 수사관이여, 15개의 사건을 해결하고 프로젝트의 가치를 지켜라.',
  'opening.fallbackRetry': '다시 재생',
  'opening.fallbackProceed': '팀 선택으로',

  // SCR-003 Team Selection
  'team.step': 'STEP 01 · 신입 수사관 등록',
  'team.title': '소속 팀을 선택하십시오',
  'team.lead': '수사관 정보를 확인하고 소속 팀을 선택한 후 사건 접수를 시작할 수 있습니다.',
  'team.start': '사건 접수 시작',

  // SCR-004 Oath
  'oath.step': 'STEP 02 · 기밀 유지 서약',
  'oath.title': 'PM보호국 기밀 유지 서약',
  'oath.text': OATH_TEXT,
  'oath.fieldLabel': '서명',
  'oath.agree': '위 서약 내용에 동의하며, 수사관으로서 성실히 임무를 수행하겠습니다.',
  'oath.submit': '서약 완료',

  // SCR-005 Waiting Room
  'waiting.eyebrow': '출동 대기실 · WAITING ROOM',
  'waiting.title': '수사관 등록이 완료되었습니다',
  'waiting.msg': 'PM보호국의 출동 명령을 기다리십시오.',
  'waiting.startTime': '관리자 시작 대기',
  'waiting.mission1': 'Stage 1 · Mindset',
  'waiting.mission2': 'Stage 2 · Performance Domain',
  'waiting.mission3': 'Stage 3 · AI Use Case',
  'waiting.pulse': '출동 명령 수신 대기 중…'
}
