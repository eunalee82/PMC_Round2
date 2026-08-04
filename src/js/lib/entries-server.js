// 팀 입장(점유) — 서버(Supabase) 구현. 설계: docs/supabase-minimum-design.md §3 §6.1
//
// 참가자는 로그인하지 않는다. 팀 소유는 **claim_token(uuid)** 으로 증명한다:
//   claim_team → 서버가 토큰 발급 → 이 기기 localStorage 에 보관 → 이후 쓰기 RPC 에 함께 보낸다.
//   다른 기기가 이메일을 증명해 인계(verify_and_transfer)하면 서버가 토큰을 재발급하므로
//   이전 기기의 토큰은 즉시 무효가 되고, 다음 RPC 에서 not_owner 로 걸러진다.
//
// 화면 계약(lib/entries.js 라우터가 유지):
//   동기 조회 — ownsTeam · teamStatus · getEntry · listEntries · getDeviceId · formatTime
//   비동기 쓰기 — claimTeam · transferTeam · releaseTeam   (team-selection.js 가 await)
//
// 다른 팀의 이메일은 절대 받아오지 않는다(anon 은 teams.member_emails 조회 불가).
// 내 팀 이메일은 (a) 이 기기가 입력한 값 (b) 인계 시 증명 후 서버가 돌려준 값만 보관한다.
import { supabase, rpc } from './supabase.js'
import { normalizeEmail } from '../utils/email.js'

const CLAIM_KEY = 'pmb.claim.v1' // { teamId, token, emails, enteredAt, flags }
const DEVICE_KEY = 'pmb.device.v1' // 기기 식별자 (세션 초기화로 지우지 않는다)
const SNAPSHOT_TTL_MS = 3000 // 팀 점유 현황 재조회 간격

// ── 로컬 클레임 (내 팀 + 토큰) ────────────────────────────────
function readClaim () {
  try {
    const v = JSON.parse(localStorage.getItem(CLAIM_KEY))
    return v && v.teamId && v.token ? v : null
  } catch { return null }
}
let claim = readClaim()
function persistClaim () {
  try {
    if (claim) localStorage.setItem(CLAIM_KEY, JSON.stringify(claim))
    else localStorage.removeItem(CLAIM_KEY)
  } catch { /* storage off — 메모리로 진행 */ }
}

const listeners = new Set()
function emit () { listeners.forEach((fn) => fn()) }
export function subscribe (fn) { listeners.add(fn); return () => listeners.delete(fn) }

export function getDeviceId () {
  let id = null
  try { id = localStorage.getItem(DEVICE_KEY) } catch { id = null }
  if (!id) {
    const rand = globalThis.crypto?.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
    id = 'dev-' + rand
    try { localStorage.setItem(DEVICE_KEY, id) } catch { /* ignore */ }
  }
  return id
}

export function getClaimToken (teamId) {
  return claim && claim.teamId === teamId ? claim.token : null
}

// 서버가 not_owner 를 돌려주면(= 다른 기기가 인계했거나 운영진이 해제) 이 기기의 클레임을 버린다.
// supabase.js 의 rpc() 가 이벤트를 던지고, flow.js 의 entries 구독이 팀 선택으로 되돌린다.
export function invalidateClaim () {
  if (!claim) return
  claim = null
  persistClaim()
  emit()
}
if (typeof window !== 'undefined') {
  window.addEventListener('pmb:not-owner', invalidateClaim)
}

// ── 팀 점유 현황 스냅샷 (anon 이 읽을 수 있는 컬럼만: id, entered_at) ──
let snapshot = new Map()
let snapAt = 0
let inflight = null

export async function refreshEntries () {
  if (!supabase) return snapshot
  const { data, error } = await supabase.from('teams').select('id,entered_at')
  if (error) { snapAt = Date.now(); return snapshot } // 실패해도 화면은 이전 값으로 계속 그린다
  const next = new Map()
  for (const row of data || []) next.set(row.id, row.entered_at ? Date.parse(row.entered_at) : null)
  let changed = next.size !== snapshot.size
  if (!changed) for (const [k, v] of next) if (snapshot.get(k) !== v) { changed = true; break }
  snapshot = next
  snapAt = Date.now()
  if (changed) emit()
  return snapshot
}

