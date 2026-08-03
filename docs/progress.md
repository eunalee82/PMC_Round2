# 진행 기록 (Progress Log)

> 작업 단위로 "무엇을 왜 어떻게 했고, 무엇이 남았는지"를 누적 기록한다.
> 사양은 `screen-list.md` / `game-flow.md`가, 개발 규칙은 `CLAUDE.md`가 정본이다. 이 문서는 **인수인계용**이다.

---

## 2026-08-03 · 팀 입장 방식 개편 (팀별 비번 폐지 → 팀원 이메일 등록 + 팀 점유)

### 1. 구현 내용 요약

**배경.** 기존 SCR-003은 팀 카드를 누르면 팀별 비밀번호(`1001`~`1037`)를 물었다. 운영 검토에서 두 가지 문제가 지적됐다 — (a) 37개 팀에 비번을 배포·재배포하는 비용, (b) 결과 데이터에 팀명만 남아 참가자가 팀을 잘못 골랐는지 사후에도 확인할 수 없음.

**결정.** 팀별 비밀번호를 폐지하고 **팀 선택 + 팀원 3명 전체 이메일 등록 = 입장**으로 바꿨다. 이메일이 식별자·검수 자료·재입장 키를 겸하므로 배포할 비밀이 없다. 다만 이메일만으로는 오탭한 옆 팀이 남의 팀 진행을 덮어쓸 수 있어(팀 단위로 점수·진행이 쌓임 — `CLAUDE.md §8`) **팀 점유(claim) 잠금**과 **운영진 입장 현황 보드**를 함께 넣었다.

| 항목 | 확정 내용 |
|---|---|
| 팀 구성 | 3명 고정 — 등록 모달 3칸 모두 필수 |
| 입력 형식 | **전체 이메일**(도메인 포함). 참가자 도메인이 제각각이라 프리셋 불가, CSV에 `@` 포함 주소 필요 |
| 기기 | 팀당 1기기 · **기기당 1팀**(다른 팀으로 재등록하면 이전 팀 점유는 자동 해제) |
| 팀 내 중복 이메일 | **차단** — 3명 고정이므로 명백한 오류. `[입장]` 비활성 |
| 형식 의심 | **통과 허용** + `suspect` 플래그 (운영 원칙: 입력을 막지 않는다) |
| 이미 점유된 팀 | 등록된 3개 중 **하나를 입력하면 인계** — 배포가 필요 없는 자연 비밀번호 |

**구현된 동작**

1. **팀 카드 3상태** — 미입장(자물쇠 · `수사관 3명`) / 이 기기 점유(체크 · `등록 완료 · HH:MM`) / 다른 기기 점유(회색 · `입장 완료 · HH:MM`). 클릭 시 각각 등록 · 수정 · 재입장 모달.
2. **입력 정규화** — blur·붙여넣기 시점에 입력칸 값 자체를 정리한다(공백 전부 제거 → 전각 `＠`→`@` → 소문자 → 끝 `.,;` 제거 → `@` 뒤를 포함한 전체 주소 유지). 값을 바꿔치기하는 게 아니라 **사용자가 정리 결과를 눈으로 보게** 하는 것이 목적이다. 운영 측이 지적한 띄어쓰기 이슈가 이 단계에서 사라진다.
3. **검증 2단** — 빈칸·팀 내 중복만 `[입장]`을 막고, 형식 의심은 노란 경고 후 통과시키되 서버(현재는 로컬)에 `suspect` 플래그를 남긴다. 검수를 행사 후 CSV가 아니라 대기 시간으로 당기는 것이 설계 의도다.
4. **점유 잠금** — 첫 등록 기기가 팀을 점유한다. 다른 기기가 같은 팀을 누르면 입장 시각과 마스킹된 대표 이메일(`eu***@lge.com 외 2명`)을 보여주고, 등록된 이메일 하나를 요구한다. 통과 시 점유가 인계되고 **이전 기기는 다음 이동 시 팀 선택으로 되돌아간다**.
5. **입장 해제 실시간 반응** — 운영진이 해제하면 대기실에 가만히 있던 기기도 즉시 안내 모달을 받고 팀 선택으로 복귀한다(새로고침 불필요). `flow.js`가 `entries` 구독 + 매 `navigate`에서 점유를 재확인한다.
6. **운영진 보드**(DEV 메뉴 → `입장 현황`) — `입장 N / 37` 카운터, 전체·입장·미입장·확인 필요 필터, 팀별 이메일 3개, `[해제]`(오클릭 방지 2단 확인), `[전체 해제]`, CSV 복사.
7. **확인 필요 플래그 2종** — `형식 의심`(등록 시 판정), `타 팀 중복`(같은 이메일이 2개 이상 팀에 등록 = 팀 오선택 신호, 조회 시점에 전체 스캔으로 계산).
8. **접근 가드 강화** — 입장 성립 조건이 `teamId` 단독에서 `teamId + memberEmails.length === 3`으로 바뀌었다. 팀만 고르고 등록하지 않은 상태는 "미등록"으로 취급해 SCR-004 이후를 차단한다.
9. **CSV 컬럼** — `team_no, team_name, member1_email, member2_email, member3_email, entered_at, flags`. `@` 포함 전체 주소가 그대로 남는다(운영 요청).

