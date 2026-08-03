// Base team roster (seed). 1 test team + 32 real teams, 3 members each.
// 팀별 비밀번호는 없다 — 입장은 팀원 3명의 이메일 등록으로 이루어진다 (lib/entries.js, SCR-003).
// This is the built-in default; DEV "팀 관리" edits are layered on top via lib/teams.js (localStorage).
// Replaced by teams from the server/admin later.

const PALETTE = ['#7c87ff', '#2cc7e6', '#37d089', '#e7b24c', '#f0555f', '#b98bff', '#4ea3ff', '#4ade80', '#ff8a52']

// 참가 팀 32개 (운영 확정). 순서 = 화면 표시 순서. 색상은 팔레트에서 순환 배정.
const TEAM_NAMES = [
  'Agentic Titans',
  'Automation Avengers',
  'B2B솔루션PMO즈의 마법사',
  'ESync PM',
  'ID롱챠',
  'IN:SIGHT',
  'KICA',
  'LG PM Reinventors',
  'LGEDV PM Explorer',
  'LG트리오',
  'MS WM Sphinx',
  'PM Sentinel',
  'PM Transformers',
  'PM장군',
  'Project Defence Force',
  'Project Secret Sauce',
  'QUALIPRO',
  'Simply. U+',
  'The Guardians',
  'Trivisions',
  'Value Guardians',
  'webOS Rangers',
  'webOS Titans',
  '가치수사대',
  '본선만 가자',
  '붉은대게진사갈비 (Red Crab Jinsa BBQ)',
  '산리오 퓨로랜드',
  '서바이브',
  '서태지',
  '스콥좀줄여조',
  '시너지엠파이어(Synergy Empire)',
  '프로젝트 파인다이닝'
]

function roster (names) {
  return names.map((name, i) => ({
    id: 'team' + String(i + 1).padStart(2, '0'),
    name,
    color: PALETTE[i % PALETTE.length],
    members: 3
  }))
}

// 게임 테스트용 입장 계정 — 이메일 등록을 건너뛰고 바로 입장된다 (team-selection.js: enterTest).
// test: true 인 팀은 카드 클릭 시 더미 수사관 3명으로 즉시 점유된다.
const TEST_TEAM = { id: 'team-test', name: '테스트', color: '#9aa4b2', members: 3, test: true }

export const BASE_TEAMS = [TEST_TEAM, ...roster(TEAM_NAMES)]
