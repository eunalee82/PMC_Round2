# 세션 핸드오프 (최신: 2026-08-06)

새 창(새 세션)에서 이어서 작업하기 위한 인수인계 기록. **먼저 `CLAUDE.md`와 이 문서를 읽고 시작할 것.**

> **다른 환경에서 이어받는 사람은 §10 부터 읽으면 된다.** 오늘(2026-08-06) 무엇을 했고 무엇이 남았는지가 거기 있다.
>
> **현재 상태(2026-08-06 마감)**: 프로덕션 배포 완료(`https://pmc-round2.vercel.app`) · **마이그레이션 0009·0010·0011·0003 전부 적용 완료** · 커밋·push 완료.
> 남은 것은 **브라우저 실측**(§10.2)이며, 유일한 미해결 버그는 **Final Raid BGM 미재생**이다.
> 서버 상태는 언제든 `node scripts/check-migrations.mjs` 로 확인한다.

---

## 0. 지금 당장 알아야 할 것 (TL;DR)

- **전체 흐름이 끝까지 연결됐다** (2026-08-04): Entry → … → Stage 1 → Stage 2(임시) → Stage 3 → **감독관 임명 → 긴급 경보 → Final Raid(20초) → 빌런왕 격퇴 → 금배지 수여 → [예선 2라운드 끝내기] → 종료 안내**. 참가자 화면은 여기서 끝난다.
- **최종 랭킹은 감독관(운영진) 전용이다** (운영 결정 2026-08-04): 참가자 흐름에서 빠지고 **관리자 콘솔 `?admin`의 [최종 랭킹 발표]** 로 옮겼다(`src/js/screens/admin/ranking.js`). 참가자 종료 안내 화면에는 순위를 띄우지 않고 "감독관의 발표를 기다려 주십시오"만 표시한다.
- **Stage 2는 임시(Mock) 콘텐츠다.** 7사건이 `src/js/data/cases.js`의 `⏳ STAGE 2 · 임시 데이터` 블록에 있고, 화면에 **`임시 데이터` 배지**가 붙는다. 확정되면 그 블록 + `SOLUTIONS`의 같은 구간만 교체하면 된다(엔진·구조 변경 불필요). 자세한 규칙은 블록 상단 주석.
- **검증 스크립트**: `npm run validate` — 사건 id/정답 인덱스/보기 수, ko·en 정합, 단서 이미지·오디오 실제 파일 존재, UI 문구 키 누락을 한 번에 점검한다. 현재 **오류 0** (경고 1건 = Stage 2 임시 데이터 알림).
- **Supabase는 여전히 미연결**(MOCK localStorage). 멀티 기기 진행은 아직 안 된다 — §5 참고.
- **배포/실행**: 라이브 `https://pmc-round2.vercel.app`, 관리자 `?admin`(비번 `2026`), 로컬 `npm run dev`(+`npm run build`, `npm run validate`). Vercel 계정 `pingjueuna-3402`, 프로젝트 `pmc-round2`(CLI 배포, GitHub 자동배포 미연결). **push/deploy는 지시가 있을 때만.**

---

## 1. 완료된 작업 (커밋 순)

