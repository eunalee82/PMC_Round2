// Base team roster (seed). 37 teams, 3 members each, per-team password.
// This is the built-in default; DEV "팀 관리" edits are layered on top via lib/teams.js (localStorage).
// Replaced by teams from the server/admin later.

const PALETTE = ['#7c87ff', '#2cc7e6', '#37d089', '#e7b24c', '#f0555f', '#b98bff', '#4ea3ff', '#4ade80', '#ff8a52']

function seed (n) {
  const list = []
  for (let i = 1; i <= n; i++) {
    list.push({
      id: 'team' + String(i).padStart(2, '0'),
      name: i + '팀',
      color: PALETTE[(i - 1) % PALETTE.length],
      members: 3,
      pass: String(1000 + i) // 1001 … 1037 (mock; edit in DEV 팀 관리)
    })
  }
  return list
}

export const BASE_TEAMS = seed(37)
