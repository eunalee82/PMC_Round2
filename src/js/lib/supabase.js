// Supabase 클라이언트 — 단일 인스턴스 (CLAUDE.md §10).
// 키는 환경변수로만 주입한다: VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY (anon/publishable 키만).
// service_role 키는 브라우저·저장소에 절대 두지 않는다 — 시드 적용은 로컬에서만 한다.
//
// 백엔드 스위치: VITE_BACKEND=mock 이면 서버를 쓰지 않는다(행사 당일 비상 경로).
// env 가 비어 있으면 자동으로 mock 으로 떨어져 화면이 죽지 않는다.
// see docs/supabase-minimum-design.md §10 §12
import { createClient } from '@supabase/supabase-js'

// import.meta.env 는 Vite 번들에서만 채워진다. Node 스크립트(scripts/validate.mjs 등)에서
// 이 모듈이 import 되어도 깨지지 않도록 방어한다 — 그 환경에서는 자동으로 mock 취급된다.
const ENV = import.meta.env || {}
const URL = ENV.VITE_SUPABASE_URL
const ANON_KEY = ENV.VITE_SUPABASE_ANON_KEY
const MODE = ENV.VITE_BACKEND || 'supabase'

const configured = !!(URL && ANON_KEY)
const useServer = MODE !== 'mock' && configured

if (MODE !== 'mock' && !configured && typeof window !== 'undefined') {
  // 조용히 죽는 대신 이유를 남긴다 — 운영 중 원인 파악이 빨라진다.
  console.warn('[supabase] env 없음 → mock 모드로 진행 (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 확인)')
}

export const supabase = useServer
  ? createClient(URL, ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }, // 관리자 로그인 유지
    realtime: { params: { eventsPerSecond: 2 } } // games.status 한 종류만 받는다
  })
  : null

export function isServerMode () { return useServer }

// RPC 공통 래퍼 — 실패를 일관된 에러로 바꾼다.
// 서버 예외 메시지(not_owner · already_submitted · game_ended …)를 err.code 로 올려서
// 호출부가 분기할 수 있게 한다. see 0001_init.sql
export async function rpc (fn, args = {}) {
  if (!supabase) throw Object.assign(new Error('no_backend'), { code: 'no_backend' })
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    const code = (error.message || '').trim().split(/\s+/)[0] || 'rpc_failed'
    // 토큰이 무효(다른 기기가 인계 / 운영진 해제)면 즉시 알린다 → lib/entries-server.js 가 클레임을 버리고
    // flow.js 의 구독이 팀 선택 화면으로 되돌린다. (순환 import 없이 느슨하게 연결)
    if (code === 'not_owner' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pmb:not-owner', { detail: { fn } }))
    }
    throw Object.assign(new Error(error.message || 'rpc_failed'), { code, fn, details: error })
  }
  return data
}
