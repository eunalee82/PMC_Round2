# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> 이 문서는 **개발 가이드**입니다. 게임의 스토리·플로우·화면 사양은 `docs/`에 정의되어 있으므로 **원본을 복사하지 않고 참조**합니다.
> - 세계관·목표·연출 컨셉 → `docs/game-story.md`
> - 전체 진행 순서·상태·점수·예외 처리 → `docs/game-flow.md`
> - 화면(SCR-*)·모달·컴포넌트·라우팅·접근권한 → `docs/screen-list.md`
> - 에셋 목록·경로·상태 → `docs/assets-list.md`
>
> **구현 판단이 필요할 때는 이 CLAUDE.md의 규칙을 먼저 따르고, 세부 사양은 위 문서를 근거로 삼습니다.**

---

## 1. 프로젝트 개요 및 목표

**PM Protection Bureau (PM보호국)** — PMBOK® 8th Edition 기반 PM 역량 검증 **크라임씬 게임**. 교육용 실시간 컴페티션으로, 참가자는 "시험 응시자"가 아니라 **PM보호국 신입 수사관**이 되어 프로젝트 현장의 "사건"을 해결한다.

- **최종 목표(제품)**: 여러 팀이 동시에 참여하는 행사에서, Opening → 팀 선택 → 서약 → 대기 → Stage 1~3 → 아이템 획득 → 감독관 임명 → Final Raid → 엔딩 → 랭킹까지 **끊김 없는 몰입형 플로우**를 제공한다.
- **핵심 품질 목표**: (1) AAA 게임/비밀기관 HUD 수준의 몰입감, (2) 행사 운영 안정성(관리자 제어, 새로고침 복구, 종료 시간 강제), (3) 정답·점수의 서버 보호.
- **비목표(Non-goals)**: 일반 퀴즈/설문 UI, 자유로운 화면 이동, 클라이언트에서의 채점.

**개발 원칙 관점의 함의**: "화면을 만든다"가 아니라 "**상태 기계(state machine)를 만들고 각 상태에 화면을 바인딩한다**"로 접근한다. 게임 상태(`docs/game-flow.md §4`)와 팀 진행 상태(`§5`)가 시스템의 척추다.

---

## 2. 개발 원칙

1. **서버가 진실의 원천(Source of Truth)이다.** 진행 단계·점수·정답·아이템·랭킹은 항상 서버(Supabase)가 판정·저장한다. 클라이언트는 표현과 입력만 담당한다.
2. **모든 화면은 재진입 가능(resumable)해야 한다.** 새로고침·기기 변경·재접속 시 서버의 마지막 저장 지점으로 복구된다. "로컬 메모리에만 있는 진행 상태"를 만들지 않는다.
3. **접근은 상태로 통제한다.** URL 직접 접근을 막고, 서버가 인정한 진행 단계에 맞는 화면으로 되돌린다(`docs/screen-list.md §9`).
4. **연출과 로직을 분리한다.** 애니메이션/사운드가 실패하거나 꺼져도 게임 진행은 가능해야 한다(대체 콘텐츠 필수).
5. **점진적 구현.** `docs`의 Phase/우선순위를 존중하되, 각 단계는 "정적 흐름 → 데이터 → 서버 → 관리자 → 연출" 순으로 쌓는다(§16 참조).
6. **행사 안정성 > 게임 난이도.** Final Raid는 클릭 수와 무관하게 최종 성공하도록 설계한다. 예외 상황(네트워크·영상·오디오·시간 종료)은 항상 graceful하게 처리한다.
7. **결정은 명시적으로.** 사양이 모호하면 이 문서에 규칙을 추가하고, 임의 구현을 흩뿌리지 않는다.

---

## 3. 코딩 스타일 및 규칙

- **언어/모듈**: Vanilla JavaScript, ES Modules (`package.json` `"type": "module"`). 프레임워크(React/Vue 등)를 **임의로 도입하지 않는다.** 필요 시 반드시 사전 합의.
- **포맷**: Vite 스캐폴드 스타일을 따른다 → **2-space 들여쓰기, 세미콜론 없음, 작은따옴표(`'`)**. 혼용 금지.
- **네이밍**
  - 파일: `kebab-case.js` / `kebab-case.css`
  - 변수·함수: `camelCase`
  - 컴포넌트 팩토리 함수: `createPascalCase` (예: `createLeftSidebar`)
  - 상수: `UPPER_SNAKE_CASE`
  - CSS 커스텀 프로퍼티(토큰): `--kebab-case`
