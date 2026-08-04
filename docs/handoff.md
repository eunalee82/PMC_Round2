# 세션 핸드오프 (2026-08-04)

새 창(새 세션)에서 이어서 작업하기 위한 인수인계 기록. **먼저 `CLAUDE.md`와 이 문서를 읽고 시작할 것.**

---

## 0. 지금 당장 알아야 할 것 (TL;DR)

- **Git 상태**: 로컬 `HEAD = d0ddc00` (워킹트리 clean, 최신 작업 전부 커밋됨).
  - `origin/main = 06ee0cf` → **`d0ddc00`은 아직 push 안 됨 (ahead 1)**.
  - **라이브 배포 = `06ee0cf` 상태** (Vercel). 즉 최신 커밋 `d0ddc00`(영문/언어선택/YouTube/이미지캡)은 **push·배포 안 됨**.
  - 사용자가 "정리하고 새 창에서 진행" 요청 → **임의로 push/deploy 하지 말 것.** 사용자가 지시하면 진행.
- **🔴 미해결 버그(P0)**: **사건 #014(Stage 1 Q2, 단서 이미지 4장)에서 보기(선택지)가 안 보임.** 이미지 `max-height` 제한(d0ddc00 포함)으로도 **해결 안 됨**. 원인 미확정 — 아래 §3 참고.
- **배포/실행**: 라이브 `https://pmc-round2.vercel.app`, 관리자 `?admin`(비번 `2026`), 로컬 `npm run dev`. Vercel 계정 `pingjueuna-3402`, 프로젝트 `pmc-round2`(CLI 배포, GitHub 자동배포 아직 미연결).

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
- **사건 데이터**: `src/js/data/cases.js` — CASES(본문, 정답 없음) + SOLUTIONS(정답·해설, `answerIndex` 0-기준) + `localizeCase`/`localizeAnalysis`(en 리졸버). Stage 1 = #007(이미지1·보기5·정답4) / #014(이미지4·보기4·정답3) / #021(이미지1+녹취4·보기4·정답4). Stage 3 = #011(녹취1·보기4·정답4, AI Adoption).
  - **사건 점프(DEV)**: Stage 2에 사건이 없어 정상 흐름으로는 Stage 3에 못 간다 → DEV 메뉴 `사건 · Stage 1/2/3` 버튼(`setDevStage()`, `case.js`)으로 직접 연다. 프로덕션 빌드에는 DEV 메뉴가 없다.
  - ⚠️ **Stage 3 완료 이후 흐름 미구현**: `STAGE_META[3]`에 보상 아이템이 없어 Stage Result → `보상 확인`을 누르면 빈 아이템 화면이 나온다. 감독관 임명 → Final Raid → 금배지가 아직 없어서다(다음 작업 후보).
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
| Stage 게임플레이 흐름 | `src/js/screens/gameplay/case.js` |
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

- **로컬**: `npm run dev` (Vite). `npm run build`로 검증.
- **DEV 메뉴**: 우하단 `DEV` 버튼, 비번 `2026`. JUMP TO SCREEN / GAMEPLAY(게임 시작·대기 되돌리기·사건 점프) / 팀·입장 관리 / COPY·LANG(언어 토글). ※ 프로덕션 빌드에서는 DEV 메뉴 제거됨 → 프로덕션 관리자 제어는 `?admin`.
- **관리자 콘솔**: `?admin` + 비번 `2026`. 게임 시작/대기 되돌리기(진행 초기화).
- **혼자 테스트**: 한 탭에서 참가자(대기실까지), 다른 탭 `?admin`에서 게임 시작 → 참가자 탭 자동 전환.
- **배포**: `npx vercel --prod --yes` (계정 `pingjueuna-3402`, 프로젝트 `pmc-round2`). GitHub 자동배포 미연결 → 코드 반영하려면 CLI 재배포 또는 Vercel에서 Git 연결.
- **언어**: `?lang=en` 또는 입장 화면 국문/영문 선택. en 미번역 키는 ko 폴백.

---

## 5. 알려진 한계 / 다음 후보

- **멀티 기기 미지원(중요)**: game/progress/entries가 전부 localStorage. 관리자 시작·점수·랭킹이 **다른 기기로 전파 안 됨**. 실제 행사(32팀 각자 기기)엔 **Supabase 연동(Step 3: 상태 테이블 + Realtime + 서버 채점) 필수.**
- **영문 단서 미디어**: question 이미지/녹취는 한국어 콘텐츠 → en 모드여도 그림/음성 속 텍스트는 한국어(영문 에셋 재제작 영역).
- **아직 en 미이관 문구**: 관리자 콘솔(운영자용), 팀 등록 모달 일부(수사관 N명 등), DEV 메뉴(내부). 필요 시 copy 키로 이관.
- **에셋 무게**: question 이미지 2MB급 → 배포 전 WebP/해상도 최적화 권장(§12).
- **후속 콘텐츠**: Stage 2(7사건)/Stage 3(5사건) 미제작. Stage 2 Briefing은 "사건 준비 중"으로 연결만 됨.
- **정답 노출**: 현재 SOLUTIONS가 클라이언트 번들에 있음(MOCK). 서버 연결 시 채점 RPC로 이관 필요(CLAUDE.md §11).
