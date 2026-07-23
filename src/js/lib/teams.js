// Team manager — effective team list = BASE_TEAMS unless DEV edits exist in localStorage.
// The DEV "팀 관리" UI calls add/update/remove; screens read via getTeams()/findTeam().
// exportTeams() dumps the current list to paste back into mocks/teams.js (or hand to the server later).
import { BASE_TEAMS } from '../mocks/teams.js'

const KEY = 'pmb.teams.v1'

function load () {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : null } catch { return null }
}
function persist () { try { localStorage.setItem(KEY, JSON.stringify(teams)) } catch { /* storage off */ } }

let teams = load() || BASE_TEAMS.map((t) => ({ ...t }))

export function getTeams () { return teams }
export function findTeam (id) { return teams.find((t) => t.id === id) || null }

export function addTeam (data = {}) {
  const id = 'team-' + Date.now().toString(36)
  teams.push({
    id,
    name: data.name || '새 팀',
    color: data.color || '#7c87ff',
    members: data.members ?? 3,
    pass: data.pass || ''
  })
  persist()
  return id
}

export function updateTeam (id, patch) {
  const team = teams.find((t) => t.id === id)
  if (team) { Object.assign(team, patch); persist() }
}

export function removeTeam (id) {
  teams = teams.filter((t) => t.id !== id)
  persist()
}

export function resetTeams () {
  teams = BASE_TEAMS.map((t) => ({ ...t }))
  persist()
}

export function exportTeams () { return JSON.stringify(teams, null, 2) }