- **주석**: "무엇"이 아니라 "왜"를 남긴다. 사양 근거는 `// see docs/game-flow.md §7.3`처럼 문서를 링크한다.
- **금지 사항**: 인라인 스타일 남발(디자인 토큰 사용), 매직 넘버(상수화), `innerHTML`에 **미검증 사용자 입력** 주입(서명/팀명 등은 반드시 escape 또는 `textContent`).
- **비동기**: `async/await` 사용. 서버 호출은 항상 실패 경로(try/catch + 사용자 안내)를 갖는다.

---

## 4. UI/UX 설계 원칙

- **몰입 우선(`docs/game-story.md §12`)**: 교육 사이트처럼 보이면 안 된다. 비밀기관 시스템 / 사건 수사 대시보드 / Mission Control / 게임 HUD 톤을 유지한다.
- **행동 언어**: 모든 버튼은 "Mission 수행"처럼 느껴져야 한다. 라벨은 게임 용어(§15)를 사용한다(예: `[판단 제출]`, `[다음 사건 조사]`).
- **정보 위계**: 획득한 배지·아이템이 가장 강하게 빛나도록, 배경은 항상 어둡게 유지한다.
- **반응형 필수**: Desktop(1920×1080 기준) 3단 → Tablet 2단(우측 접기) → Mobile 중앙 우선 + 패널 Drawer(`docs/screen-list.md §2.4, SCR-006`). 노트북 1366×768에서 주요 콘텐츠가 잘리지 않아야 한다.
- **상태 표현 의무**: 모든 인터랙션 요소는 Hover / Focus / Disabled / Loading / Error 상태를 갖는다.
- **접근성**: 키보드 조작 가능, 포커스 링 유지, 영상·이미지·오디오에 텍스트 대체(자막/브리핑) 제공, `prefers-reduced-motion` 존중.
- **오답 연출 절제**: 실패를 과하게 벌주지 않는다(짧은 Red 경고 수준, `SCR-011`).

---

## 5. 디자인 시스템 규칙

모든 색·간격·타이포는 **CSS 토큰(`src/css/tokens.css`)으로 정의하고 참조**한다. 하드코딩 색상 금지.

**기본 배경/보더 (다크 테마 고정)** — `docs/screen-list.md §2.2`
```
--bg-primary:   #08090D
--bg-secondary: #11131A
--bg-panel:     #151822
--border:       rgba(255,255,255,0.08)
```

**Stage 액센트 컬러 (포인트로만 사용, 배경은 항상 다크)** — `docs/game-flow.md §21`
| 국면 | 컬러 |
|---|---|
| Stage 1 · Mindset | Purple / Blue |
| Stage 2 · Performance Domain | Cyan / Electric Blue |
| Stage 3 · AI Use Case | Green / Neon Green |
| Final Raid | Red / Crimson |
| Ending / Badge | Gold |

**규칙**
- Stage 컬러는 CSS 변수(`--accent-stage`)로 두고, Stage 전환 시 이 변수만 교체한다. 개별 컴포넌트에 색을 박지 않는다.
- 획득한 Badge/Item에는 **Glow 효과**를 적용한다(미획득은 잠금/무채색).
- 토큰 카테고리: color, typography(font-size/line-height/weight), spacing(4px 배수 스케일), radius, shadow/glow, z-index(레이어 상수화: base < panel < header < modal < overlay < raid-fx).
- 컴포넌트는 토큰을 **소비만** 한다. 새 색이 필요하면 토큰을 먼저 추가한다.

---

## 6. 프로젝트 폴더 구조

현재 생성된 구조(`src/css`, `src/js`, `src/components`, `public/...`, `supabase/`, `docs/`, `design/`)를 기준으로 아래 규약을 따른다.

