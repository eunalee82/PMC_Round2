// 사건(문제) 데이터 — 본문·선택지·정답·해설은 **브라우저 번들에 없다** (보안: 문제 유출 방지).
//   · 구조 메타(CASES = id·stage·caseNo·fileNo·선택지 개수·multi)  → ./case-manifest.js (번들 포함, 비민감)
//   · 본문(제목·brief·prompt·evidence·choices, ko/en)             → 서버 public.cases + get_cases RPC (로케일 반영)
//   · 정답·해설                                                    → 서버 public.case_answers + submit_answer RPC
//
// LIVE(참가자): 게임 started + 팀 토큰이 있어야 get_cases 가 본문을 내려준다(미시작·미인증 차단).
// 개발/비상 mock: dev/cases-content.js(프로덕션 번들에서 제거됨)에서 읽는다 — import.meta.env.DEV 가드.
// 화면(case.js)은 예전처럼 localizeCase(사건)를 동기로 읽는다 — 단, 그 전에 loadCases()로 캐시를 채운다.
// see docs/handoff.md · docs/supabase-minimum-design.md · CLAUDE.md §11
import { CASE_MANIFEST } from './case-manifest.js'
import { isServerMode, rpc } from '../lib/supabase.js'
import { isSoloMode } from '../lib/mode.js'
import { getLocale } from '../lib/i18n.js'

// 라우팅·진행 판정(stage-progress·progress-mock)은 구조 메타만 있으면 된다 → 매니페스트를 그대로 CASES 로 노출.
export const CASES = CASE_MANIFEST

// 본문 캐시(로케일별). null = 아직 안 불러옴.
let contentById = null
let loadedLocale = null
let inflight = null

export function isCasesLoaded () { return contentById !== null && loadedLocale === getLocale() }

// 서버(또는 DEV mock)에서 현재 로케일 본문을 한 번 받아 캐시에 채운다. 멱등 — 같은 로케일이면 캐시를 돌려준다.
// 게임 시작 후 게임플레이 진입 시 case.js 가 딱 한 번 호출한다(스테이지 단위가 아니라 15건 일괄이지만
// 서버가 started+토큰일 때만 주므로 사전/미인증 유출은 없다).
export async function loadCases (teamId = null, token = null) {
  const locale = getLocale()
  if (contentById && loadedLocale === locale) return contentById
  if (inflight && loadedLocale === locale) return inflight
  loadedLocale = locale
  inflight = (async () => {
    const map = {}
    if (isServerMode()) {
      // 공개 연습 모드에는 팀 토큰도 게임 시작 상태도 없다 → 본문만 내려주는 전용 RPC 를 쓴다.
      // 정답·해설은 여기서도 나오지 않는다(채점은 lib/grade.js 의 check_answer). see 0015_practice_mode.sql
      const rows = isSoloMode()
        ? await rpc('get_cases_public', { p_locale: locale })
        : await rpc('get_cases', { p_team_id: teamId, p_token: token, p_locale: locale })
      for (const row of rows || []) map[row.case_id] = row.content
    } else if (import.meta.env.DEV) {
      // 비상/개발 경로 — 본문 사본은 DEV 전용 모듈에만 있고 프로덕션 번들에서 통째로 제거된다.
      const { CASES: FULL, localizeCase: loc } = await import('../dev/cases-content.js')
      for (const c of FULL) {
        const d = loc(c) // 로케일 반영(en 없으면 ko)
        map[c.id] = { title: d.title, brief: d.brief, prompt: d.prompt, evidence: d.evidence, choices: d.choices }
      }
    }
    // 프로덕션 mock(서버 없음 + DEV 아님)은 본문이 없다 — 운영 결정(수용). 화면은 로딩/안내로 처리.
    contentById = map
    return map
  })()
  return inflight
}

// i18n 리졸버 — 구조 메타(c)에 캐시된 본문을 얹는다. 본문은 이미 로케일이 반영된 상태로 캐시된다.
// loadCases() 전에 부르면 본문 없는 메타만 돌아온다 → 호출부(case.js)가 loadCases 뒤에 렌더한다.
export function localizeCase (c) {
  const content = (contentById && contentById[c.id]) || {}
  return { ...c, ...content }
}
