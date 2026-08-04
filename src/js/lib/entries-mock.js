// Team entry (claim) registry — MOCK, backed by localStorage.
// A team is CLAIMED by the first device that registers its 3 member emails; another device can
// take it over only by proving one of those emails (배포 없는 자연 비밀번호 — 팀별 비번을 대체한다).
// Screens talk only to this module, never to storage: swapping in Supabase later means replacing
// this file's internals with `team_entries` + claim_team / verify_member / release_team RPC.
// see docs/screen-list.md SCR-003, CLAUDE.md §8 (팀 단위 진행·복구), §10 (서버 권위)
import { getTeams } from './teams.js'
import { normalizeEmail, isSuspect } from '../utils/email.js'

const KEY = 'pmb.entries.v1'
const DEVICE_KEY = 'pmb.device.v1'

function read () {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {}
  } catch { return {} }
}

let entries = read()

const listeners = new Set()
function emit () { listeners.forEach((fn) => fn()) }

function persist () {
  try { localStorage.setItem(KEY, JSON.stringify(entries)) } catch { /* storage off — run in-memory */ }
  emit()
}

// Other tabs/windows are the closest thing we have to "other devices" before Supabase lands,
// so every read re-syncs from storage instead of trusting the in-memory copy.
function refresh () { entries = read(); return entries }

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    entries = read()
    emit()
  })
}

export function subscribe (fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

let deviceId = null
export function getDeviceId () {
  if (deviceId) return deviceId
  try { deviceId = localStorage.getItem(DEVICE_KEY) } catch { deviceId = null }
  if (!deviceId) {
    const rand = globalThis.crypto?.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    deviceId = 'dev-' + rand
    try { localStorage.setItem(DEVICE_KEY, deviceId) } catch { /* ignore */ }
  }
  return deviceId
}

export function getEntry (teamId) {
  refresh()
  return entries[teamId] || null
}

export function listEntries () {
  refresh()
  return getTeams().map((team) => ({ team, entry: entries[team.id] || null }))
}

export function ownsTeam (teamId, device = getDeviceId()) {
  const entry = getEntry(teamId)
  return !!entry && entry.deviceId === device
}

// 'open' 미입장 · 'mine' 내 기기가 점유 · 'taken' 다른 기기가 점유
export function teamStatus (teamId, device = getDeviceId()) {
  const entry = getEntry(teamId)
  if (!entry) return 'open'
  return entry.deviceId === device ? 'mine' : 'taken'
}

// 기기당 1팀 — 팀을 바꿔 등록하면 이전 팀은 비워야 운영진 보드의 입장 수가 실제와 맞는다.
function releaseOtherTeams (device, keepTeamId) {
  for (const [id, entry] of Object.entries(entries)) {
    if (id !== keepTeamId && entry.deviceId === device) delete entries[id]
  }
}

// Create OR update (same device re-opening the modal to fix a typo).
// → { ok: true, entry } | { ok: false, reason: 'claimed', entry }
export function claimTeam ({ teamId, emails, device = getDeviceId() }) {
  refresh()
  const existing = entries[teamId]
  if (existing && existing.deviceId !== device) return { ok: false, reason: 'claimed', entry: existing }
  releaseOtherTeams(device, teamId)

  const normalized = emails.map(normalizeEmail)
  const entry = {
    teamId,
    emails: normalized,
    deviceId: device,
    enteredAt: existing?.enteredAt ?? Date.now(),
    updatedAt: Date.now(),
    flags: normalized.some(isSuspect) ? ['suspect'] : []
  }
  entries[teamId] = entry
  persist()
  return { ok: true, entry }
}

export function verifyMember (teamId, email) {
  const entry = getEntry(teamId)
  if (!entry) return false
  const value = normalizeEmail(email)
  return !!value && entry.emails.includes(value)
}

// 재입장 성공 → 점유 기기 인계. 이전 기기는 flow.assertClaim에서 팀 선택으로 되돌아간다.
export function transferTeam (teamId, device = getDeviceId()) {
  refresh()
  const entry = entries[teamId]
  if (!entry) return null
  releaseOtherTeams(device, teamId)
  entry.deviceId = device
  entry.transferredAt = Date.now()
  persist()
  return entry
}

export function releaseTeam (teamId) {
  refresh()
  if (!entries[teamId]) return false
  delete entries[teamId]
  persist()
  return true
}

export function releaseAll () {
  entries = {}
  persist()
}

// 같은 이메일이 2개 이상 팀에 등록 = 팀 오선택 신호 (운영진이 대기 시간에 정정)
// → Map<email, teamId[]>
export function crossTeamDuplicates () {
  refresh()
  const byEmail = new Map()
  for (const entry of Object.values(entries)) {
    for (const email of entry.emails) {
      if (!email) continue
      if (!byEmail.has(email)) byEmail.set(email, [])
      const teamIds = byEmail.get(email)
      if (!teamIds.includes(entry.teamId)) teamIds.push(entry.teamId)
    }
  }
  return new Map([...byEmail].filter(([, teamIds]) => teamIds.length > 1))
}

export function entryCount () {
  refresh()
  return Object.keys(entries).length
}

function pad (n) { return String(n).padStart(2, '0') }

export function formatTime (ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatStamp (ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function csvCell (value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// 결과 데이터 검수용 — 팀명 + 팀원 이메일 3개가 한 행에 남는다 (운영 측 요청).
export function entriesCsv () {
  const dupes = crossTeamDuplicates()
  const header = ['team_no', 'team_name', 'member1_email', 'member2_email', 'member3_email', 'entered_at', 'flags']
  const rows = getTeams().map((team, i) => {
    const entry = entries[team.id]
    const emails = entry?.emails || []
    const flags = [...(entry?.flags || [])]
    if (emails.some((e) => dupes.has(e))) flags.push('cross-team-duplicate')
    return [
      i + 1,
      team.name,
      emails[0] || '',
      emails[1] || '',
      emails[2] || '',
      formatStamp(entry?.enteredAt),
      flags.join(' ')
    ]
  })
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}