```
PMC_ROUND2/
├─ index.html               # #app 마운트, /src/main.js 진입
├─ src/
│  ├─ main.js               # 부트스트랩: store 하이드레이트 → router 시작
│  ├─ css/
│  │  ├─ tokens.css         # 디자인 토큰(색/타이포/spacing/z-index)
│  │  ├─ base.css           # reset + 전역 요소
│  │  ├─ layout.css         # 3단 레이아웃 + 반응형
│  │  └─ animations.css     # 공통 keyframes / 전환
│  ├─ js/
│  │  ├─ router.js          # History 기반 라우터 + 접근 가드
│  │  ├─ routes.js          # 경로 ↔ 화면 매핑 (docs/screen-list.md §8)
│  │  ├─ store/             # 전역 상태(observable) + 게임/팀 상태
│  │  ├─ lib/
│  │  │  ├─ supabase.js     # Supabase 클라이언트 (env)
│  │  │  ├─ realtime.js     # 실시간 구독 헬퍼
│  │  │  └─ audio.js        # AudioManager (BGM/SFX, mute 유지)
│  │  ├─ constants/
│  │  │  ├─ assets.js       # 에셋 경로 상수(§14)
│  │  │  ├─ stages.js       # Stage/컬러/아이템 메타
│  │  │  └─ terms.js        # 게임 용어 매핑(§15)
│  │  ├─ screens/           # 화면 단위(SCR-*) 진입 로직
│  │  │  ├─ participant/    #   SCR-001~005 입장 흐름
│  │  │  ├─ gameplay/       #   SCR-007~013 Stage 컨트롤러
│  │  │  ├─ finale/         #   SCR-015~020·023 임명·Raid·금배지·종료 안내
│  │  │  └─ admin/          #   ?admin 콘솔 + 최종 랭킹(SCR-022, 감독관 전용)
│  │  ├─ utils/             # dom 헬퍼, 포맷터 등
│  │  └─ data/              # 샘플 문제 JSON 등(정답 제외)
│  └─ components/           # 재사용 UI 컴포넌트(docs/screen-list.md §7)
├─ scripts/                 # 개발용 Node 스크립트 (npm run validate 등, 런타임 코드 아님)
├─ public/                  # 웹 루트로 그대로 서빙 (절대경로 참조)
│  ├─ images/{backgrounds,logos,characters,badges,icons,ui,questions}/
│  ├─ audio/{bgm,sfx}/
│  └─ videos/
├─ supabase/                # DB 스키마/마이그레이션/정책(SQL), Edge Functions
├─ docs/                    # 사양 문서(진실의 원천, 코드보다 우선)
└─ design/                  # 디자인 시안/레퍼런스
```

**규칙**
- `public/`는 **웹 루트로 서빙**된다 → 런타임 에셋은 항상 절대경로(`/images/...`, `/audio/...`, `/videos/...`)로 참조하고 `import`하지 않는다.
- `src/assets/`는 번들·해시가 필요한 에셋(로고 SVG 등) `import` 전용.
- 화면(screens)은 "라우트에 대응하는 조립 로직", 컴포넌트(components)는 "재사용 UI 조각". 화면이 컴포넌트를 조립한다.

---

## 7. 아키텍처 원칙

- **레이어 분리**
  1. **Data/Server 레이어** (`lib/supabase.js`, `supabase/`): DB, RLS, RPC/Edge Function 채점.
  2. **State 레이어** (`store/`): 서버 상태의 클라이언트 캐시 + 실시간 반영. UI는 여기만 구독.
  3. **Routing 레이어** (`router.js`): 게임/팀 상태 기반 접근 가드.
  4. **View 레이어** (`screens/`, `components/`): 상태를 렌더링, 사용자 입력을 액션으로 변환.
- **단방향 데이터 흐름**: `사용자 입력 → 서버 액션 → 서버 판정/저장 → (실시간/응답) store 갱신 → View 리렌더`. View가 서버 상태를 직접 낙관적으로 확정하지 않는다(제출 결과는 서버 응답으로 확정).
- **상태 기계 중심**: 게임 상태(`scheduled|pledge_open|waiting_room|started|final_raid|ended`)와 팀 상태(`team_selected … completed`)를 명시적 enum 상수로 두고, 라우터·화면이 이를 근거로 전환한다.
- **라우팅**: History API 기반 커스텀 라우터. 경로 구조는 `docs/screen-list.md §8`을 따르되, **진입 시 서버 상태를 검증**하고 불일치하면 허용된 화면으로 리다이렉트한다.
  - 현재 step enum(`src/js/constants/flow.js`): `entry → opening → team → oath → waiting`(입장 흐름 `FLOW_ORDER`) + `case`(Stage 1~3) + `appoint → raid → ending`(종반부 `FINALE_ORDER`). 참가자 흐름은 금배지 수여(`ending`)의 [예선 2라운드 끝내기]에서 끝난다.
  - **최종 랭킹(SCR-022)은 참가자 화면이 아니다** — 감독관(운영진)이 관리자 콘솔 `?admin`에서 발표한다(`src/js/screens/admin/ranking.js`). 참가자에게 순위를 노출하는 화면을 새로 만들지 않는다.
  - `resolveStep(step, session, facts)`는 순수 함수로 유지한다. 판정에 필요한 상태(`gameStarted`·`stagesCleared`·`finale`)는 **호출자(`flow.js`)가 읽어 넘긴다** — `constants/`는 상태 모듈을 import하지 않는다.
  - 스테이지 완료 판정은 `src/js/lib/stage-progress.js`가 단일 출처다. 라우터 가드와 게임플레이 컨트롤러가 같은 함수를 써야 "다 풀었는데 잠김 / 안 풀었는데 진입"이 생기지 않는다.
- **의존 방향**: View → State → Data 단방향. 하위 레이어가 상위를 import하지 않는다.

---

## 8. 상태(State) 관리 원칙

