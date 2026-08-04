// 팀 입장(점유) — 백엔드 라우터. 화면은 이 파일만 import 한다.
//   VITE_BACKEND=supabase(기본) → entries-server.js (claim_token + RPC)
//   VITE_BACKEND=mock 또는 env 없음 → entries-mock.js (localStorage, 비상 경로)
//
// ⚠️ 서버 모드에서 claimTeam · transferTeam · releaseTeam 은 **비동기**다.
//    mock 도 같은 형태로 쓸 수 있게 Promise 로 감싸 반환한다 → 화면은 항상 await 하면 된다.
// see docs/supabase-minimum-design.md §10
import { isServerMode } from './supabase.js'
import * as mock from './entries-mock.js'
import * as server from './entries-server.js'

const impl = isServerMode() ? server : mock

// ── 동기 조회 ──
export function getDeviceId () { return impl.getDeviceId() }
export function getEntry (teamId) { return impl.getEntry(teamId) }
export function teamStatus (teamId, device) { return impl.teamStatus(teamId, device) }
export function ownsTeam (teamId, device) { return impl.ownsTeam(teamId, device) }
export function listEntries () { return impl.listEntries() }
export function entryCount () { return impl.entryCount() }
export function crossTeamDuplicates () { return impl.crossTeamDuplicates() }
export function entriesCsv () { return impl.entriesCsv() }
export function formatTime (ts) { return impl.formatTime(ts) }
export function subscribe (fn) { return impl.subscribe(fn) }

// 서버 모드에서만 의미가 있다(팀 점유 현황 재조회 · 토큰 조회).
export async function refreshEntries () { return impl.refreshEntries ? impl.refreshEntries() : null }
export function getClaimToken (teamId) { return impl.getClaimToken ? impl.getClaimToken(teamId) : null }

// ── 비동기 쓰기 (mock 도 Promise 로 감싸 계약을 통일) ──
export async function claimTeam (args) { return impl.claimTeam(args) }
export async function transferTeam (teamId, device, email) { return impl.transferTeam(teamId, device, email) }
export async function releaseTeam (teamId) { return impl.releaseTeam(teamId) }
export function releaseAll () { return impl.releaseAll() }

// mock 전용(동기 검증). 서버 모드에서는 transferTeam 이 증명까지 겸한다.
export function verifyMember (teamId, email) { return impl.verifyMember(teamId, email) }