### 2. 변경 파일 목록

**신규**

| 파일 | 역할 |
|---|---|
| `src/js/utils/email.js` | `normalizeEmail` / `checkEmails`(blocking·duplicates·suspects) / `maskEmail` |
| `src/js/lib/entries.js` | 팀 점유 저장소(mock=localStorage) + CSV. **서버 이관 격리 지점** |
| `src/components/dev/entry-monitor.js` | 입장 현황 보드 (정식 SCR-104의 프로토타입) |

**수정**

| 파일 | 변경 |
|---|---|
| `src/js/screens/participant/team-selection.js` | 비번 모달 → 등록/수정/재입장 3분기, 카드 점유 상태, 등록 수사관 칩, entries 구독 |
| `src/js/flow.js` | 세션에 `memberEmails`·`enteredAt` 추가, `DEFAULT`를 `defaults()` 팩토리로, `assertClaim()`, entries 구독, DEV 초기화 시 점유 해제 |
| `src/js/constants/flow.js` | `REQUIRED_MEMBERS`, `isRegistered()`, `resolveStep`이 등록 여부로 판정 |
| `src/js/constants/copy.js` | `team.register.*` / `team.claimed.*` / `team.released.*` / `oath.agents` 문구, `team.lead` 갱신 |
| `src/js/screens/participant/oath.js` | 등록 수사관 3명 칩 표시(팀 오선택을 알아차릴 마지막 지점) |
| `src/js/screens/participant/waiting-room.js` | 상태 카드에 `AGENTS REGISTERED` 라인 |
| `src/components/primitives/modal.js` | `actions` 버튼 핸들 반환 + `disabled` 초기값 지원 (`[입장]` 비활성 토글용) |
| `src/js/mocks/teams.js` · `src/js/lib/teams.js` | `pass` 필드 제거. 저장된 이전 값도 로드 시 떨궈냄 |
| `src/components/dev/team-manager.js` | 비번 칸 제거, 팀 삭제 시 입장 기록도 함께 정리 |
| `src/components/dev/dev-menu.js` | `입장 현황` 메뉴 추가 |
| `src/css/screens.css` | 카드 점유 상태, 이메일 칩, 등록 모달 행, 재입장 메타, 입장 현황 보드, 반응형 |
| `docs/screen-list.md` | SCR-003 전면 갱신, SCR-004 구성 요소, SCR-104 입장 보드·플래그 표, §9 접근 권한 주석 |
| `docs/implementation-plan.md` | §8.5 참가자 식별 **확정**으로 교체, §12 미결정 항목 2 해소·6 갱신 |
| `CLAUDE.md` | §10에 팀 입장 확정 규칙 + `team_entries` 엔터티 추가 |

**이 작업과 무관한 변경(다른 작업에서 넘어온 것 — 커밋 시 분리 필요)**
`.gitignore`, `docs/game-flow.md`, `docs/game-story.md`, `docs/assets-list.md`, `src/js/lib/audio.js`, `public/images/questions/`(미추적)

### 3. 실행 및 테스트 결과

**빌드** — `npm run build` 통과. 32 modules, `index.js` 30.73 kB (gzip 11.33 kB), `index.css` 40.41 kB (gzip 8.19 kB).

**로직 검증** — 이 환경에 브라우저 자동화가 없어 Node로 순수 로직을 돌렸다. **35개 항목 전부 통과, 실패 0.**