- **단일 스토어 + 구독(pub/sub)**: 프레임워크 없이 가벼운 observable store를 둔다. `store.getState()`, `store.setState(patch)`, `store.subscribe(fn)` 형태. 컴포넌트는 마운트 시 구독, 언마운트 시 해제.
- **상태 분류**
  - **서버 상태(권위 있음)**: game.status, 팀 진행 상태, 점수, 아이템, 랭킹 → 서버에서 받아 store에 캐시. 절대 클라이언트가 최종 확정하지 않는다.
  - **세션 UI 상태**: 음소거, 볼륨, 전체화면, 현재 화면 → 로컬(예: `localStorage`) 유지. **음소거는 전체 게임 동안 유지**(`docs/game-flow.md §22`).
  - **임시 뷰 상태**: 선택 중인 보기, 모달 open 등 → 컴포넌트 로컬.
- **실시간 동기화**: `waiting_room`·랭킹·게임 상태는 Supabase Realtime 구독으로 새로고침 없이 반영한다(`SCR-005`). 관리자 Start → 자동 화면 전환.
- **복구(Rehydrate)**: 앱 시작 시 서버에서 (내 팀의) 진행 상태를 조회해 store를 채우고, 라우터가 해당 화면으로 이동한다.
- **저장 시점**: 팀 선택 / 서약 완료 / Mission 시작 / 답안 제출 / 사건 완료 / Stage 완료 / 아이템 획득 / 감독관 임명 / Raid 시작·완료 / 게임 종료 직후 서버 저장(`docs/game-flow.md §18`).
- **중복 방지**: 이미 제출한 사건은 재제출 불가(서버 유니크 제약 + 클라이언트 가드 이중화).

---

## 9. 컴포넌트 설계 원칙

프레임워크가 없으므로 **일관된 컴포넌트 계약(contract)**을 강제한다.

- **팩토리 함수 패턴**: `createXxx(props) → { el, mount(parent), update(state), destroy() }`
  - `el`: 컴포넌트 루트 DOM.
  - `mount`: 부모에 부착.
  - `update`: 상태 변경 반영(전체 innerHTML 교체 대신 필요한 노드만 갱신 지향).
  - `destroy`: **이벤트 리스너·구독·타이머 해제**(메모리/좀비 구독 방지). 필수.
- **props로 주입, 전역 접근 금지**: 컴포넌트는 store를 직접 참조하지 말고, 화면(screen)이 구독→props/update로 내려준다. (공용 매니저인 AudioManager 정도만 예외.)
- **표현/로직 분리**: 컴포넌트는 "받은 데이터를 그린다". 채점·판정·라우팅 결정은 하지 않는다.
- **재사용 목록 준수**: `docs/screen-list.md §7`의 공통 컴포넌트(AppHeader, LeftSidebar, RightInfoPanel, CaseCard, QuestionChoice, EvidenceViewer, ItemSlot, HealthBar 등)를 기준으로 만든다. 새 컴포넌트를 만들기 전에 이 목록을 먼저 확인한다.
- **HTML 주입 안전**: 동적 텍스트(팀명·서명 등)는 `textContent`로. 템플릿 문자열 + `innerHTML`은 **정적/신뢰 데이터에만**.
- **DOM 헬퍼 사용**: `utils/dom.js`의 `el(tag, attrs, children)` 헬퍼로 생성해 이벤트 바인딩/정리를 일관화한다.

---

## 10. Supabase 연동 원칙

