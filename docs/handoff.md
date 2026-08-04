# 세션 핸드오프 (2026-08-04)

새 창(새 세션)에서 이어서 작업하기 위한 인수인계 기록. **먼저 `CLAUDE.md`와 이 문서를 읽고 시작할 것.**

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
- **게임 상태**: `src/js/lib/game.js` (MOCK, localStorage). `scheduled|started` + `startedAt`. `startGame/resetGame/ensureStarted`, `remainingSeconds`(60분). 대기실이 구독 → started면 자동 전환.
- **셸/좌측 패널**: `src/components/shell/{app-shell,app-header,left-sidebar}.js`. 게임플레이만 셸 사용. 헤더: 미션 타이머(진입 시 60분 카운트다운) + 소리 볼륨/음소거 팝오버. (종·설정 아이콘 제거됨)
- **캡처 억제**: `src/components/game/capture-guard.js` — 워터마크(팀명·시각) + 전체화면 게이트(벗어나면 가림) + 복사/우클릭 차단 + PrtScn 경고. (원천 차단 아님, 억제 수준)
- **관리자**: `src/js/screens/admin/admin.js` — `?admin` 진입, 비번 `2026`, 게임 시작/대기 되돌리기. ⚠️ mock이라 **같은 브라우저 탭 사이에서만** 전파(다른 기기 X → Supabase 필요).
- **i18n**: `src/js/lib/i18n.js`(로케일 ko/en) + `constants/copy.js`(`COPY={ko,en}`, en 없으면 ko 폴백) + `lib/copy.js`(로케일 대응 t). 전환: `?lang=en` / 입장 화면 국문·영문 선택 / DEV 언어 토글(reload).
- **오프닝**: `src/js/screens/participant/opening.js` — 로컬 영상 대신 **YouTube 임베드**(`ASSETS.videos.openingEmbedId = 'Hm13qr-_0yI'`).

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
| 국문 전체 흐름 | Entry→…→Stage 1(3)→Stage 2(7)→Stage 3(5)→임명→레이드→금배지→종료: 300점·15/15 |
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
- **랭킹 기준**(`lib/progress.js getRanking`): 총점 → 정답 수 → 제출 완료 시각 → Raid 기여도(§15.1). Raid 타수는 **점수에 가산하지 않고** 표시·동점 처리에만 쓴다(300점 만점 유지).
- **스크롤 리셋**: 화면 스크롤 컨테이너는 `#flow-root`다. `flow.js`가 화면 전환 시, 각 컨트롤러는 하위 국면 전환 시 `ctx.scrollToTop()`으로 맨 위로 되돌린다(긴 랭킹 화면에서 중간부터 보이던 문제 수정).