| 영역 | 확인한 것 |
|---|---|
| 정규화 (3) | `  Euna.Lee ＠LGE.com ` → `euna.lee@lge.com`, 끝 마침표 제거, 중간 공백 제거 |
| 검증 (7) | 같은 주소 ×3 → `duplicate` 차단 / 빈칸 → `empty` 차단 / `abc`·한글 → 차단 아님 + suspect / 정상 3개 통과 / 마스킹 |
| 점유 (5) | A가 점유 → A는 `mine`, B는 `taken`, B의 재점유 거부, 거부 후 원본 이메일 불변 |
| 재입장 (3) | 미등록 주소 거부 / 등록 주소는 대문자·공백 섞여도 통과 / 인계 후 소유권 이전 |
| 기기당 1팀 (2) | 다른 팀 재등록 시 이전 팀 해제, 입장 수 1 유지 |
| 타 팀 중복 (2) | 같은 이메일이 2팀에 등록되면 양쪽 탐지 |
| 플래그 (1) | `suspect` 저장 |
| CSV (5) | 헤더, 37행, 이메일 3개, `cross-team-duplicate`, `@` 유지 |
| 접근 가드 (5) | 3명 미만 → 미등록 / 미등록으로 서약 진입 → 팀 선택 / 미서약으로 대기실 → 서약 / 정상 통과 |
| 해제 (2) | 해제 후 `open`, 소유권 소멸 |

> ⚠️ 검증에 쓴 스크립트는 세션 스크래치패드의 임시 파일이라 리포에 남지 않았다. **리포에 테스트 하네스가 없다** — 다음 작업자가 필요하면 다시 작성해야 한다(`localStorage`/`window` 셰임 후 `utils/email.js`·`lib/entries.js`·`constants/flow.js`를 import하면 된다).

**미검증(브라우저 필요)** — 다음은 반드시 사람이 눈으로 확인해야 한다.

1. 세 칸에 같은 주소 → `[입장]` 비활성 + 빨간 경고
2. 시크릿 창에서 같은 팀 → 재입장 모달 → 틀린 주소 거부 / 등록 주소 통과
3. DEV `입장 현황` → `[해제]` → 원래 탭에 안내 모달 즉시 표시
4. 1366×768 · 태블릿 · 모바일에서 등록 모달 3칸, 입장 보드 6열이 잘리지 않는지
5. `prefers-reduced-motion`에서 모달 전환

### 4. 남은 문제

| # | 문제 | 영향 / 대응 |
|---|---|---|
| 1 | **기기 간 점유 잠금이 실제로는 미동작** | `entries.js`가 `localStorage`라 탭/시크릿 창까지만 격리된다. 행사에서 진짜로 막으려면 Supabase 연결이 선행돼야 한다. 현재 단계 목적은 UI·데이터 계약 확정 |
| 2 | **정식 어드민 화면 없음** | 입장 보드가 DEV 메뉴에만 있다(비번 `2026` 게이트). SCR-104로 옮겨야 운영진이 쓸 수 있다 |
| 3 | 브라우저 클릭 완주·반응형 미검증 | 위 5항목 수동 확인 필요 |
| 4 | **개인 단위 오타는 못 잡는다** | 형식이 맞는 오타(`euna.lee` → `euna.le`)는 통과한다. 잡히는 건 "팀 오선택"(타 팀 중복)뿐이다. 참가자 명단 파일이 있으면 대조 검증을 넣을 수 있다 |
| 5 | 팀 명단이 mock | 37팀 `1팀`~`37팀`. 운영 확정 명단(이름·색상)으로 교체 필요 |
| 6 | 재입장 문턱이 낮다 | 같은 회사 사람이면 팀원 이메일을 추측할 수 있다. 사내 행사라 리스크는 낮지만, 필요하면 **행사 공통 코드 1개**(팀별 아님, 슬라이드에 띄우면 끝)를 등록 모달 첫 칸에 추가하는 옵션이 있다 |
| 7 | 도메인 프리셋 미도입 | 도메인이 제각각이라 전체 주소를 직접 입력한다. 참가 회사 목록이 확정되면 `아이디 + 도메인 드롭다운`으로 바꿔 오타를 더 줄일 수 있다(데이터 구조 변경 없음) |
| 8 | `entryCount()` 미사용 export | SCR-102 "참가 팀 수" 카드용으로 남겨둔 것. 쓰지 않으면 제거 |
| 9 | 이전 `pass` 값이 저장소에 남아 있을 수 있음 | `lib/teams.js`가 로드 시 떨궈내므로 동작에는 영향 없다. 다음 `persist()` 시 정리된다 |

### 5. 다음 작업자가 알아야 할 내용

**서버 이관은 파일 하나만 건드린다.**
`src/js/lib/entries.js`가 격리 지점이다. 화면·플로우 코드는 이 모듈의 API만 부른다. 내부를 Supabase로 교체하면 나머지는 손댈 필요가 없다.