- **클라이언트 초기화**: `src/js/lib/supabase.js`에서 단일 인스턴스. 키는 **환경변수**로 주입한다.
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...   # anon/publishable 키만 (공개 안전)
  ```
  `.env.local`(gitignore) 사용, `.env.example`에 키 이름만 커밋. **`service_role` 키는 클라이언트/저장소에 절대 두지 않는다.**
- **채점은 서버에서만**: 정답·해설·배점은 클라이언트 번들과 문제 조회 응답에 포함하지 않는다. 답안 제출은 **Postgres RPC(SECURITY DEFINER) 또는 Edge Function**으로 처리하여 서버에서 정답 판정·점수 계산·팀 총점/Stage 점수 갱신·다음 사건 권한 부여를 수행한다(`docs/game-flow.md §7.3`).
- **RLS 필수**: 모든 테이블에 Row Level Security. 참가자는 자기 팀 데이터만 읽기/쓰기. 정답이 담긴 컬럼/테이블은 anon 역할에서 조회 불가. 관리자 전용 테이블·기능은 관리자 role/정책으로 분리.
- **접근 제어 이중화**: 순차 진행(이전 Stage 미통과 시 다음 Stage 차단)은 클라이언트 가드 + **서버 정책/RPC 검증** 둘 다.
- **실시간**: game 상태, 팀 진행/점수, 랭킹은 Realtime 채널 구독. 종료 시각 도달·관리자 End 시 서버가 상태를 바꾸면 클라이언트가 반응.
- **스키마 관리**: 테이블/정책/함수는 `supabase/`에 SQL(마이그레이션)로 버전 관리. 임시로 대시보드에서만 바꾸지 않는다.
- **핵심 엔터티(초안)**: `teams`, `team_entries`(팀×1 유니크 — 입장/점유), `game`(단일 상태 로우), `questions`(정답 분리), `submissions`(팀×사건 유니크), `items`, `rankings(view)`. 실제 스키마는 구현 시 확정하고 이 문서에 반영.
- **팀 입장(확정, 2026-08-03)**: 팀별 비밀번호를 쓰지 않는다. **팀 선택 + 팀원 3명 전체 이메일 등록 = 입장**이고, 등록한 기기가 그 팀을 **점유**한다(팀당 1기기 · 기기당 1팀). 다른 기기는 **등록된 이메일 중 하나**를 입력해야 인계받는다(배포 없는 자연 비밀번호). 입력은 정규화 후 **빈칸·팀 내 중복만 차단**하고 형식 의심은 통과시키되 플래그를 남긴다. 같은 이메일이 2개 팀에 등록되면 팀 오선택 신호로 표시해 운영진이 **시작 전에 정정**한다. 상세는 `docs/screen-list.md SCR-003`·`docs/implementation-plan.md §8.5`, 클라이언트 격리 지점은 `src/js/lib/entries.js`(서버 이관 시 이 파일 내부만 RPC로 교체).

---

## 11. 보안 규칙

1. **정답/배점 비노출**: 문제 조회 API/번들에 정답·해설·점수 로직을 포함하지 않는다. 오직 서버 판정 후 결과 화면에서 필요한 만큼만 반환.
2. **서버 검증 우선**: 제출 가능 시간, 게임 진행 여부, 중복 제출, 순차 진행, 종료 시각 이후 차단은 모두 **서버가 최종 판정**. 클라이언트 검사는 UX 보조.
3. **RLS로 데이터 격리**: 팀 간 데이터 열람 불가, 관리자 기능은 관리자에게만.
4. **관리자 인증 분리**: 관리자 로그인(`SCR-101`)은 Supabase Auth 등으로 분리. 관리자 제어(Start/End/Raid)는 서버에서 권한 확인.
5. **입력 신뢰 금지**: 서명·팀명 등 사용자 입력은 escape/`textContent` 처리(XSS 방지). URL 파라미터도 검증.
6. **비밀정보 관리**: `service_role`·관리자 크리덴셜은 저장소/클라이언트 금지. env는 `.env.local`만, 커밋 금지.
7. **정보 최소 노출**: 오류 메시지에 내부 구조/SQL을 드러내지 않는다.

---

## 12. 성능 최적화 원칙

- **에셋 무게 관리**: 이미지(WebP/AVIF 우선, 적정 해상도), 오디오·비디오는 웹 최적화 인코딩. 대용량 원본을 그대로 서빙하지 않는다.
- **로딩 전략**: Entry/Opening/배지 등 **첫 임팩트 에셋은 프리로드**, Stage별·후반 에셋은 지연 로드(현재 Stage 진입 시점 등). 코드도 화면 단위 lazy import 고려.
- **미디어**: 비디오는 `poster` 지정, 자동재생은 muted로 시도 후 사용자 제스처로 unmute(`docs/game-flow.md §6.2`). 오디오는 사용자 상호작용 이후 재생(브라우저 정책).
- **렌더링**: 잦은 `innerHTML` 전체 교체 지양, 필요한 노드만 갱신. 리스트(랭킹)는 diff 최소화.
- **애니메이션 성능**: `transform`/`opacity` 위주(레이아웃 리플로우 유발 속성 지양), `requestAnimationFrame` 사용, Glow는 GPU 친화적으로. Final Raid의 연타·흔들림은 이벤트 스로틀/rAF로 처리.
- **네트워크**: 실시간 구독은 필요한 채널만. 폴링 대신 Realtime. 재접속 시 백오프.
- **측정 우선**: 최적화는 추정이 아니라 측정(로딩/프레임) 근거로.

---

## 13. 애니메이션 및 사운드 구현 원칙

**애니메이션**
- **전환 시간(`docs/game-flow.md §21`)**: 일반 화면 전환 300~700ms, 중요 연출(아이템 획득·감독관 임명·금배지)은 2~5초 허용.
- **전환 유형**: Fade / Slide / Blur / Scan Line. Stage 전환은 해당 Stage 컬러가 확산되는 효과.
- **구현**: CSS `transition`/`@keyframes`(`animations.css`) + 복잡한 시퀀스는 Web Animations API. 타임라인/상수는 코드에서 관리.
- **접근성**: `prefers-reduced-motion: reduce`면 화면 흔들림·과한 파티클을 줄이고 즉시 전환으로 대체. 로직 진행은 애니메이션 완료에 의존하되 **타임아웃 fallback**을 둔다(연출이 멈춰도 게임이 멈추지 않게).

**사운드(`docs/game-flow.md §22`)**
- **AudioManager 단일화**: BGM/SFX 재생·정지·볼륨·음소거를 한 곳에서 관리. 음소거 상태는 세션 내내 유지.
- **매핑**: Opening/서약 → `Opening.mp3`(loop), Stage 통과 → `Quizpass.mp3`, Final Raid → `Killbillian.mp3`, 성공/실패/획득/임명은 SFX.
- **정책 대응**: 첫 사용자 제스처 전에는 오디오를 강제 재생하지 않는다(권한 모달 `MOD-002`). 실패 시 조용히 무음 진행.
- **대체 수단**: 오디오 단서는 재생/일시정지/다시듣기/볼륨/자막(녹취록) 제공(`docs/game-flow.md §19.3`).

---

## 14. 에셋 관리 규칙

- **경로 상수화**: 런타임 에셋 경로는 `src/js/constants/assets.js`에 상수로 모으고, 화면/컴포넌트는 상수만 참조한다. 경로 하드코딩 산재 금지.
- **매니페스트 동기화**: 추가/변경 시 `docs/assets-list.md`(정본 매니페스트)를 갱신한다(파일·용도·상태). **문서·코드 상수·실제 파일명은 항상 일치**시킨다.
  - ✅ 파일명은 `kebab-case`로 통일 완료. 배포 대상(Vercel/Linux)은 대소문자를 구분하므로 새 에셋도 반드시 소문자 kebab-case로 추가한다.
  - 주의할 실제 경로: 로고/사건 배경은 `logos/`가 아니라 **`/images/backgrounds/logo.png`, `/images/backgrounds/question-bg.png`**에 있고, Stage 1·2 통과 배경은 확장자가 **`.jpg`**(`/images/backgrounds/one-pass.jpg`)다. 경로 상수(`src/js/constants/assets.js`)를 단일 출처로 삼는다.
- **폴더 규약**: 배경 `images/backgrounds`, 로고 `images/logos`, 캐릭터 `images/characters`, 배지 `images/badges`, 아이콘 `images/icons`, UI `images/ui`, 문제단서 `images/questions`, BGM `audio/bgm`, SFX `audio/sfx`, 영상 `videos`.
- **누락 대비**: 엔딩 영상 등 "미정" 에셋은 대체 콘텐츠 경로를 함께 준비(`docs/game-flow.md §14.3`). 로딩 실패 시 placeholder/텍스트 대체.

---

## 15. 게임 용어 규칙 (매우 중요)

**사용자에게 보이는 모든 텍스트는 아래 게임 용어를 사용한다.** 일반 퀴즈 용어(문제/정답/제출/점수)를 UI에 노출하지 않는다. (`docs/game-flow.md §3.3`, `docs/game-story.md §11`)

| 일반 용어 | 게임 내 표현(UI) | 코드 식별자(내부) |
|---|---|---|
| 문제 | **사건** (Case) | `case` / `question` |
| 문제 번호 | **사건 번호** | `caseNo` |
| 정답 | **사건 해결** (CASE RESOLVED) | `isCorrect` |
| 오답 | **추가 조사 필요** (ADDITIONAL INVESTIGATION REQUIRED) | `isIncorrect` |
| 해설 | **사건 분석 보고서** | `analysis` |
| 제출 | **판단 제출** | `submit` |
| 다음 문제 | **다음 사건 조사** | `nextCase` |
| 점수 | **Investigation Score** | `score` |
| Stage | **Mission** | `stage` |
| 아이템 | **Evidence / Equipment** | `item` |
| 응시자 | **신입 수사관 → (정식) 감독관** | `agent` |

**규칙**: UI 문자열은 `src/js/constants/terms.js`에 모아 한 곳에서 관리(오탈자·톤 일관성). 코드 식별자는 중립 영어를 써도 되지만, **화면 출력 시점에 반드시 게임 용어로 변환**한다.

---

## 16. 권장 개발 순서

`docs`의 Phase(§23)와 화면 우선순위(`screen-list.md §10~11`)를 개발 관점으로 재구성:

**Step 0 — 기반(먼저 반드시)**
- 디자인 토큰(`tokens.css`) + 3단 레이아웃 + 공통 애니메이션 스캐폴드
- 라우터 + 라우트 테이블 + 접근 가드(더미 상태로)
- store(observable) + 게임/팀 상태 enum 상수
- Supabase 클라이언트(`lib/supabase.js`) + env 셋업
- 에셋/용어/스테이지 상수 정리, 실제 파일명 정합성 확인(§14)

**Step 1 — 정적 참가자 흐름(MVP 화면, 서버는 mock)**
- Entry → Opening → Team → Oath → Waiting → Stage Briefing → Case → 결과(성공/추가조사) → Stage Result → Item → (Officer → Raid → Badge → Ranking)
- 공통 컴포넌트(AppHeader/LeftSidebar/RightInfoPanel/CaseCard/EvidenceViewer/ItemSlot) 구축

**Step 2 — 문제(사건) 엔진**
- 사건 데이터 스키마 확정, 단서 유형(video/image/audio/document/text/mixed) 뷰어, 객관식 선택·판단 제출 UX (정답은 아직 클라이언트에 없음)

**Step 3 — 서버 연결**
- 팀/서약/게임 상태/제출·채점(RPC·Edge Function)/점수/아이템/랭킹, RLS 정책, 실시간 구독, 새로고침 복구

**Step 4 — 관리자**
- Admin Login/Dashboard/Game Control(Start·End 확인 모달)/Team Monitor/Ranking Control (+ 이후 Question 관리, Asset Preview, System Test)

**Step 5 — 연출 강화**
- Stage 전환/아이템 획득/감독관 임명/긴급 경보 Glitch/Final Raid 타격감/금배지 수여/사운드

각 Step은 "완료 기준(§17)"을 통과해야 다음으로 넘어간다.

---

### 16.1 미확정 콘텐츠 · 테스트 도구 규칙 (확정, 2026-08-04)

- **미확정 콘텐츠는 '임시 데이터'로 명시한다.** 사건 데이터에 `placeholder: true`를 두면 사건 화면에 `임시 데이터` 배지가 붙는다(플래그를 지우면 배지도 사라진다). 임시 블록은 `src/js/data/cases.js` 안에서 주석으로 시작·끝을 표시하고, **데이터만 교체하면 되도록 엔진/구조는 건드리지 않는다.** 사건 수는 `STAGE_TOTALS`와 맞춰 점수 만점(300점 = 20점 × 15사건)을 깨지 않는다.
- **테스트용 단계 건너뛰기를 운영 코드에 남기지 않는다.** 진행 앞당기기는 DEV 전용 모듈(`src/components/dev/stage-jump.js`)에서 **정상 진행 상태를 미리 만드는 방식**으로만 구현한다(진행 판정 로직에 테스트 분기를 넣지 않는다). DEV 코드는 `import.meta.env.DEV` 가드 덕분에 프로덕션 번들에서 제거된다 — 새 DEV 기능을 추가하면 `dist`에서 문자열 검색으로 제거 여부를 확인한다.
- **검증은 스크립트로 반복 가능하게.** `npm run validate`(`scripts/validate.mjs`)가 사건 id 유일성·정답 인덱스 범위·보기 수·ko/en 정합·단서 미디어 파일 존재·UI 문구 키 누락을 점검한다. 콘텐츠를 추가·교체하면 `npm run build`와 함께 이 스크립트를 통과시킨다.
- **없는 에셋은 상수에 넣지 않는다.** 미제작 미디어(엔딩 영상 등)는 경로를 참조하는 대신 가용 플래그(`ASSETS.videos.endingAvailable`)로 게이트하고 대체 연출을 기본값으로 둔다 — 404를 만들지 않고, 파일이 도착하면 플래그만 바꾼다.

---

### 16.2 단서 이미지와 보기 텍스트 (확정, 2026-08-10)

**단서 이미지에 인쇄된 정보를 화면 텍스트로 다시 적지 않는다.** 보기(`choices`)는 이미지를 가리키는 **최소 라벨만** 둔다.

- 사건 #001 확정형: `[{ label: '단서 1' }, { label: '단서 2' }, { label: '단서 3' }, { label: '단서 4' }]`
- ❌ 금지: `{ label: '단서 1', desc: '프로젝트 일정 예측 대시보드' }` — 명패에 이미 인쇄된 단서명이다.

**왜**: (1) 같은 정보가 두 곳에 있으면 한쪽만 고쳐져 어긋난다(이미지는 교체 비용이 크다). (2) 더 중요한 이유 — 보기에 단서명을 적으면 참가자가 **이미지를 읽지 않고 라벨만 보고 답을 고른다.** 이 사건은 "현장 자료를 실제로 판독하는가"를 검증하므로 그 지름길을 만들면 문항이 무의미해진다.

**되돌리려는 유혹에 대한 답**: 2026-08-05에는 단서 이미지를 영문 1종으로 운영하는 대신 국문 화면에 `desc`로 한글 단서명을 짚어주기로 했었다(`docs/handoff.md §7.2`). 2026-08-10 이미지 교체로 명패에 단서명이 인쇄되면서 그 근거가 사라져 **결정을 뒤집었다**(§12.1). 옛 문서만 보고 `desc`를 되살리지 말 것.

**같은 계열의 규칙**: `fileNo`는 **이미지에 인쇄된 `CASE FILE #NNN` 값에 맞춘다**(진행 순번 `caseNo`와 별개). 이미지를 교체하면 인쇄값을 확인하고 `fileNo`를 함께 고친다 — 어긋나면 참가자가 다른 사건으로 오인한다.

