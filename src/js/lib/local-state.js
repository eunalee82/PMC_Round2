// 참가자 기기의 로컬 상태 초기화.
//
// 왜: 행사장 PC 한 대를 여러 팀이 돌려 쓰면 같은 브라우저에 이전 팀의 세션·언어·진행 캐시가 남아,
// 다음 팀이 엉뚱한 화면(대기실·사건·종료 안내)에서 시작한다. 관리자가 시험을 초기화할 때
// 참가자 기기의 로컬 흔적도 함께 지워 달라는 운영 요청(2026-08-10).
//
// 방식: 'pmb.' 로 시작하는 키를 전부 지우고 KEEP 만 남긴다 — 새 저장 키가 생겨도 자동으로 포함된다.
// (반대로 화이트리스트 방식이면 키를 추가할 때마다 여기에 등록해야 하고, 빠뜨리면 조용히 남는다.)
const PREFIX = 'pmb.'

const KEEP = new Set([
  // 게임 상태(mock 백엔드)는 참가자 세션이 아니라 관리자 제어 대상이다 — 지우면 초기화 자체가 날아간다.
  'pmb.game.v2',
  // 기기 식별자 — 팀 점유/인계 판정의 기준값이라 유지한다(초기화로 새 기기가 되어선 안 된다).
  'pmb.device.v1',
  // DEV 메뉴 잠금 해제 — 리허설 편의(프로덕션 번들에는 DEV 메뉴가 없다).
  'pmb.dev.unlocked',
  // 플레이 모드(solo/event) — 지우면 행사용 기기가 다음 새로고침에 연습 모드로 떨어진다(lib/mode.js).
  'pmb.mode.v1'
])

// 지운 키 목록을 돌려준다(운영 중 원인 추적용 로그).
export function clearParticipantState () {
  let keys = []
  try { keys = Object.keys(localStorage) } catch { return [] } // 저장소 차단 브라우저 — 지울 것도 없다
  const removed = []
  for (const key of keys) {
    if (!key.startsWith(PREFIX) || KEEP.has(key)) continue
    try {
      localStorage.removeItem(key)
      removed.push(key)
    } catch { /* 개별 실패는 무시 — 나머지는 계속 지운다 */ }
  }
  return removed
}