- `044e4da` 문제 엔진 초기 · 32팀 로스터 · 관리자 시작(mock) · 캡처 억제
- `9758a7f` 좌측 패널 점수·랭킹 실시간 반영 · 60분 미션 타이머 · EVIDENCE 해제 규칙
- `533b43a` 프로덕션 접근용 관리자 콘솔 `?admin` (게임 시작/초기화)
- `c56b77c` Stage 1 완성(#014·#021) · 다중 사건 엔진 · 오디오 단서/소리 조절
- `06ee0cf` Stage 1 전체 흐름(Briefing→결과→아이템→Stage2 Briefing) · i18n 기반 — **← 현재 라이브**
- `d0ddc00` 영문 번역(copy.js en + cases.js en + 하드코딩 문구 이관) · 입장 화면 국문/영문 선택 · 오프닝 YouTube 임베드 · 단서 이미지 높이 제한 — **로컬만(미push/미배포)**

### 구현된 기능 요약
- **팀**: `src/js/mocks/teams.js` — 테스트 팀 1 + 32개 실팀. 입장 = 팀 선택 + 수사관 3명 이메일 등록(비번 없음). 테스트 팀(`test:true`)은 이메일 없이 즉시 입장.
- **문제 엔진**: `src/js/screens/gameplay/case.js` — Stage 컨트롤러. Briefing(SCR-007) → Case(SCR-008)+제출확인(SCR-009) → 결과/해설(SCR-010/011) → 마지막이면 Stage Result(SCR-012) → Item Acquisition(SCR-013, 갑질 미러 방패) → 다음 Stage Briefing. 데이터 기반(사건별 전용 로직 없음), 새로고침 복구(첫 미제출 사건/브리핑), 중복 제출 방지.
- **사건 데이터**: `src/js/data/cases.js` — CASES(본문, 정답 없음) + SOLUTIONS(정답·해설, `answerIndex` 0-기준) + `localizeCase`/`localizeAnalysis`(en 리졸버). 전부 국문·영문 완비.

  | Stage | 사건 | 단서 | 보기 | 정답 | 주제 |
  |---|---|---|---|---|---|
  | 1 (3/3 ✅) | #007 | 이미지 1 | 5 | 4 | Proactive Mindset |
  | | #014 | 이미지 4 | 4 | 3 | Value-Driven Mindset |
  | | #021 | 이미지 1 + 녹취 4 | 4 | 4 | Accountability·Empowered |
  | 2 (7/7 ⏳임시) | #T04 | 텍스트(개요) | 4 | 2 | Governance · 편익 실현 |
  | | #T05 | 텍스트 | 4 | 2 | Financial · EVM/CPI/SPI |
  | | #T06 | 텍스트 | 4 | 3 | Scope · Scope Creep |
  | | #T07 | 텍스트 | 4 | 3 | Stakeholders · Single Source of Truth |
  | | #T08 | 텍스트 | 4 | 1 | Risk · SPOF·상시 갱신 |
  | | #T09 | 텍스트 | 4 | 2 | Schedule · 진척률 과장 |
  | | #T10 | 텍스트 | 4 | 3 | Resources · 단일 공급사·과부하 |
  | 3 (5/5 ✅) | #011 | 녹취 1 | 4 | 4 | Strategies for AI Adoption |
  | | #012 | 이미지 4 | 4 | 2 | AI 도입의 장기적 영향·실행 가능성 |
  | | #013 | 이미지 1 | 4(설명형) | 4 | Early Warning Signals |
  | | #014 | 녹취 4 | 4 | 2 | Risk Identification & Assessment |
  | | #015 | 이미지 4 | 4 | 2 | Multi-Criteria Decision Analysis |

  - ⚠️ **사건 파일 번호 #014가 Stage 1·3에 중복**. id는 `case-014` / `case-s3-014`로 분리했다(id는 제출·중복방지·점수 키라 유일해야 한다). 화면 표시 번호까지 구분하려면 `fileNo`를 바꾸면 된다.
  - **보기 형식**: 문자열 또는 `{ label, desc }`(#013처럼 'PMBOK 용어 + 설명' 두 단). `question-choice.js`가 둘 다 처리.
  - **Stage 2 임시 사건 규칙**: `placeholder: true`면 화면에 `임시 데이터` 배지가 붙는다(`case.js`가 이 필드만 본다 — 플래그를 지우면 배지도 사라진다). 단서 미디어는 없고 텍스트 단서를 사건 개요에 담았다. `fileNo`(`#T04`~`#T10`)도 임시 번호다.
  - **진행 앞당기기(DEV)**: DEV 메뉴 `사건 · Stage 1/2/3` / `감독관 임명` / `Final Raid` / `금배지 · 마무리`. 구현은 `src/components/dev/stage-jump.js`이며 **앞 단계를 정상 완료 처리하는 방식**이라 운영 로직에 건너뛰기 분기가 남지 않는다(프로덕션 빌드에서 DEV 코드는 통째로 제거됨 — `dist` JS에 `fastForward`·`devmenu` 문자열 0건 확인).
- **보상 아이템(SCR-013)**: `src/js/constants/stages.js`의 `STAGE_META[n].item`이 단일 출처(임명·레이드·랭킹 화면이 같은 표를 읽는다) — Stage 1 갑질 미러 방패(RARE·빌런 공격 반사) / Stage 2 리소스 무제한 승인서(EPIC·궁극기) / Stage 3 **배째 마스터**(LEGEND SKILL·최종 강력 스킬). 화면에 금색 효과 배지 표시, 다음 단계 라벨은 `item.nextKey`로 데이터화.
  - Stage 3 보상은 `docs/game-flow.md §10.3`에 맞춰 `AI Judgment Core` → **`배째 마스터`(Legend Skill)** 로 교체했고 아이콘도 스킬용 번개로 바꿨다. Stage 2 희귀도는 **`EPIC ITEM`으로 확정**(2026-08-04) — RARE → EPIC → LEGEND SKILL 로 등급이 오르는 진행감을 택했고, `docs/game-flow.md §9.3`·`screen-list.md SCR-013`·`game-story.md`의 표기도 Epic Item으로 맞췄다.
  - **Stage 3 이후 흐름 구현 완료** → 아래 §6 참고.
- **채점**: `src/js/lib/grade.js` (MOCK, 서버 이관 대상).
- **진행/점수**: `src/js/lib/progress.js` (MOCK, localStorage). 정답수·제출수(스테이지별)·점수·마지막 제출 시각. 랭킹: 점수 내림차순, 동점 시 제출 빠른 순. EVIDENCE 아이템 = 스테이지 전체 제출 시 해제.
- **게임 상태**: `src/js/lib/game.js` (MOCK, localStorage). `scheduled|started` + `startedAt`. `startGame/resetGame/ensureStarted`, `remainingSeconds`. 대기실이 구독 → started면 자동 전환.
- **셸/좌측 패널**: `src/components/shell/{app-shell,app-header,left-sidebar}.js`. 게임플레이만 셸 사용. 헤더: 미션 타이머 + 소리 볼륨/음소거 팝오버. (종·설정 아이콘 제거됨)
- **제한 시간 = 80분**(운영 결정 2026-08-06, 이전 60분). 값이 **세 곳**에 있다 — 서버 `games.duration_minutes`(권위 · `0010_duration_80min.sql`) · `lib/game-mock.js` `DURATION_MS` · `lib/game-server.js` 조회 전 기본값. 항상 같이 고친다.
- **캡처 억제**: `src/components/game/capture-guard.js` — 워터마크(팀명·시각) + 전체화면 게이트(벗어나면 가림) + 복사/우클릭 차단 + PrtScn 경고. (원천 차단 아님, 억제 수준)
- **관리자**: `src/js/screens/admin/admin.js` — `?admin` 진입, 비번 `2026`, 게임 시작/대기 되돌리기. ⚠️ mock이라 **같은 브라우저 탭 사이에서만** 전파(다른 기기 X → Supabase 필요).
- **i18n**: `src/js/lib/i18n.js`(로케일 ko/en) + `constants/copy.js`(`COPY={ko,en}`, en 없으면 ko 폴백) + `lib/copy.js`(로케일 대응 t). 전환: `?lang=en` / 입장 화면 국문·영문 선택 / DEV 언어 토글(reload).
- **오프닝**: `src/js/screens/participant/opening.js` — 로컬 영상 대신 **YouTube 임베드**(`ASSETS.videos.openingEmbedId`). 영상 교체는 이 상수만 바꾼다 — 2026-08-06 현재 `BLitSGtLXHY`.

---

## 2. 핵심 파일 지도

| 목적 | 파일 |
|---|---|
| 사건 본문·정답·해설(콘텐츠 편집) | `src/js/data/cases.js` (미디어 경로는 `src/js/constants/assets.js`) |
| Stage 메타·보상 아이템 메타 | `src/js/constants/stages.js` |
| Stage 완료 판정(라우터·화면 공용) | `src/js/lib/stage-progress.js` |
| Stage 게임플레이 흐름 | `src/js/screens/gameplay/case.js` |
| 감독관 임명(SCR-015) | `src/js/screens/finale/appointment.js` |
| 긴급 경보·레이드·격퇴(SCR-016~019) | `src/js/screens/finale/raid.js` |
| 금배지 수여 · 종료 안내(SCR-020/023) | `src/js/screens/finale/ending.js` |
| 최종 랭킹(SCR-022) — **감독관 전용** | `src/js/screens/admin/ranking.js` (관리자 콘솔에서 호출) |
| 종반부 CSS | `src/css/finale.css` |
| 콘텐츠·문구 검증 스크립트 | `scripts/validate.mjs` (`npm run validate`) |
| DEV 진행 앞당기기(테스트 전용) | `src/components/dev/stage-jump.js` |
| 단서 뷰어(이미지 갤러리+오디오) | `src/components/game/evidence-viewer.js` |
| 5지선다 | `src/components/game/question-choice.js` |
| 점수/진행 | `src/js/lib/progress.js` · 채점 `src/js/lib/grade.js` |
| 게임 상태/타이머 | `src/js/lib/game.js` |
| 좌측 패널 | `src/components/shell/left-sidebar.js` |
| UI 문구(ko/en) | `src/js/constants/copy.js` · 해석기 `src/js/lib/copy.js` · 로케일 `src/js/lib/i18n.js` |
| 게임플레이 CSS | `src/css/gameplay.css` / 레이아웃 `src/css/layout.css` / 입장흐름 `src/css/screens.css` |
| 부트스트랩(라우팅·?admin·?lang) | `src/main.js` · 흐름 `src/js/flow.js` |

---

## 3. ✅ 해결됨 — Stage 1 "보기 안 보임" (2026-08-04)

**실제 원인은 CSS가 아니었다.** `src/js/screens/gameplay/case.js`의 `mountView()`가 **방금 조립한 컴포넌트를 destroy**하고 있었다.

```js
// (버그) 한 배열만 사용
const trackView = (c) => { viewParts.push(c); return c }
function mountView (node) { clearView(); caseHost.replaceChildren(node); ... }
```

`showCase()`는 `mountView()`를 부르기 **전에** `trackView(evidence)`, `trackView(choice)`, `trackView(submitBtn)`으로 새 컴포넌트를 `viewParts`에 넣는다. 그래서 `mountView` 안의 `clearView()`가 **이전 화면이 아니라 지금 마운트할 화면**의 컴포넌트를 destroy했고, `evidence-viewer`/`question-choice`/`button`의 `destroy()`는 모두 `el.remove()`를 호출하므로 단서 뷰어·보기·제출 버튼이 DOM에서 빠진 채로 마운트됐다. 남는 것은 `case__head`·`case__brief`·`case__prompt`·`case-result`뿐.

**수정**: 조립 중 컴포넌트는 `nextParts`에 모으고, `mountView`가 이전 `viewParts`만 정리한 뒤 `nextParts`를 승격한다. 이미 마운트된 화면에 덧붙는 결과 화면의 `nextBtn`은 `trackMounted()`로 현재 목록에 넣는다.

**영향 범위(중요)**: 이 회귀는 `06ee0cf`(= 현재 라이브)에서 다중 화면 컨트롤러로 리팩터링할 때 유입됐다. 따라서 #014만이 아니라 **모든 사건 화면 + Briefing 시작 버튼 + Stage Result/Item 버튼까지** 같은 증상이었다. `c56b77c`(Q1 정상 확인 시점)에는 `viewParts`가 없었다.

**검증(브라우저, 로컬 dev)**: Stage 1 Briefing → #007(보기 5) → #014(이미지 4장·보기 4) → #021(보기 4·녹취 4) → Stage Result → Item(갑질 미러 방패) → Stage 2 Briefing까지 각 화면의 단서·보기·버튼 렌더 확인. `npm run build` 통과.

### ✅ 함께 고친 버그 (P0) — 게임플레이 중 새로고침 시 Entry Gate로 튕김

`src/js/constants/flow.js`의 `resolveStep()`이 `FLOW_ORDER`(entry~waiting)에 없는 step을 무조건 `FLOW.ENTRY`로 되돌리고 있었다. `FLOW.CASE`는 `FLOW_ORDER` 밖이므로 사건 화면에서 새로고침하면 `flow.start() → navigate('case') → resolveStep → 'entry'`로 처음 화면까지 돌아갔다(CLAUDE.md §2 재진입 원칙 위반 · 행사 중 치명적).

**수정**: `resolveStep(step, session, { gameStarted })`에 `FLOW.CASE` 분기를 추가 — 등록·서약·게임 시작을 확인하고 조건 미달이면 알맞은 이전 화면으로 보낸다. `gameStarted`는 `flow.js`가 `lib/game.js`의 `isStarted()`로 읽어 넘긴다(`constants/`가 상태 모듈을 import하지 않도록).

검증(새로고침 4케이스): started+등록+서약 → 사건 화면(#014, 진행 위치 복구) / 관리자가 대기로 되돌림(scheduled) → 대기실 / 서약 없음 → 서약 / 팀 미등록 → 팀 선택.

---

## 4. 실행 / 배포 / 운영

- **로컬**: `npm run dev` (Vite). `npm run build`로 빌드 검증, `npm run validate`로 콘텐츠·문구 검증.
- **DEV 메뉴**: 우하단 `DEV` 버튼, 비번 `2026`. JUMP TO SCREEN / GAMEPLAY(게임 시작·대기 되돌리기·사건 점프) / **FINALE(감독관 임명·Final Raid·금배지·마무리)** / 팀·입장 관리 / COPY·LANG(언어 토글). ※ 프로덕션 빌드에서는 DEV 메뉴 제거됨 → 프로덕션 관리자 제어는 `?admin`.
- **관리자 콘솔**: `?admin` + 비번 `2026`. 게임 시작 / **최종 랭킹 발표**(전체 화면, [관리자 콘솔로]로 복귀) / 대기 상태로 되돌리기(진행 초기화).
- **혼자 테스트**: 한 탭에서 참가자(대기실까지), 다른 탭 `?admin`에서 게임 시작 → 참가자 탭 자동 전환.
- **배포**: `npx vercel --prod --yes` (계정 `pingjueuna-3402`, 프로젝트 `pmc-round2`). GitHub 자동배포 미연결 → 코드 반영하려면 CLI 재배포 또는 Vercel에서 Git 연결.
- **언어**: `?lang=en` 또는 입장 화면 국문/영문 선택. en 미번역 키는 ko 폴백.

---

## 5. 알려진 한계 / 다음 후보

- **멀티 기기 미지원(중요)**: game/progress/entries가 전부 localStorage. 관리자 시작·점수·랭킹이 **다른 기기로 전파 안 됨**. 실제 행사(32팀 각자 기기)엔 **Supabase 연동(Step 3: 상태 테이블 + Realtime + 서버 채점) 필수.** 종반부 저장 지점(`progress.finale`)도 같이 서버로 옮긴다.
- **Stage 2 콘텐츠 미확정**: 임시 7사건으로 흐름만 연결돼 있다(§1 표). 확정 시 `cases.js`의 임시 블록 + `SOLUTIONS` 임시 구간만 교체.
- **엔딩 영상 없음**: `/videos/ending.mp4` 미제작 → `ASSETS.videos.endingAvailable = false`로 두어 요청조차 하지 않고 대체 연출(전체 캐릭터 + 국장 메시지 + 금배지)로 진행한다. 영상이 오면 파일을 넣고 이 플래그만 `true`로.
- **Final Raid 종료 정책**: 20초 경과 시 반드시 격퇴(성공 보장). 다만 `HIT_TARGET`(140타)을 먼저 채우면 조기 격퇴된다 — 여러 명이 한 기기를 연타하면 20초보다 빨리 끝날 수 있다. 20초를 반드시 채우게 하려면 `raid.js`의 `HIT_TARGET`을 크게 올리면 된다(체력은 시간만으로도 0에 도달).
- **관리자 Final Raid 제어(SCR-109) 없음**: 현재는 팀별 Stage 3 완료 직후 자동 진입(`docs/game-flow.md §4.5`의 허용 방식 중 하나). 운영진이 시점을 통제해야 하면 게임 상태에 `final_raid`를 추가하고 대기 게이트를 넣어야 한다.
- **영문 단서 미디어**: question 이미지/녹취는 한국어 콘텐츠 → en 모드여도 그림/음성 속 텍스트는 한국어(영문 에셋 재제작 영역).
- **아직 en 미이관 문구**: 관리자 콘솔(운영자용), 팀 등록 모달 일부(수사관 N명 등), DEV 메뉴(내부). 필요 시 copy 키로 이관.
- **정답 노출**: 현재 SOLUTIONS가 클라이언트 번들에 있음(MOCK). 서버 연결 시 채점 RPC로 이관 필요(CLAUDE.md §11).
- **엔딩 영상 화면(SCR-021)은 참가자 흐름에서 제거**: 참가자는 금배지 수여식에서 마무리하므로 별도 엔딩 영상 화면을 두지 않았다. 국장 최종 메시지·전체 캐릭터 연출은 종료 안내 화면으로 옮겼다. 엔딩 영상을 실제로 상영하려면 관리자 콘솔에 재생 화면을 추가하는 편이 운영 흐름에 맞다(`ASSETS.videos.endingAvailable` 플래그는 남아 있다).
- **종반부 화면에는 캡처 가드가 없다**: 사건 내용이 없는 연출 화면이라 워터마크·전체화면 게이트를 붙이지 않았다(의도적). 필요하면 `createCaptureGuard`를 각 화면에 추가하면 된다.

---

## 5.1 안정화 점검 결과 (2026-08-04, Supabase 연동 직전)

Mock 전체 흐름을 커밋하기 전 실시한 점검. **결과: 오류 0**.

| 항목 | 결과 |
|---|---|
| `npm run build` | 통과 (JS 160KB / gzip 55KB · CSS 77KB / gzip 13.5KB) |
| `npm run validate` | 오류 0 · 경고 1(Stage 2 임시 사건 알림) |
| 콘솔 오류 | 국문·영문 전체 플레이 + 손상 스토리지 부팅 + 초기화까지 **0건**(Vite HMR 로그만) |
| 프로덕션 번들 DEV 코드 | `fastForward`·`devmenu`·`DEV 잠금`·`createTeamManager` 등 **전부 0건** (DEV 메뉴 미노출 확인) |
| 없는 에셋 요청 | 종반부까지 네트워크 로그 전수 확인 — `ending.mp4`·미제작 SFX **요청 없음**, 전 요청 200/206/304 |
| 국문 전체 흐름 | Entry→…→Stage 1(3)→Stage 2(7)→Stage 3(5)→임명→레이드→금배지→종료: 100점·15/15 (배점 변경 전 실측은 300점) |
| 영문 전체 흐름 | 동일 경로 완주, 라벨·해설 전부 영문 |
| Final Raid 종료 | 클릭 30회 → 20.0초에 격퇴 / 백그라운드 탭(rAF 정지) → **setTimeout 안전망이 20.6초에 종료** |

**삭제한 죽은 코드** — Vite 스캐폴드 잔재 `src/counter.js`, `src/style.css`(어디서도 import되지 않던 "Count is N" 템플릿). `index.html` 타이틀도 `Design System` → `PM보호국 · PM Protection Bureau`로 교정.

**남겨둔 미사용 파일(번들에 포함되지 않음 — `src/main.js` import 그래프 도달 불가)**:
`src/js/screens/demo.js` + `src/css/demo.css`(디자인 시스템 미리보기 화면), `src/components/primitives/{card,progress-bar}.js`, `src/components/feedback/states.js`, `src/components/shell/right-info-panel.js`.
→ `docs/screen-list.md §7`의 공통 컴포넌트 목록에 있는 항목들이라 후속 화면에서 쓸 수 있게 보관했다. 빌드에 들어가지 않으므로 런타임 비용은 0이며, **정리하려면 이 6개를 함께 지우면 된다**(다른 코드가 참조하지 않음).

**알려진 잔재(의도적)**:
- `screens.css`에 DEV 메뉴 스타일 약 2KB(gzip 수백 바이트)가 남아 프로덕션에도 실린다. DEV 메뉴 자체는 없으므로 화면 영향은 없다. 분리하려면 dev 전용 CSS로 옮겨야 한다.
- `console.log`는 DEV 컴포넌트(dev-menu·team-manager·entry-monitor)의 클립보드 실패 폴백 3곳뿐이며 프로덕션 번들에 포함되지 않는다.
- **관리자 비밀번호 `2026`이 클라이언트 번들에 문자열로 존재한다**(MOCK). 실제 보호는 Supabase Auth 이관 시점에 해결해야 한다 — `CLAUDE.md §11`.

---

## 6. 종반부 흐름 (2026-08-04 추가)

```
Stage 3 아이템(배째 마스터)
  → [감독관 임명으로]      → SCR-015 감독관 임명      (flow step 'appoint')
  → [임명 수락]            → SCR-016 긴급 경보        (flow step 'raid' 의 alert 국면)
  → [긴급 상황 확인]       → SCR-017 레이드 준비 → 3·2·1 카운트다운
  → SCR-018 20초 레이드     → SCR-019 빌런왕 격퇴
  → [최종 임명 절차]       → SCR-020 금배지 수여(정식 감독관 임명)   (flow step 'ending')
  → [예선 2라운드 끝내기]  → SCR-023 종료 안내 = 참가자 흐름의 끝
                              (국장 최종 메시지 + 전체 캐릭터 + 계급·점수, 순위는 없음)

[감독관] ?admin → [최종 랭킹 발표] → SCR-022 최종 랭킹 (전체 팀 순위·Stage 점수·Raid 타수)
```

- **라우트 3개 추가**: `FLOW.APPOINT | RAID | ENDING` (`src/js/constants/flow.js`). 종반부는 `FINALE_ORDER`로 순서를 강제하고, `resolveStep`이 **Stage 1~3 전부 제출 + 임명 여부 + 레이드 완료 여부**로 진입을 가드한다. 가드에 필요한 상태는 `flow.js`의 `guardFacts()`가 `lib/game.js`·`lib/progress.js`에서 읽어 넘긴다(`constants/`는 상태 모듈을 import하지 않는다는 규칙 유지).
- **저장 지점(docs/game-flow.md §18)**: `progress.finale = { appointedAt, raidStartedAt, raidEndedAt, raidHits, raidDamage, badgeAt, endedAt }`. 시각은 최초 1회만 기록하고 누적치(타수·데미지)는 최댓값을 유지한다 → 새로고침해도 기여도가 깎이지 않는다.
- **새로고침 복구**: 임명 전 → 임명 화면 / 임명 후 레이드 미완료 → 경보부터 다시 / 레이드 완료 → 격퇴 결과 화면 / 금배지 이후 → 마무리했으면(endedAt) 종료 안내, 아니면 금배지 수여식. Stage 3 마지막 사건 제출 직후 새로고침하면 **Stage 3 결과 화면**으로 복구된다(아이템 획득 연출을 건너뛰지 않도록).
- **레이드 안전장치**: 체력은 `max(경과시간/20초, 타수/140)`로 감소 → 클릭 0회여도 20초에 0이 된다. rAF가 멈추는 백그라운드 탭 대비 `setTimeout(20.6초)` 안전망이 있고 `finish()`는 멱등이다.
- **랭킹 기준**(`lib/progress.js getRanking`): 총점 → 정답 수 → 제출 완료 시각 → Raid 기여도(§15.1). Raid 타수는 **점수에 가산하지 않고** 표시·동점 처리에만 쓴다(100점 만점 유지).
- **배점**(확정 2026-08-05): 스테이지별 배점 — Stage 1 = 7점×3 = 21 · Stage 2 = 7점×7 = 49 · Stage 3 = 6점×5 = 30 → **총 100점**. 클라이언트 표시값은 `src/js/constants/scoring.js`, 서버 판정은 `stage_points()` + `submit_answer`(`supabase/migrations/0008_stage_points.sql`). 두 값은 항상 같이 고친다.
- **스크롤 리셋**: 화면 스크롤 컨테이너는 `#flow-root`다. `flow.js`가 화면 전환 시, 각 컨트롤러는 하위 국면 전환 시 `ctx.scrollToTop()`으로 맨 위로 되돌린다(긴 랭킹 화면에서 중간부터 보이던 문제 수정).

---

## 7. 2026-08-05 세션 기록 — 배점 100점 전환 · 사건 #001 확정

### 7.1 배점: 사건당 20점(300점) → 스테이지별 배점(100점)

| Stage | 사건 수 | 사건당 | 스테이지 만점 |
|---|---|---|---|
| 1 · Mindset | 3 | 7점 | 21 |
| 2 · Performance Domain | 7 | 7점 | 49 |
| 3 · AI Use Case | 5 | 6점 | 30 |
| **합계** | **15** | — | **100** |

- **단일 출처**: `src/js/constants/scoring.js` (`STAGE_POINTS` · `STAGE_TOTALS` · `STAGE_SCORE_MAX` · `SCORE_MAX` · `pointsFor()`). 양쪽 progress 구현에 중복돼 있던 `STAGE_TOTALS`도 여기로 합쳤고, `POINTS_PER_CASE`(=20)는 **삭제**했다.
- 표시 반영 지점: 사이드바 만점(`case.js` `scoreMax`) · Stage Result 점수(`solved × pointsFor(s)`) · 관리자 랭킹의 Stage별 점수(`정답 수 × STAGE_POINTS[s]`).
- **사이드바 `Stage Score` 행은 정답 수/사건 수(`2/7`) 유지** — LayOut 설계값이다(운영 결정). 점수 표기로 바꾸지 않았다.
- **서버**: `supabase/migrations/0008_stage_points.sql` — `stage_points(stage)` 함수 + `submit_answer`가 이를 사용(stage 는 서버가 `case_answers`에서 확정하므로 클라이언트가 배점을 조작할 수 없다). 기존 20점 기록을 재환산하고 `recalc_team_progress`로 팀 총점을 재집계하는 멱등 블록이 포함돼 있다.
- **검증 자동화**: `npm run validate`가 "제작된 사건 기준 만점 ≠ `SCORE_MAX`"를 **오류**로 잡는다 → 콘텐츠 교체로 배점이 깨지면 즉시 실패한다.
- 클라이언트 `scoring.js`와 서버 `stage_points()`는 **항상 같이 고친다**.

### 7.2 사건 #001 (Stage 1 · Proactive Mindset) 확정

- 단서 이미지를 **영문판 1종으로 운영**하기로 결정(국문판 별도 제작 없음). 교체된 `question1.webp`는 단서가 `CLUE 1~4` **4개**(이전 국문판은 5개, ⑤ 리스크 Trigger 관리표가 있었다).
- ~~그래서 국문 보기에 **한글 단서명을 `desc`로 붙였다** — 영문 이미지의 소제목을 한글이 짚어주는 구조(`{ label: '단서 1', desc: '프로젝트 일정 예측 대시보드' }`).~~
  > ⚠️ **2026-08-10 에 이 결정을 뒤집었다 → §12.1 참조.** 교체된 이미지의 명패에 단서명이 인쇄되어 있어 화면에 다시 적으면 중복이고, 참가자가 이미지를 읽지 않고 라벨만 보고 답을 고르게 된다. **보기는 `단서 1~4` 만 표기한다 — `desc` 를 되살리지 말 것**(규칙: `CLAUDE.md §16.2`).
- ~~`fileNo`를 **`#007`로 변경**~~ → **2026-08-10 이미지 교체로 `#001`** (인쇄값이 바뀌었다 · §12.1). 이미지에 인쇄된 값과 화면이 어긋나면 참가자가 다른 사건으로 오인한다. `caseNo`(진행 순번 1)와는 별개 값이다.
- 해설을 확정본으로 교체(총평 + `[단서별 판단]` 4항목), **문체는 존댓말로 통일** — 15개 사건 중 14개가 존댓말이었다. 정답 인덱스는 `3`(④ 프로젝트 운영 현황) 그대로라 기존 제출 채점 결과는 영향 없다.
- **PNG → WebP 변환은 필수 작업이다.** 코드가 `.webp` 경로 상수를 참조하므로 PNG만 넣으면 404다. 변환 기준: 일러스트·사진형 = 손실 `q90`, 평면 텍스트·표 캡처형 = 무손실(`lossless=True, method=6`). 이번 건은 q90 → 2.1MB → **211KB, PSNR 44.6dB**. 원본 PNG는 서빙되지 않는 `img/questions/`에 보관했다(git 미추적).
- 최상위 `img/`·`audio/`·`video/`는 **빈 잔재 폴더**다. 런타임 에셋은 반드시 `public/` 아래.

### 7.3 Stage 1 리뷰에서 발견된 미해결 항목

- **`case-003`(가치 판단) 콘텐츠는 사용자가 재작성해 2026-08-06에 전달 예정이다.** 전달되면 국문·영문 brief와 보기·해설을 함께 교체한다. 현재 문제: **국문 brief가 "음성을 듣고"라고 지시하는데 음성 소스가 없다.** `public/audio/sfx/`에는 `question3`(=`case-002` 녹취 A~D)·`question11`·`question14`만 있고 `question2/`는 없다. 게다가 **국문과 영문 brief 내용이 다르다** — 영문에는 프로젝트 성과 5항목(일정 준수·예산 내·기능 100%·불만 35%↓·이용 18%↑)과 길동 책임 발언이 있으나 국문에는 그 맥락이 전혀 없어 한국어 참가자가 판단 근거 없이 다이어리 4장만 본다. **결정 필요**: (a) 브리핑 음성 제작 + 자막 제공, (b) 국문 brief를 영문판처럼 텍스트 맥락으로 교체하고 "음성" 문구 삭제(에셋 대기 없음).
- **`question4.webp`(222KB)가 디스크에만 있고 코드 미연결** — `assets.js`에 `q4` 키가 없다. 출시 전 지표는 전부 GREEN인데 출시 17분 뒤 AUTH ERROR로 전 기능 DOWN, "성능시험이 보안 우회 시나리오를 포함하지 않았다"는 Incident Analysis가 그려진 **Stage 2용 확정 단서 이미지**다. Stage 2 콘텐츠가 오면 이 이미지가 그 사건의 단서다.
- **에셋 키 ↔ 사건 순번 불일치**(2↔3 순서 교체 잔재): `case-002`가 `q3`/`q3_1~4`, `case-003`이 `q2_1~4`를 쓴다. `docs/assets-list.md`도 교체 전 번호(#014·#021)로 남아 있다. 동작은 정상이나 다음 사람이 헷갈린다.
- `case-002` 국문 brief는 문자열 안 `\n`과 `join('\n')`이 섞여 줄 간격이 불규칙하다. 또 국문 prompt("가장 부적절한 대화")보다 **영문 prompt가 Mindset 이름을 명시해 힌트를 더 준다**.

### 7.4 Confluence MCP 가 동작하지 않는다 (도구 설정)

`~/.claude.json`의 `CONFLUENCE_URL`이 `http://collab.lge.com`인데 실제 컨텍스트 경로는 **`http://collab.lge.com/main`**이다(페이지 URL이 `/main/spaces/...`). 그래서 REST 호출이 다른 인스턴스로 가서 `get_page`는 "no content with the given id", `search`는 404다. → `CONFLUENCE_URL`에 `/main`을 붙이고 MCP 재연결해야 원본 문제 페이지(예: `Gate1. Mindset`)를 읽을 수 있다.

### 7.5 서버 적용 완료 (2026-08-05 실측 검증)

`0008_stage_points.sql` · `0003_seed_answers.sql` 모두 적용하고 아래를 확인했다.

| 검증 | 값 |
|---|---|
| `stage_points(1)*3 + stage_points(2)*7 + stage_points(3)*5` | **100** |
| `submit_answer` 본문이 `stage_points` 사용 | true |
| `answers` 중 배점이 0·6·7 이 아닌 행(구 20점 잔재) | 0 |
| `team_progress` 중 100점 초과 | 0 |
| `case_answers` 행 수 | **15** |
| `case-001` 정답 인덱스 · 확정 해설 반영 | 3 · true |

**이 과정에서 발견한 함정**: 정답 시드가 upsert만 해서 **사건 id를 바꾸거나 사건을 교체하면 `case_answers`에 유령 행이 남는다**(실측 18행). `scripts/export-seed.mjs`가 이제 시드 끝에 `delete ... where case_id <> all (array[...])`를 함께 생성한다(커밋 `d1ea95b`). 콘텐츠를 교체할 때마다 재생성·재적용하면 자동으로 정리된다.

### 7.6 다음 세션에서 바로 해야 할 일

1. ~~`case-003` 확정 콘텐츠 반영~~ → **완료 (§8)**. 사건 #002도 함께 확정됐다.
2. ~~Stage 2 확정 콘텐츠 7사건 교체~~ → **완료 (§9)**. 15사건 전부 확정 콘텐츠가 되어 `임시 데이터` 배지가 남은 사건이 없다.
3. 콘텐츠를 바꾼 뒤에는 항상 `npm run validate`(만점 100점 정합 자동 검사) → `npm run build` → `npx vercel --prod --yes`.

---

## 9. 2026-08-06 세션 기록 — Stage 2 확정 7사건 + 복수 정답 엔진

### 9.1 임시 데이터를 지우고 확정 콘텐츠 7사건을 넣었다

`case-s2-04`~`case-s2-10`(임시 7사건 · 260줄)과 그 정답·해설(121줄)을 삭제하고 아래로 교체했다. **이제 15사건 전부 확정 콘텐츠**이며 `placeholder: true`가 남은 사건이 없다.

| id | fileNo | 제목 | Domain | 단서 | 정답 |
|---|---|---|---|---|---|
| case-004 | #004 | 그 결정은 왜 회의실을 벗어나지 못했는가 | Governance | 음성 1(인터뷰 1~4 합본) ko/en | ③ |
| case-005 | #005 | 사라진 두 달 | Scope | 이미지 5 | **B·C·E (복수)** |
| case-006 | #006 | 초록색 경고등 | Schedule | 이미지 1 | ② |
| case-007 | #007 | 1,500억의 선택 | Financial | 음성 4 ko/en | ③ |
| case-008 | #008 | 회의실에 남겨진 다섯 장의 메모 | Stakeholders | 이미지 5 | ② |
| case-009 | #009 | PM을 무너뜨린 사람 | Resources | 음성 4 ko/en | ④ |
| case-010 | #010 | 회고 보고서 | Risk | 이미지 1 ko/en | ② |

- 이미지 13장을 WebP로 변환: **16.2MB → 4.0MB (-75%)**. 평면 텍스트=무손실 / 사진·일러스트=q90 / 회고 보고서=q96(무손실은 1.2MB로 너무 무거웠다). 원본 PNG는 `img/questions/`.
- **⚠️ 표시 번호 `#007`이 Stage 1 `case-001`과 겹친다.** `case-001`은 단서 이미지에 `CASE FILE #007`이 인쇄돼 화면도 #007로 맞춰 둔 상태(2026-08-05 결정)다. id는 달라 제출·점수는 안전하지만 참가자에게 같은 번호가 두 번 보인다 → 둘 중 하나의 `fileNo`를 바꿔야 정리된다.
- **⚠️ `question4.webp`는 어느 사건도 쓰지 않는다.** '출시 17분 후 AUTH ERROR · 성능시험이 보안 우회 시나리오 미포함' 장면으로 #004(플랫폼 변경 거버넌스)와 내용이 맞지 않아 `assets.js`에 등록하지 않았다.
- 사건 #004 음성은 **인터뷰 1~4가 한 파일**이다(사건 #011과 같은 형태). 인터뷰별로 나누려면 `question4-1~4.mp3` 분할 파일이 필요하다.

### 9.2 복수 정답 엔진을 새로 만들었다 (사건 #005)

사건 #005는 증거물 5개 중 **3개**를 고른다. 기존 엔진은 단일 인덱스만 다뤘다.

- **데이터**: 사건에 `multi: true, selectCount: 3`, 정답은 `SOLUTIONS.answerIndexes: [1,2,4]`(배열). 단일 사건은 그대로 `answerIndex`.
- **채점 규칙(결정)**: **집합 일치 · 부분 점수 없음** — 3개를 정확히 맞히면 스테이지 배점 7점, 하나라도 틀리면 0점. 총점 100점 설계를 유지하려고 이 방식을 택했다.
- **UI**: `question-choice.js`가 `multi`면 체크박스 semantics로 바뀌고, 정원이 차면 미선택 보기를 흐리게 해서 왜 눌리지 않는지 보이게 한다.
- **서버**: `supabase/migrations/0009_multi_answer.sql` — `case_answers.answer_indexes`·`answers.choice_indexes` 배열 컬럼, 집합 비교 함수 `same_index_set()`, `submit_answer` 교체(인자가 늘어 오버로드가 되면 PostgREST가 모호해지므로 옛 함수를 `drop` 한다).
- **호환성 함정**: 클라이언트가 `p_choice_indexes`를 **항상** 보내면 0009 미적용 서버에서 PostgREST가 함수 시그니처를 못 찾아 **단일 선택 사건의 제출까지 전부 실패**한다. 그래서 복수 정답일 때만 이 인자를 넣는다(`lib/grade.js`).

### 9.3 `validate.mjs` 검사 2종 추가

- **복수 정답 정합**: `multi`인데 `answerIndexes`가 없거나, 정답 수 ≠ `selectCount`(아무도 못 맞힌다)거나, 중복·범위 초과거나, `answerIndex`가 함께 남아 있으면(채점 기준이 둘) 오류.
- **prompt 숫자 정합**: prompt의 수사(`4가지`·`three`·`3개`)가 보기 수·선택 수와 다르면 오류. 사건 #001 영문 초안의 "five clues"(실제 4개) 같은 번역 드리프트를 자동으로 잡는다. 15사건 전부 오탐 없이 통과.

### 9.4 검증

| 항목 | 결과 |
|---|---|
| `npm run validate` | **오류 0 · 경고 0** (임시 사건이 없어져 경고까지 사라졌다) |
| `npm run build` | 통과 (JS 381KB / gzip 112KB · CSS 78KB / gzip 13.7KB) |
| 프로덕션 번들 정답 노출 | `answerIndex`·`정답은`·해설 문구 전부 0건 |
| 시드 재생성 | 정답 15개(복수 정답 1개) · `delete` 절로 `case-s2-*` 유령 행 자동 정리 |

**서버 적용 순서**: ① `0009_multi_answer.sql` → ② `node scripts/export-seed.mjs` 로 만든 `0003_seed_answers.sql` → ③ `0003` 파일 삭제. 순서를 지켜야 한다 — `0003`이 `answer_indexes` 컬럼을 쓰므로 `0009`가 먼저다.

---

## 8. 2026-08-06 세션 기록 — Stage 1 사건 #002·#003 확정 + 에셋 번호 정합

### 8.1 에셋 번호가 사건 순번과 맞아졌다 (§7.3의 "2↔3 교체 잔재" 해소)

사용자가 파일을 재정리해 이제 **`questionN*` = 사건 순번 N** 규칙이 전부 성립한다.

| 변경 | 내용 |
|---|---|
| 신규 | `question2.webp` — 사건 #002 현장 자료(**영문판 1종 운영**, 1.9MB PNG → **151KB** q90 · PSNR 42.0dB) |
| 신규 | `audio/sfx/question2/question2-1~4.mp3` — 사건 #002 녹취 A~D |
| 신규 | `audio/sfx/question3/question3.mp3` · `question3_en.mp3` — 사건 #003 감독관 브리핑(국문·영문) |
| 리네임 | `question2-1~4.webp` → `question3-1~4.webp` (사건 #003 다이어리 · 국문) |
| 신규 | `question3-1~4_en.webp` — 같은 다이어리 **영문판** (1.3MB PNG ×4 → 121~150KB · PSNR 40dB+) |
| 삭제 | `question3.webp`(사건 #002 국문 배경 — 워터마크 박힌 저해상도 초안), `question3/question3-1~4.mp3`(옛 녹취) |

- 원본 PNG는 서빙되지 않는 `img/questions/`로 옮겼다(`.gitignore` `/img/`). `.PNG` 대문자로 받은 파일은 반드시 소문자 `.webp`로 변환해서 넣는다 — Vercel/Linux는 대소문자를 구분한다.
- **사건 #003은 국문·영문 단서 이미지가 따로 있는 유일한 사건**이다 → `cases.js`의 `en.evidence.images[].src`가 `_en` 키를 가리킨다. 다른 사건은 여전히 en도 국문 이미지를 쓴다.

### 8.2 사건 #002 — ⚠️ **정답이 바뀌었다**

녹취 음성이 새 파일로 교체되면서 **대화 순서가 바뀌어, 정답이 녹취 D(인덱스 3) → 녹취 B(인덱스 1)** 가 되었다. 확정 해설도 교체했다(Empowered Culture는 장려하지만 최종 의사결정·결과 책임은 Accountable Leader가 진다 → 녹취 B는 이해가 충돌하는 결정을 팀에 넘기고 PM은 결과만 반영).

> **정답 인덱스가 바뀌었으므로 서버 시드 재적용이 필수다.** 재적용 전에 제출된 답안은 옛 정답으로 채점된 상태로 남는다.

함께 정리한 것:
- 국문 개요를 확정본으로 교체하고, 문자열 안 `\n` + `join('\n')`이 섞여 줄 간격이 불규칙했던 문제를 해결했다(§7.3).
- **영문 brief·prompt가 국문보다 힌트를 더 주던 문제**(§7.3)를 해소 — "PM이 의사결정 책임을 팀에 넘겼다"까지 밝히던 문장을 국문과 같은 수준으로 맞췄다.
- `en.evidence` alt 텍스트의 사건 번호 오기(`Case #021` → `#002`)를 고쳤다.

### 8.3 사건 #003 — 정답 인덱스는 그대로, 해설만 확정본

정답은 **③ 증거물 C(인덱스 2)** 로 기존과 같다 → 기존 제출 채점 결과에 영향 없다. 해설을 확정본(더 간결한 Output vs Outcome 구조)으로 교체했다.

- **§7.3에서 막혀 있던 "음성 소스 없음"이 해결됐다** — 국문 개요가 "음성을 듣고"라고 지시하는데 음원이 없었다. 이제 `question3.mp3`(국문)·`question3_en.mp3`(영문)를 `evidence.audios`에 배선했다.
- **결정(2026-08-06): 사건 맥락은 브리핑 음성에만 담고 개요에 텍스트로 옮겨 적지 않는다.** 그래서 국문보다 정보가 많았던 영문 개요(프로젝트 성과 5항목·길동 책임 발언)를 **삭제하고 국문과 같은 두 줄로 맞췄다**. 영문 prompt도 국문과 같이 Value-Driven Mindset을 명시하는 문장으로 교체했다(이전 영문 prompt는 "가치·성과를 산출물보다 우선한 기록을 찾아라"로 정답 성격을 설명해 힌트가 더 컸다).
- ⚠️ **남은 접근성 부채**: 이 사건은 판단 근거가 음성에만 있고 **자막·녹취록이 없다** — `CLAUDE.md §13`(오디오 단서에 자막/녹취록 제공)을 아직 못 지킨다. 재생·일시정지·다시듣기·볼륨은 네이티브 컨트롤로 제공된다. 운영상 감독관이 음성을 현장에서 함께 재생하는 방식이면 실무 문제는 없지만, 청각 접근성이 필요한 참가자가 있으면 녹취록을 준비해야 한다.

### 8.4 검증

| 항목 | 결과 |
|---|---|
| `npm run validate` | 오류 0 · 경고 1(Stage 2 임시 사건) |
| `npm run build` | 통과 (JS 366KB / gzip 108KB · CSS 78KB / gzip 13.6KB) |
| 프로덕션 번들 정답 노출 | `정답은`·`answerIndex`·확정 해설 문구 **전부 0건** |
| 시드 재생성 | `case-002 → answer_index 1` · `case-003 → 2` · `delete` 절 포함 · 한글 UTF-8 정상 |

**적용 절차**: `node scripts/export-seed.mjs` 로 만든 `supabase/migrations/0003_seed_answers.sql`을 Supabase SQL Editor에서 실행 → 파일 삭제(커밋 금지 · `.gitignore` 등록됨). `delete ... where case_id <> all(...)` 절이 있어 유령 행도 함께 정리된다(§7.5).

### 9.5 에셋 최적화 — 배포 62.5MB → 35.8MB (-43%)

`docs/assets-list.md`의 인코딩 규칙을 전 에셋에 적용했다. 원본은 서빙되지 않는 `img/`(gitignore)에 보관.

| 대상 | 전 → 후 | 방식 |
|---|---|---|
| 단서 이미지 13장(Stage 2) | 16.2MB → 4.0MB | 평면 텍스트=무손실 · 사진/일러스트=q90 · 회고 보고서=q96 |
| 배경·캐릭터·로고 11장 | 33.5MB → 9.5MB | q90. **투명도가 실제로 필요한 `badge-gold`만 알파 유지** |
| BGM 3개 | 13.7MB → 7.1MB | 96kbps 스테레오 재인코딩 |
| `one-pass.jpg` | 326KB → 211KB | q90 WebP |
| 미사용 제거 | -5.7MB | `question-bg3` · `badge-gold2` · `question4.webp` |

**함정 3개를 여기서 잡았다 — 다음 사람도 같은 실수를 할 수 있다.**
1. **CSS가 경로 상수를 우회했다.** `base.css`·`gameplay.css`·`screens.css`(×2)가 `question-bg.png`·`opening.png`·`waiting.png`를 직접 참조하고 있었다. WebP로 바꾸면서 이걸 놓쳤다면 **배포 후 게임 배경이 전부 사라졌다.** → `validate` 가 이제 ASSETS 상수 + CSS `url()` 을 함께 대조한다.
2. **Windows 의 `existsSync` 는 대소문자를 무시한다.** `question15-logA.webp` 같은 대문자 파일명은 로컬에선 통과하고 **Vercel/Linux 에서만 404** 가 난다. 소문자 kebab-case(`question15-log-a.webp`)로 리네임했고, 검사가 코드 경로와 디스크 파일명을 **글자 그대로** 비교한다.
3. **`logo.webp` 가 알파 없이 나왔다.** 원본 `logo.png` 의 알파가 전부 불투명(min=max=255)이라 인코더가 버린 것이어서 문제가 없었지만, 확인 없이 넘기면 로고에 검은 사각형이 생기는 유형이다.

`videos.ending`·`endingAvailable` 은 **코드가 읽지 않는 죽은 상수**여서 제거했다("영상이 오면 플래그만 true로"라는 옛 안내는 이미 무효였다). `videos/opening.mp4` 는 **YouTube 차단 시 대체 후보**로 남겨 뒀다(대체 배선은 아직 없다).

### 9.6 운영 요청 반영 (2026-08-06)

| 항목 | 내용 |
|---|---|
| 제한 시간 **80분** | 값이 **세 곳**에 있다 — 서버 `games.duration_minutes`(권위 · `0010`) · `lib/game-mock.js` `DURATION_MS` · `lib/game-server.js` 조회 전 기본값. 항상 같이 고친다 |
| Final Raid **10타 격퇴** | `HIT_TARGET` 140 → 10. **`SKILL_EVERY` 도 14 → 3 으로 함께 낮췄다** — 그대로 두면 10타 안에 14타를 못 채워 장비 스킬 연출이 한 번도 안 나온다 |
| 종료 안내에 **[팀 선택으로 돌아가기]** | 참가자 흐름 마지막 화면이 막다른 화면이 되지 않게. `endedAt` 은 남으므로 재진입하면 가드가 다시 이 화면으로 복구한다(재플레이·점수 초기화 아님) |
| 관리자 [팀 현황]에 **마지막제출** 열 | 초까지 표시(동점 tie-break 기준이라 분 단위로는 구분 불가) · CSV 에 `last_submit_at` 추가 · 서버 뷰 확장은 `0011` |
| 오프닝 영상 교체 | `openingEmbedId` → **`OTnd68QC0_8`** (oEmbed 200 확인 · "5. PMC2026 오프닝영상 최종수정버전") |
| Raid 타격 효과음 | 프로젝트에 SFX 가 하나도 없어 **합성**해 만들었다(`raid-hit.mp3` 3KB·200ms). 연타 대비 최소 간격 60ms |

### 9.7 검증 도구 강화 (`scripts/validate.mjs`)

콘텐츠 교체가 잦은 프로젝트라, 사람이 놓치는 유형을 자동으로 잡게 했다. 새로 추가된 검사:

- **복수 정답 정합** — `multi`인데 `answerIndexes`가 없거나, 정답 수 ≠ `selectCount`(아무도 못 맞힌다), 중복·범위 초과, `answerIndex`가 함께 남아 있음(채점 기준이 둘)
- **prompt 숫자 정합** — prompt 의 수사(`4가지`·`three`·`3개`)가 보기 수·선택 수와 다르면 오류. 번역이 낡은 원본을 따라가 "five clues"(실제 4개)로 적히는 사고를 막는다
- **단서 에셋 양방향 대조** — 참조했는데 파일 없음 / 파일이 있는데 아무도 안 씀(배포 용량) / **대소문자 불일치** / `public/`에 최적화 안 된 PNG·WAV 원본이 남음
- 사건 단서만 본다 — `/audio/sfx/question*` 로 한정(연출용 `raid/` 는 제외)

### 9.8 진행 집계를 파생값으로 바꿨다 (버그 수정)

`p.stage[s]`·`p.score`가 localStorage 에 **쌓아둔 누적 카운터**였다. 사건 id가 바뀌거나 옛 테스트 기록이 남으면 카운터가 영구히 부풀어 **'해결 4/3'** 처럼 사건 수를 넘는 값이 나오고 총점도 스테이지 합과 어긋났다(실측). 이제 `solved`·`submitted` 목록만 저장하고 **현재 `CASES` 와 교차해 매번 다시 계산**한다 → 사라진 사건 id는 자동으로 빠지고, 총점은 항상 `Σ(스테이지 정답 수 × 배점)`이다. 사이드바·감독관 임명·최종 랭킹이 같은 파생 집계를 쓴다.

### 9.9 DEV 메뉴가 실패를 삼키던 문제

서버 모드에서 DEV `게임 시작`은 `admin_start_game`(`is_admin()` 검증)을 호출해 `forbidden`으로 거부되는데, `click: () => startGame()` 이 실패한 Promise를 그대로 버려서 **"눌러도 아무 일이 없다"** 로 보였다. 이제 버튼 라벨에 `권한 없음 — ?admin 로그인 필요` 를 띄운다. 서버 모드에서 DEV 로 진행하려면 `?admin` 로그인이 필요하고, 콘텐츠만 확인할 거면 **`VITE_BACKEND=mock` 으로 띄우는 게 맞다**(mock 은 새 정답으로 채점하고, 서버는 시드 적용 전까지 옛 정답으로 채점한다).

---

## 10. 이어서 할 일 (다른 환경에서 시작할 때)

### 10.1 ⚠️ 서버 마이그레이션 — 배포보다 먼저, 이 순서로

> **✅ 적용·검증 완료 (2026-08-07 확인).** 프로젝트 `teyngjaladwqolxwykqk` 에서 `teams=33 · case_answers=15 · duration=80` · `submit_answer(p_choice_indexes)` 존재 · `admin_team_status` 뷰 존재를 확인했다(정답 시드 case-002→1 · case-005→{1,2,4} 포함). **재적용 불필요.** 아래 절차는 DB 를 새로 만들거나 초기화한 뒤 다시 세팅할 때를 위한 참고용이다. 상태는 언제든 `node scripts/check-migrations.mjs`(0009·0010·0011·**0014**, 읽기전용) + SQL Editor 의 `select count(*) from public.case_answers;`(0003=15) 로 재확인한다.
>
> **추가 (2026-08-11): `0014_admin_extend_game.sql` 적용 완료.** 관리자 콘솔 [+5분 연장] 버튼용 RPC.
> 함수 존재 + anon 차단(`42501 permission denied` · `ends_at` 불변)까지 확인했다.
> **관리자 로그인 상태에서의 실제 연장 동작은 아직 눌러보지 않았다** — 리허설 때 1회 확인할 것.

Supabase SQL Editor 에서:

1. **`0009_multi_answer.sql`** — 복수 정답 컬럼·`same_index_set()`·`submit_answer` 교체
2. **`0010_duration_80min.sql`** — 제한 시간 80분
3. **`0011_team_status_last_submit.sql`** — 팀 현황에 마지막 제출 시각
4. `node scripts/export-seed.mjs` 로 **`0003_seed_answers.sql` 재생성 후 실행** → **실행 뒤 파일 삭제**(커밋 금지 · gitignore)

**순서가 중요하다**: `0003` 이 `answer_indexes` 컬럼에 값을 쓰므로 `0009` 가 먼저여야 한다.

미적용 상태로 배포하면:

| 증상 | 원인 |
|---|---|
| 사건 #005 제출이 **영구 실패** → Stage 2 통과 불가 → 종반부 진입 불가 | `0009` |
| 타이머가 60분으로 동작 | `0010` |
| [팀 현황] 표가 뜨지 않음 | `0011` |
| 사건 #002 를 **옛 정답(녹취 D)** 으로 채점 | `0003` |

적용 확인:
```sql
select status, duration_minutes from public.games where id = 1;           -- 80
select count(*) from public.case_answers;                                 -- 15
select case_id, answer_index, answer_indexes from public.case_answers
 where case_id = 'case-005';                                              -- null, {1,2,4}
select name, submitted_count, score, last_submit_at
  from public.admin_team_status order by sort_order limit 3;
```

### 10.2 브라우저 실측 — 절반만 끝났다

Claude 의 브라우저 확장이 연결되지 않아 대부분 사용자가 눈으로 확인했다.

| 항목 | 상태 |
|---|---|
| 배경 표시(WebP 전환 후) | ✅ 확인 |
| 금배지 투명도 | ✅ 확인 |
| 오프닝 BGM | ✅ 확인 |
| **Final Raid BGM 재생 안 됨** | ⏳ **미해결** — 파일은 정상(`kill-billian.mp3` 디코드 오류 없음 · 3:49 · 96kbps · 평균 -17.4dB, `opening.mp3` 와 거의 같은 음량). `raid.js` `mounted()` 의 `playBgm` 경로를 봐야 한다 |
| Raid 타격 효과음 | ⏳ 미확인 |
| 사건 #005 복수 선택 UI | ⏳ 미확인 |
| 신규 7사건 화면(5장 갤러리·`audioFirst`) | ⏳ 미확인 |
| 80분 타이머 표시 | ⏳ 미확인 |
| `?lang=en` 전체 플레이 · 콘솔 오류 0 | ⏳ 미확인 |
| 서버 모드에서 #005 제출 통과 | ⏳ **마이그레이션 적용 후 필수** |

자동 검증은 통과 상태다: `npm run validate` 오류 0·경고 0 / `npm run build` 통과 / ASSETS+CSS 참조 95개 실물 존재 / dist 에 PNG·JPG·WAV 0개 / 프로덕션 번들에 정답·DEV 코드 0건.

### 10.3 남은 판단·확인 사항

- **행사장 YouTube 접속** — 가능하다고 확인됨(2026-08-06). 차단 시 `videos/opening.mp4` 를 대체로 배선하는 작업은 하지 않았다.
- **표시 번호 중복** — `#007` 이 Stage 1(`case-001`)·Stage 2(`case-007`)에 동시 표시. `#013` 이미지에는 `CASE FILE #012` 가 인쇄돼 있다. **무시하기로 결정**(2026-08-06).
- **사건 #004 음성은 인터뷰 1~4가 한 파일**이다. 인터뷰별 재생이 필요하면 `question4-1~4.mp3` 분할 파일이 필요하다.
- **사건 #003 은 자막(녹취록)이 없다** — 판단 근거가 음성에만 있어 `CLAUDE.md §13` 을 못 지킨다. 청각 접근성이 필요한 참가자가 있으면 녹취록을 준비해야 한다.
- 참가자 안내 메일(국문·영문) 초안은 `docs/participant-notice.md` 에 있다.
- **정답표**는 `src/js/dev/solutions.js` 가 정본이다. Q번호(진행 순번) ↔ 정답 대조는 아래 명령으로 언제든 다시 뽑는다.

```bash
node -e "globalThis.localStorage={getItem:()=>null,setItem:()=>{}};const{pathToFileURL}=require('node:url');Promise.all([import(pathToFileURL('src/js/dev/cases-content.js').href),import(pathToFileURL('src/js/dev/solutions.js').href)]).then(([{CASES},{SOLUTIONS}])=>{let q=0;for(const c of CASES){q++;const s=SOLUTIONS[c.id];const a=Array.isArray(s.answerIndexes)?s.answerIndexes.map(i=>i+1).join('·')+'번(복수)':(s.answerIndex+1)+'번';console.log('Q'+q+'. '+a+'  |  '+c.fileNo+' '+c.title)}})"
```

---

## 11. 2026-08-07 세션 기록 — 문제 본문 서버 이관(보안) + 서약 뒤로가기 · 종료 이동 + 검수 게이트

### 11.1 마이그레이션 상태 확인 (0009·0010·0011·0003)
새 PC에서 이어받아 `git pull` → `npm install` → `npm run validate`(오류 0). 읽기전용 프로브(`scripts/check-migrations.mjs` 방식, anon)로 **0009·0010·0011 적용 확인**, SQL로 `case_answers=15 · teams=33 · duration=80 · case-002=1 · case-005={1,2,4}` 확인 → **전부 적용 완료**. §10.1의 "미적용 to-do"는 stale였음(배너로 정정).

### 11.2 ⭐ 문제 본문을 서버로 이관했다 (번들 유출 차단)
정답·해설은 이미 `case_answers`로 빠져 있었지만 **사건 본문·선택지는 `src/js/data/cases.js`에 그대로 번들**되어 추출 가능했다. 이번에 본문도 서버로 옮겼다.

- **`src/js/data/cases.js`** → 얇은 로더로 축소: `CASES`=매니페스트 재노출 + `loadCases(teamId, token)` + `localizeCase()`. 본문·정답 없음.
- **`src/js/data/case-manifest.js`**(신규·자동생성): 비민감 구조 메타(`id·stage·caseNo·fileNo·choiceCount·multi·selectCount`)만. `stage-progress`·`progress-mock`이 `CASES`로 그대로 사용 → **그 파일들 무변경**.
- **`src/js/dev/cases-content.js`**(신규): 본문 원본(진실의 원천). **DEV 전용 → 프로덕션 번들에서 제거**(`import.meta.env.DEV` 동적 import). 비상 mock·검증·시드 생성이 여기서 읽는다.
- **서버**: `supabase/migrations/0012_cases_content.sql` — `public.cases` 테이블(RLS 전면거부, `case_answers`와 동일) + `get_cases(p_team_id,p_token,p_locale)` RPC(SECURITY DEFINER). `0013_seed_cases.sql`(생성: `scripts/export-cases.mjs`, **커밋 금지·gitignore·적용 후 삭제**).
- **운영 모드**(사용자 결정): **LIVE = 게임 started + 팀 토큰이면 서버가 본문 일괄 제공**(가장 가벼운 방식). **PREVIEW = 관리자(`is_admin()`)면 상태 무관 본문 반환**(단 정답·해설은 미포함, 전용 화면 없음). **TEST = 미구현**(env 플래그로 추후 추가 가능).
- **`case.js`**: 진입 시 `loadCases()` 한 번(로딩/재시도 표시) 후 렌더 — 렌더 로직은 그대로. `scripts/export-cases.mjs`·`validate.mjs`(매니페스트 정합 검사 추가)·`export-seed.mjs`는 본문을 `dev/cases-content.js`에서 읽도록 변경.
- **검증**: `validate` 오류 0 · `build` 통과 · **프로덕션 번들에 본문·선택지·정답 문자열 0건**(양산 D-30/사라진 두 달/Scope Creep/녹취 A/answerIndex …) · DEV 본문 청크 미유출 · `get_cases` 호출부 존재. 서버 침투 점검: anon으로 `select * from cases` 차단(401) · 토큰 없이 `get_cases` → `not_owner`.

### 11.3 서약 뒤로가기 · 관리자 종료 시 이동 (운영 요청)
- **서약(SCR-004)에 [팀 선택으로 돌아가기]** 추가(`oath.js`) — 팀 잘못 고르면 서명 전 복귀. 팀 이름을 크게 강조(`screens.css` `.oath__team` = `--text-2xl`·black + 팀색 도트 글로우)해 오선택 인지.
- **관리자 [게임 종료] → 참가자 안내 팝업 → 마지막 화면(SCR-023)으로 이동**: `flow.js`가 `status='ended'` 구독 → 팝업(`gameEnded.*`) → `navigate(ENDING, skipGuard)`. `constants/flow.js resolveStep`에 `gameEnded` fact 추가(종료 후 새로고침해도 마지막 화면 고정). `ending.js`는 `forcedEnd`(미완주+종료)면 금배지 건너뛰고 종료 안내 + `record_milestone` 미호출. **설계 §9.1 "강제이동 안 함"을 이 요청으로 덮어씀**(문서 §9.1a에 반영).

### 11.4 검수 게이트 + Preview 배포
- **`VITE_REVIEW_GATE` 빌드 플래그**(`main.js`): 켜지면 참가자 입장 앞에 비밀번호(`2026`) 게이트. 플래그 없으면 런타임에 안 뜸(실 행사 빌드 무영향). `?admin`은 게이트 밖.
- **Preview 배포**로 3명 사전 검수: Vercel `pmc-round2` 링크 → Preview env `VITE_REVIEW_GATE=1` 추가 → `vercel deploy`(Preview, 실 URL 안 건드림). URL은 Vercel 배포 보호(로그인 벽)가 있어 **대시보드에서 공유 링크 생성 또는 Preview 보호 해제** 필요.

### 11.5 남은 일 / 주의
- **리뷰 후 정리(사용자 진행 예정)**: `?admin` → [대기 상태로 되돌리기 → 전부 초기화](점수 리셋) · `npx vercel env rm VITE_REVIEW_GATE preview`(로컬 `.env.local`의 같은 줄도 삭제). 게이트 코드는 남겨도 무해(플래그 없으면 안 뜸).
- **실 행사 배포**: `VITE_REVIEW_GATE` 없이 Production 배포. 배포 전 `0013_seed_cases.sql`이 서버에 적용돼 있어야 LIVE 본문이 나온다(이번 세션에 적용·확인함).
- **브라우저 LIVE 실측 미완**: 서버 모드에서 팀 토큰+게임 started로 본문이 실제로 렌더되는지, 사건 #005 복수 선택 등은 배포본에서 확인 필요.
- **PREVIEW/TEST 화면 미구현**: 관리자용 문제 미리보기(정답·해설 포함)와 TEST 모드는 요청 시 추가.
- **`.env.local` 필요**: 서버 모드 실행엔 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY`(+검수 시 `VITE_REVIEW_GATE=1`). gitignore라 PC마다 만들어야 한다.

---

## 12. 2026-08-10 세션 기록 — 콘텐츠 확정 + 운영 요청 10건 반영

### 12.1 사건 콘텐츠
- **사건 #001 단서 이미지 교체**: `img/questions/question1.png`(사용자 제작) → `public/images/questions/question1.webp`(215KB · PSNR 44.5dB). 인쇄값이 `CASE FILE #007` → **`#001`** 로 바뀌어 `fileNo` 도 함께 내렸다(case-007 과의 번호 중복도 해소). 명패에 단서명이 인쇄되어 있어 `choices` 의 `desc`(한글 단서명)를 제거했다 — 화면에 다시 적으면 중복이고, 참가자가 이미지를 안 보고 라벨만으로 답을 고른다.
- **해설 문체 통일**: case-003 첫 문단이 평서체였던 것을 존댓말로 맞췄다(15개 사건 전체 존댓말 기준).
- **`question2-2_en.mp3` 교체**(사용자) — 경로 상수 변화 없음.
- **재생성**: `export-cases.mjs`(매니페스트 + `0013_seed_cases.sql`) · `export-seed.mjs`(`0003_seed_answers.sql`). 두 시드는 커밋 금지 · 적용 후 삭제.

### 12.2 영문 표현 — 로마자 표기 제거 (운영 결정)
로마자 표기는 영문 참가자에게 뜻이 전달되지 않아 의미를 옮긴 표현으로 교체했다.
- `item.stage1.name`: `Gapjil Mirror Shield` → **`Overreach Mirror Shield`** (갑질 = 우월적 지위 남용 → overreach)
- `item.stage3.name`: `Baejjae Master` → **`Master of the Hard No`** (배째 = 부당한 요구를 단호히 거절 → the hard no)
- `desc`·`congrats` 본문도 같은 낱말로 맞췄다. **국문 표기(갑질 미러 방패 · 배째 마스터)는 그대로다.**

### 12.3 마지막 화면(SCR-023) 개편
- **본문 교체**(`end.msg`): 예선 2라운드 마무리 + 본선 진출은 **예선 1라운드 점수와 종합 평가 후 발표** + 감사 인사. `end.wait`(감독관 발표 대기 안내)는 새 본문에 흡수되어 삭제.
- **국장 최종 메시지 삭제**: `ending.bossLabel/bossMessage` 키와 `.ending__boss` CSS를 제거했다. 마지막 화면에서 참가자가 읽어야 하는 것은 "다음에 무슨 일이 일어나는가"이고, 연출을 겹치면 그 안내가 스크롤 아래로 밀린다. **`docs/game-flow.md §14.2`(국장 최종 메시지)를 이 결정으로 덮어씀.** 임명 화면(SCR-015)의 국장 블록(`.appoint__boss`)은 유지.
- **[브라우저 종료하기] 추가**: `window.close()` 시도 + 즉시 안내 문구 노출(스크립트로 열지 않은 탭은 정책상 닫히지 않으므로 성공 여부를 알 수 없다).

### 12.4 타임오버 처리 (신규)
서버는 `ends_at` 이후 제출만 거부하고(`submit_answer` → `game_ended`) `games.status` 는 관리자가 [게임 종료]를 누를 때까지 `started` 로 남는다 → 그 사이 참가자가 사건 화면에 계속 앉아 있었다.
- `lib/game-{server,mock}.js` 에 **`isTimeUp()`** 추가(status=started + ends_at 경과) → `lib/game.js` 로 노출.
- `flow.js` 가 **초당 1회** 확인해 팝업(`timeUp.*` — "예선 2라운드가 종료되었습니다") → 확인/ESC/배경클릭 **어느 경로로 닫혀도** 마지막 화면으로 이동.
- `guardFacts.gameEnded = isEnded() || isTimeUp()` — 새로고침해도 사건 화면으로 돌아가지 않는다.

### 12.5 첫 화면으로 돌아가기 (언어 선택 재진입)
첫 화면(SCR-001)이 언어 선택 지점이라 잘못 고른 팀이 되돌아갈 길이 없었다.
- **오프닝 · 팀 선택**에 `[첫 화면으로 돌아가기]`(`common.backToStart`) 추가. 팀 선택에서는 **점유 후 감춘다** — 등록을 마친 기기가 나가면 점유는 서버에 남는데 참가자는 나갔다고 오해한다(그때는 [수사관 등록 수정]).
- 아이콘 `arrowLeft` · `download` 를 `utils/icons.js` 에 추가.

### 12.6 오프닝 상단 가이드 (Edge 이슈)
Edge 에서 영상 재생 중 **하단 우측 진행 버튼이 플레이어 UI에 묻혀** 어디로 가야 할지 모르겠다는 보고. 하단 컨트롤은 영상 위에 겹쳐 있어(`position:absolute`) 가려질 수 있으므로, **영상 위쪽 흐름 안에** 가이드 바(`.opening__topbar` / `opening.guide`)를 두었다 — 절대 가려지지 않는다.

### 12.7 관리자 초기화 → 참가자 기기 로컬 상태 삭제
행사장 PC 한 대를 여러 팀이 돌려 쓰면 같은 브라우저에 이전 팀의 세션·언어·진행 캐시가 남아 엉뚱한 화면에서 시작했다.
- **`src/js/lib/local-state.js`**(신규) `clearParticipantState()` — `pmb.` 접두사 키를 지우고 KEEP 만 남긴다(`pmb.game.v2` 관리자 제어 대상 · `pmb.device.v1` 점유 인계 기준 · `pmb.dev.unlocked`). 화이트리스트가 아니라 **접두사 + 예외 목록**이라 새 저장 키가 생겨도 자동 포함된다.
- `flow.js` 가 `status='scheduled'`(= 관리자 초기화) 를 구독해 로컬을 지우고 `location.reload()` → 첫 화면. 모듈 캐시(로케일·진행·팀 목록)까지 확실히 비우기 위해 reload 를 쓴다.
- 관리자 콘솔 확인 문구에 "참가자 기기도 첫 화면으로 돌아간다"를 명시.

### 12.8 관리자 팀 현황 — 엑셀 다운로드
기존 [CSV 복사](클립보드) 옆에 **[엑셀 다운로드]** 추가. **UTF-8 BOM + CRLF CSV** 파일(`pmb-team-status-MMDD-HHMM.csv`)이라 더블클릭하면 Excel 에서 한글 팀명이 깨지지 않고 열린다. xlsx 네이티브는 라이브러리 없이 ZIP 을 직접 만들어야 해 채택하지 않았다(의존성 제한).

### 12.9 사건 #011 증언 오디오 화자별 분할 (완료)
증언 4명이 한 파일(2:01)에 이어 붙어 있어 특정 증언만 다시 들을 수 없었다 — 제한 시간 안에서 부담이 컸다.
- **파일**(사용자 제작): `question11-1~4.mp3`(국문 각 28~32초) · `question11-1~4_en.mp3`(영문 각 25~29초).
- **누락 검증**: MP3 프레임 헤더로 재생 길이를 재서 **분할 합 = 병합본 길이**를 확인했다(국문 121.2s ≈ 120.8s · 영문 106.7s ≈ 106.8s). 바이트 크기는 VBR 재인코딩 때문에 비교 근거가 못 된다.
- **코드**: `assets.js` 에 `q11_1~4`(+`_en`) 추가, `q11`·`q11_en` 제거 → `cases-content.js` 의 `audios` 를 4개로 교체(라벨 `증언 1 · 개발자` … 순서 = 화면 보기 번호 = `answerIndex` 기준). caption 도 `… 녹취 4` 로 맞췄다.
- **병합본 처리**: `question11.mp3` · `question11_en.mp3` 를 `img/audio-src/` 로 옮겼다(서빙 제외 · 보관). 지우지 않는다.
- `answerIndex: 3`(품질 담당자) **변화 없음** — 순서를 그대로 유지했기 때문이다.
- **검증**: `validate` 오류 0(미참조 에셋 경고도 해소) · `build` 통과 · `dist/audio/sfx/question11/` 에 분할 8개만 · `0013_seed_cases.sql` 재생성(본문에 4개 경로 반영).
- ※ 사건 #004(관계자 인터뷰)는 여전히 **1파일 병합 형태**다 — 같은 불편이 있으므로 필요하면 같은 방식으로 나눌 수 있다.

### 12.10 남은 일
- **브라우저 실측 미완**: 이번 변경(타임오버 팝업 · 초기화 reload · 오프닝 상단바 · 엑셀 다운로드)은 `validate`·`build` 만 통과했고 실제 브라우저 확인은 아직이다.

### 12.11 시드 적용 기록 — 2026-08-10 (다른 PC에서 `git pull` 후)

> **두 시드는 저장소에 없다**(gitignore · 적용 후 삭제). 그래서 `git pull` 만 해서는 서버 콘텐츠가 갱신되지 않는다 — **새 PC로 옮기거나 콘텐츠를 고친 뒤에는 반드시 재생성 → 적용**한다.

- **0012(스키마)는 이미 적용돼 있었다** — 새로 적용할 필요 없었다. 확인은 anon 키 읽기전용 프로브로 충분하다(관리자 로그인 불필요):
  - `GET /rest/v1/cases?select=case_id` → `401 / 42501 permission denied` = 테이블 존재 + 직접 조회 전면 차단(정상)
  - `POST /rest/v1/rpc/get_cases` (가짜 토큰) → `401 / not_owner` = 함수 존재 + 토큰 검증 동작. **`PGRST202`(함수 없음)가 오면 그때가 미적용이다.**
- **0013(본문) · 0003(정답·해설) 재생성 후 SQL Editor 에서 적용 → 파일 삭제 완료.** 커밋 `6301603`(워킹트리 clean) 기준으로 `export-cases.mjs`·`export-seed.mjs` 를 돌렸다.
  - `case-manifest.js` 는 재생성 결과가 커밋본과 **내용 동일**(줄바꿈 차이만) → 커밋할 것 없음. 이게 다르면 매니페스트가 stale 이라는 신호다.
  - 디스크에 남아 있던 `0003_seed_answers.sql` 은 **8/6자 파일**이라 §12.1 의 해설 문체 수정(case-003 등)이 빠져 있었다. 재생성본과 비교하니 차이는 **해설 문장뿐이고 `answerIndex` 는 동일** — 채점 결과는 그대로, 참가자가 보는 사건 분석 보고서 문구만 갱신됐다.
- **다음에 같은 상황이면**: `node scripts/export-cases.mjs` + `node scripts/export-seed.mjs` → 두 파일 SQL Editor 실행 → 삭제. 둘 다 멱등(`on conflict do update` + 유령 행 `delete`)이라 재실행이 안전하다.
- **주의**: 시드는 자동생성 파일이다. 해설·본문을 고칠 때 SQL 을 직접 수정하지 말고 원본(`src/js/dev/solutions.js` · `src/js/dev/cases-content.js`)을 고쳐 재생성한다.

### 12.12 32팀 동시 진행 부하 시뮬레이션 — 2026-08-10 (실서버 실측)

**결론: 32팀이 동시에 진행해도 서버 병목은 없다.** 실제 프로덕션 Supabase에 32 동시 클라이언트를 붙여 참가자 흐름 전 구간(쓰기 포함)을 측정했고 **이상 응답 0건**이었다.

| 경로 | 결과 |
|---|---|
| 관리자 [게임 시작] Realtime 전파 | **32/32 수신** · 서버 변경→도착 **399ms** · 기기 간 편차 **5ms** |
| 대기 상태로 되돌리기 전파 | 32/32 · 443ms · 편차 15ms |
| 32팀 동시 입장 `claim_team`(쓰기) | 32/32 · p50 617ms · p95 700ms |
| 32팀 동시 본문 수신 `get_cases` | 32/32 · p50 346ms · p95 355ms · **팀당 16.1KB · 합계 0.50MB** |
| 32팀 동시 `my_progress` | 32/32 · p50 229ms |
| 32팀 동시 `submit_answer`(채점 쓰기) | 32/32 · p50 251ms · p95 693ms (연속 2회차도 동일) |
| 읽기전용 부하 320요청(32~96 동시) | 이상 0건 · p95 ≤ 873ms |

- **정상 운영 요청량**은 작다: Realtime 이 살아 있으면 각 기기가 watchdog 으로 15초마다 `game_state` 1회 → 32대 = **2.1 req/s**. Realtime 이 죽어 전원 5초 폴링으로 내려가도 **6.4 req/s**. 측정한 96 동시 버스트가 p95 700ms 였으므로 여유가 크다.
- **쓰기 경합 없음**: 팀마다 자기 `answers` 행과 자기 `team_progress` 행만 갱신한다. 같은 팀 두 기기의 동시 제출은 `unique(team_id, case_id)` 가 막는다.
- **DB 규모**: `teams` 33 · `answers` 최대 495행 · `team_progress` 33 → 인덱스·뷰 최적화가 필요한 수준이 아니다.
- **`games` 는 Realtime publication 에 정상 등록돼 있다**(전파 32/32 로 확인). 설령 빠지더라도 전원 5초 폴링이 흡수해 최대 5초 지연으로 시작된다 — 치명적이지 않다.

**시뮬레이션 방법(재현용)**: anon 키 + `@supabase/supabase-js` 로 32 클라이언트를 만들어 `claim_team`(기기 ID 32개 분리) → `get_cases` → `my_progress` → `submit_answer` → `release_team` 순으로 동시 호출한다. ⚠️ **`claim_team` 은 같은 `device_id` 가 쥔 다른 팀의 점유를 지운다**(`0001_init.sql:227`) — 기기 ID 를 분리하지 않으면 서로 점유를 뺏어 측정이 무의미해진다. 뒷정리는 `release_team`(점유) + 관리자 [전부 초기화](제출·점수)다.

**남은 변수**: 참가자가 각자 다른 장소에서 접속하면 행사장 WiFi 병목은 성립하지 않는다(운영 확인). 남는 것은 개별 회선 품질뿐이며, 에셋 총량은 `public/` 36MB(오디오 26MB)다.
