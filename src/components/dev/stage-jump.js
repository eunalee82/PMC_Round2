// DEV 전용 진행 앞당기기(fast-forward) — 뒤쪽 Stage나 종반부 화면을 바로 확인하기 위한 테스트 도구.
//
// ⚠️ 운영 코드에는 'Gate 건너뛰기'가 존재하지 않는다. 이 모듈은 DEV 메뉴(dev-menu.js)에서만 import되고,
//    DEV 메뉴는 main.js에서 `if (import.meta.env.DEV)` 안에서만 쓰이므로 프로덕션 빌드에서 통째로 제거된다.
//    화면·라우터·진행 판정 로직에는 테스트용 분기가 남아 있지 않다 — 이 도구는 '정상 진행 상태를 미리
//    만들어 두는' 방식으로만 동작한다(진행 판정을 우회하지 않는다).
import { recordSubmission, recordFinale } from '../../js/lib/progress.js'
import { stageCases } from '../../js/lib/stage-progress.js'
import { startGame, isStarted } from '../../js/lib/game.js'

// 게임이 시작돼 있어야 사건 화면에 들어갈 수 있다. mock 모드에서는 바로 시작되고,
// 서버 모드에서는 관리자 로그인이 필요하므로 실패 시 안내만 남긴다(?admin 에서 시작할 것).
function ensureStartedForDev () {
  if (isStarted()) return
  Promise.resolve(startGame()).catch(() => {
    console.warn('[dev] 게임 시작은 관리자 권한이 필요합니다 — ?admin 에서 로그인 후 [게임 시작]을 누르세요.')
  })
}

// 앞 스테이지들을 '전부 정답 제출' 상태로 채운다 → 점수·보상 슬롯까지 정상적으로 해제된다.
function clearStagesUpTo (teamId, lastStage) {
  for (let s = 1; s <= lastStage; s++) {
    for (const c of stageCases(s)) recordSubmission(teamId, c.id, s, true)
  }
}

// Stage N 브리핑부터 보기 — 앞 스테이지(1..N-1)를 완료 처리한다.
export function fastForwardToStage (teamId, stage) {
  ensureStartedForDev()
  clearStagesUpTo(teamId, stage - 1)
}

// 종반부 화면 확인 — 필요한 저장 지점까지 채운다. step: 'appoint' | 'raid' | 'ending'
export function fastForwardToFinale (teamId, step) {
  ensureStartedForDev()
  clearStagesUpTo(teamId, 3)
  if (step === 'appoint') return
  recordFinale(teamId, { appointedAt: Date.now() })
  if (step === 'raid') return
  // 금배지·마무리는 레이드 완료 이후 단계 — 그럴듯한 기여도를 채워 넣는다.
  recordFinale(teamId, { raidStartedAt: Date.now(), raidEndedAt: Date.now(), raidHits: 42, raidDamage: 63000 })
}