---

## 17. 테스트 체크리스트

새 화면/기능 완료 판정 기준 (`docs/screen-list.md §12`, `docs/game-flow.md §24` 기반):

**흐름·상태**
- [ ] 팀 선택 → 서약 → 대기 → 관리자 Start → Stage 1 순차 진행이 동작한다.
- [ ] 관리자 Start 전에는 문제(사건)에 접근할 수 없다.
- [ ] 이전 Stage 미통과 시 다음 Stage 접근이 서버에서 차단된다.
- [ ] 15개 사건 답안이 저장되고, Stage별·총 Investigation Score가 계산된다.
- [ ] Stage 완료 후(최소 1문제 정답 시) 아이템이 사이드 패널에 활성화된다.
- [ ] Stage 3 완료 → 감독관 임명 → Final Raid(20초) → 빌런왕 격퇴 → 금배지 → 최종 랭킹까지 이어진다.

**복구·예외**
- [ ] 새로고침/재접속 후 서버 저장 지점으로 복구된다.
- [ ] 게임 종료 시각 이후 답안 제출이 차단된다.
- [ ] 이미 제출한 사건은 재제출되지 않는다.
- [ ] 현재 상태와 맞지 않는 직접 URL 접근이 차단·리다이렉트된다.
- [ ] 네트워크 끊김/영상 실패/오디오 실패 시 안내와 대체 수단이 동작한다.

