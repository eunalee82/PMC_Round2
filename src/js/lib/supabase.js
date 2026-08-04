// Supabase 클라이언트 — 단일 인스턴스 (CLAUDE.md §10).
// 키는 환경변수로만 주입한다: VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY (anon/publishable 키만).
// service_role 키는 브라우저·저장소에 절대 두지 않는다 — 시드 적용은 로컬에서만 한다.
//
// 백엔드 스위치: VITE_BACKEND=mock 이면 서버를 쓰지 않는다(행사 당일 비상 경로).
// env 가 비어 있으면 자동으로 mock 으로 떨어져 화면이 죽지 않는다.
// see docs/supabase-minimum-design.md §10 §12
import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const MODE = import.meta.env.VITE_BACKEND || 'supabase'

const configured = !!(URL && ANON_KEY)
const useServer = MODE !== 'mock' && configured

if (MODE !== 'mock' && !configured) {
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
    throw Object.assign(new Error(error.message || 'rpc_failed'), { code, fn, details: error })
  }
  return data
}