// 동기 조회 도중 스냅샷이 낡았으면 백그라운드로 새로 받아온다(받아오면 emit → 화면 재렌더).
function touch () {
  if (inflight || Date.now() - snapAt < SNAPSHOT_TTL_MS) return
  inflight = refreshEntries().finally(() => { inflight = null })
}

// ── 동기 조회 ────────────────────────────────────────────────
export function ownsTeam (teamId) {
  return !!(claim && claim.teamId === teamId && claim.token)
}

// 'open' 미입장 · 'mine' 이 기기가 점유 · 'taken' 다른 기기가 점유
export function teamStatus (teamId) {
  touch()
  if (ownsTeam(teamId)) return 'mine'
  return snapshot.get(teamId) ? 'taken' : 'open'
}

// 내 팀이면 이메일까지, 남의 팀이면 입장 시각만 (이메일은 서버에서 오지 않는다)
export function getEntry (teamId) {
  touch()
  if (ownsTeam(teamId)) {
    return {
      teamId,
      emails: claim.emails || [],
      deviceId: getDeviceId(),
      enteredAt: claim.enteredAt || null,
      flags: claim.flags || []
    }
  }
  const at = snapshot.get(teamId)
  return at ? { teamId, emails: [], deviceId: null, enteredAt: at, flags: [] } : null
}

export function listEntries () {
  touch()
  return [...snapshot.entries()].map(([teamId, at]) => ({ teamId, entry: at ? getEntry(teamId) : null }))
}
export function entryCount () { touch(); return [...snapshot.values()].filter(Boolean).length }

// 운영진 도구는 관리자 콘솔(팀 현황)에서 제공한다 — anon 은 이메일을 볼 수 없으므로 여기서는 비운다.
export function crossTeamDuplicates () { return new Map() }
export function entriesCsv () { return '' }

// ── 비동기 쓰기 ───────────────────────────────────────────────
// → { ok: true, entry } | { ok: false, reason: 'claimed'|'empty'|'duplicate'|'error' }
export async function claimTeam ({ teamId, emails, device = getDeviceId() }) {
  try {
    const data = await rpc('claim_team', {
      p_team_id: teamId,
      p_emails: emails,
      p_device_id: device,
      p_token: getClaimToken(teamId) // 같은 기기의 오타 수정이면 토큰으로 통과한다
    })
    claim = {
      teamId,
      token: data.token,
      emails: emails.map(normalizeEmail),
      enteredAt: data.entered_at ? Date.parse(data.entered_at) : Date.now(),
      flags: data.flags || []
    }
    persistClaim()
    await refreshEntries()
    return { ok: true, entry: getEntry(teamId) }
  } catch (err) {
    const map = { claimed: 'claimed', emails_required: 'empty', emails_duplicated: 'duplicate' }
    return { ok: false, reason: map[err.code] || 'error', error: err }
  }
}

// 인계 — 등록된 이메일 하나를 증명하면 서버가 토큰을 재발급하고 팀원 명단을 돌려준다(0006).
// → entry | null (null = 등록되지 않은 이메일 또는 통신 실패)
export async function transferTeam (teamId, device = getDeviceId(), email = '') {
  try {
    const data = await rpc('verify_and_transfer', {
      p_team_id: teamId, p_email: email, p_device_id: device
    })
    claim = {
      teamId,
      token: data.token,
      emails: Array.isArray(data.emails) ? data.emails : [],
      enteredAt: data.entered_at ? Date.parse(data.entered_at) : Date.now(),
      flags: Array.isArray(data.flags) ? data.flags : []
    }
    persistClaim()
    await refreshEntries()
    return getEntry(teamId)
  } catch {
    return null
  }
}

export async function releaseTeam (teamId) {
  const token = getClaimToken(teamId)
  if (!token) return false
  try {
    await rpc('release_team', { p_team_id: teamId, p_token: token })
    claim = null
    persistClaim()
    await refreshEntries()
    return true
  } catch {
    return false
  }
}

// mock 의 verifyMember(동기)는 서버 모드에서 쓰지 않는다 — 증명과 인계가 한 RPC 로 합쳐졌다.
// 화면은 transferTeam(teamId, device, email) 의 반환값(null 여부)으로 판정한다.
export function verifyMember () { return false }

export function releaseAll () { claim = null; persistClaim(); emit() }

function pad (n) { return String(n).padStart(2, '0') }
export function formatTime (ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