**UI·품질**
- [ ] 데스크톱 1920×1080 정상, 노트북 1366×768 콘텐츠 미절단, 태블릿·모바일 조작 가능.
- [ ] Hover/Focus/Disabled/Loading/Error 상태 존재, 키보드 접근 가능.
- [ ] 음소거 설정이 화면 전환 후에도 유지된다.
- [ ] Stage 컬러는 포인트로만, 획득 배지/아이템에 Glow 적용.
- [ ] `prefers-reduced-motion`에서 과한 연출이 줄어든다.

**보안(수동 점검)**
- [ ] 네트워크 응답/번들에 정답·배점이 노출되지 않는다.
- [ ] RLS로 타 팀 데이터가 조회되지 않는다.

---

## 18. 코드 리뷰 체크리스트

- [ ] **서버 권위**: 진행/점수/정답 판정이 서버에 있는가? 클라이언트가 임의 확정하지 않는가?
- [ ] **상태 복구**: 이 변경이 새로고침·재접속 복구를 깨지 않는가? 저장 시점이 올바른가?
- [ ] **접근 제어**: 라우트 가드 + 서버 정책이 함께 걸려 있는가?
- [ ] **용어**: 사용자 노출 텍스트가 게임 용어(§15)를 따르며 `terms.js`를 경유하는가?
- [ ] **디자인 토큰**: 색/간격/타이포가 하드코딩 아니라 토큰인가? Stage 컬러는 변수 교체 방식인가?
- [ ] **컴포넌트 계약**: `destroy()`에서 리스너·구독·타이머를 정리하는가?(누수/좀비 구독 없음)
- [ ] **XSS**: 사용자 입력이 `textContent`/escape로 안전하게 렌더되는가?
- [ ] **에셋**: 런타임 경로가 상수/절대경로이고 실제 파일명과 일치하는가? `assets-list.md` 갱신했는가?
- [ ] **연출 독립성**: 애니메이션/사운드가 실패·비활성이어도 게임이 진행되는가? 대체 콘텐츠가 있는가?
- [ ] **에러 경로**: 서버 호출에 실패 처리와 사용자 안내가 있는가?
- [ ] **보안**: 정답/service_role/비밀키가 코드·응답에 새지 않는가?
- [ ] **성능**: 대용량 에셋·불필요한 전체 리렌더·과도한 구독이 없는가?
- [ ] **문서 정합**: 사양과 다르게 구현했다면 근거가 있고 문서/이 CLAUDE.md에 반영했는가?

---

_이 문서는 개발이 진행되며 확정되는 결정(스키마, 컴포넌트 계약 세부, 라우트 확정 등)을 지속적으로 반영해 최신 상태로 유지한다._
