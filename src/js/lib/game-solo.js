// 게임 상태 — 공개 연습 모드(solo). 관리자 제어도, 제한 시간도, 종료도 없다.
//
// 왜 별도 구현인가: 행사 모드의 게임 상태(scheduled → started → ended + ends_at)는 "여러 팀을
// 동시에 출발시키고 같은 시각에 끊는" 장치다. 아무 때나 들어와 혼자 푸는 연습에는 그 장치가
// 오히려 잠금으로 작동한다(대기실에서 관리자 Start 를 기다리게 된다).
// 그래서 solo 에서는 언제나 '진행 중'이고, 제출을 막는 시각 판정이 없다.
// 계약(lib/game.js 라우터가 부르는 함수 목록)은 mock/server 구현과 동일하게 맞춘다.

const NOOP = () => {}

export function getStatus () { return 'started' }
export function getStartedAt () { return null } // 기준 시각 없음 = 타이머 없음
export function isStarted () { return true }
export function isEnded () { return false }
export function isTimeUp () { return false }
export function remainingSeconds () { return 0 } // 화면은 타이머 자체를 감춘다(case.js)
export function subscribe () { return NOOP } // 상태가 변하지 않으므로 알릴 것도 없다

// 연결 상태 — 서버에 게임 상태를 물어보지 않으므로 '연결 중/끊김' 개념이 없다.
export function getConnection () { return 'practice' }
export function subscribeConnection () { return NOOP }

export async function initGame () { return null }
export function teardownGame () {}

// 관리자 액션 — 연습 모드에는 관리자가 없다. DEV 도구가 호출해도 조용히 무시한다.
export async function startGame () { return null }
export async function endGame () { return null }
export async function resetGame () { return null }
export async function extendGame () { return null }