```
getDeviceId()                            claimTeam({ teamId, emails, device })  → {ok, entry} | {ok:false, reason:'claimed', entry}
getEntry(teamId) / listEntries()         verifyMember(teamId, email)            → boolean
teamStatus(teamId, device)               transferTeam(teamId, device)           → entry
  → 'open' | 'mine' | 'taken'            releaseTeam(teamId) / releaseAll()
ownsTeam(teamId, device)                 crossTeamDuplicates()  → Map<email, teamId[]>
subscribe(fn) → unsubscribe              entriesCsv() / entryCount() / formatTime(ts)
```

**제안 서버 스키마**

```
team_entries(team_id PK/UNIQUE, emails text[3], device_id text, entered_at, transferred_at, flags text[])
RPC (SECURITY DEFINER): claim_team / verify_member / transfer_team / release_team
RLS: 참가자는 자기 팀 로우만. verify_member는 이메일 목록을 노출하지 않고 boolean만 반환할 것
```

`claimTeam`은 **create와 same-device update를 겸한다**(모달을 다시 열어 오타를 고치는 경로). 서버에서도 같은 의미를 유지해야 한다. 그리고 `claimTeam`/`transferTeam`은 **같은 기기가 쥔 다른 팀을 먼저 해제**한다(기기당 1팀) — 이걸 빼면 운영진 보드의 입장 수가 실제와 어긋난다.

**localStorage 키**

| 키 | 내용 | 비고 |
|---|---|---|
| `pmb.session.v1` | 참가자 세션 (`step`, `teamId`, `memberEmails`, `enteredAt`, `signerName`, `pledgedAt`, `muted`) | `memberEmails`·`enteredAt`이 이번에 추가됨 |
| `pmb.device.v1` | 기기 식별자 | **세션 초기화로 지워지지 않는다**(의도적) |
| `pmb.entries.v1` | 팀 점유 기록 | 서버 이관 시 사라질 키 |
| `pmb.teams.v1` | DEV 팀 편집 결과 | |
| `pmb.copy.v1` | DEV 문구 편집 결과 | |

**점유 무효화 흐름을 깨지 않도록 주의.**
`flow.js`의 `assertClaim()`이 (a) 매 `navigate` 직전, (b) `entries` 구독 콜백에서 돈다. 점유가 사라졌으면 팀 관련 세션(`teamId`·`memberEmails`·`enteredAt`·`pledgedAt`)을 비우고 팀 선택으로 되돌린다. 팀 선택 화면에 있을 때는 카드가 알아서 풀리므로 안내 모달을 띄우지 않는다(`notify: false`). Stage 화면을 추가할 때도 이 경로를 통과하게 두어야 한다.

**접근 가드는 `isRegistered()` 하나로 판정한다.**
`constants/flow.js`의 `isRegistered(session)` = `teamId && memberEmails.length === REQUIRED_MEMBERS(3)`. `resolveStep`이 이걸로 SCR-004·005 진입을 막는다. Stage 라우트를 붙일 때 같은 함수를 재사용할 것. 팀 인원 정책이 바뀌면 `REQUIRED_MEMBERS`만 고치면 되지만, 등록 모달의 `MEMBER_COUNT`(`team-selection.js`)도 같이 맞춰야 한다 — **현재 두 곳에 3이 있다.**

**입력 정책은 운영 요구다. 임의로 조이지 말 것.**
"뭘 입력해도 넘어간다"가 운영 측 원칙이고, 여기서 유일한 예외가 빈칸과 팀 내 중복이다. 형식 검증을 차단으로 승격시키면 행사 현장에서 입장이 막힌다. 잡고 싶은 건 차단이 아니라 **플래그 + 운영진 보드**로 처리한다.

**문구는 전부 `constants/copy.js` 경유**(`CLAUDE.md §15`). 화면에 문자열을 직접 박지 말 것. 사용자 입력(이메일)은 반드시 `textContent`로만 렌더한다 — 등록 모달·칩·입장 보드 전부 그렇게 되어 있다.

**`modal.js`가 확장됐다.** `createModal(...)`이 `actions`(footer 버튼 핸들 배열)를 반환하고 `actions[].disabled` 초기값을 받는다. `[입장]` 버튼을 검증 결과에 따라 비활성화하기 위한 것으로, 다른 모달에도 쓸 수 있다.

**미해결 결정 2건**(운영 확인 필요) — ⑥ 행사 공통 코드 추가 여부, ⑦ 도메인 드롭다운 도입 여부. 둘 다 지금 구조에서 데이터 변경 없이 얹을 수 있다.

**커밋 상태** — 이 작업은 커밋되지 않았다. 위 "무관한 변경" 목록을 분리해서 커밋할 것.
