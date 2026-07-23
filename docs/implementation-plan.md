# PM Protection Bureau — Implementation Plan (개발 계획서)

> 이 문서는 `CLAUDE.md`(개발 규칙)와 `docs/`(게임 사양)를 근거로, **"어떻게 만들 것인가"**를 정의하는 구현 청사진이다.
> 규칙·원칙은 `CLAUDE.md`, 게임 사양은 `game-story.md` / `game-flow.md` / `screen-list.md` / `assets-list.md`를 참조한다.
> 화면 레이아웃 기준은 프로젝트 루트의 **`LayOut.png`**(3단 대시보드 셸)를 따른다.
>
> 표기: 🔒 서버가 최종 판정 · 🎬 시네마틱(풀블리드) 화면 · 🧩 대시보드 셸 내부 화면 · ⚠️ 결정 필요(§12 참조)

---

## 1. 전체 시스템 아키텍처

### 1.1 구성 요소

```
┌───────────────────────────── Client (Vercel 정적 호스팅) ─────────────────────────────┐
│  Vite 번들 (Vanilla JS SPA)                                                           │
│  ┌──────────── Participant App ────────────┐   ┌──────── Admin App ────────┐           │
│  │  View(screens/components)                │   │  View(admin screens)      │           │
│  │        ↓ 구독/액션                        │   │        ↓                  │           │
│  │  State(store)  ←  Realtime 반영           │   │  State(store)             │           │
│  │        ↓                                  │   │        ↓                  │           │
│  │  Service(api/*)  →  Supabase JS client    │   │  Service(api/admin/*)     │           │
│  └──────────────────────────────────────────┘   └───────────────────────────┘           │
│  정적 에셋: /public → 웹 루트 (images / audio / videos)                                  │
└──────────────────────────────────────────────────────────────────────────────────────┘
                    │ HTTPS (REST/Realtime WS)              │ Auth (admin)
                    ▼                                       ▼
┌──────────────────────────────── Supabase (Backend) ───────────────────────────────────┐
│  Postgres  ── RLS 정책 ── Views(rankings)                                              │
│  RPC / Edge Functions  🔒 submit_answer · start_game · end_game · start_raid · ...      │
│  Realtime (Postgres Changes / Broadcast)  →  game.status, team progress, ranking        │
│  Auth  →  관리자 계정 (participant는 경량 세션 식별 ⚠️)                                  │
│  Storage(선택)  →  대용량/동적 에셋 (기본은 /public 사용)                                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 아키텍처 원칙 (요약, 상세는 `CLAUDE.md §7`)

- **서버 권위(Authoritative Server)**: 진행 단계·정답·점수·아이템·랭킹·시간 제어는 🔒 서버가 판정. 클라이언트는 표현/입력 + 낙관적 연출만.
- **단방향 흐름**: `입력 → Service(api) → Supabase RPC 🔒 → 결과/Realtime → store → View`.
- **상태 기계 중심**: `game.status`(전역) × `team_progress.state`(팀별)의 조합이 "지금 어떤 화면이 허용되는가"를 결정.
- **하나의 코드베이스, 두 앱**: 참가자용/관리자용을 라우트와 인증으로 분리. 공용 셸·store·디자인 토큰 재사용.
- **연출과 로직 분리**: 애니메이션/사운드 실패가 게임 진행을 막지 않음(타임아웃 fallback + 대체 콘텐츠).

### 1.3 배포 토폴로지

- **Frontend**: Vercel (GitHub `eunalee82/PMC_Round2` 연동, push 시 자동 배포). 빌드 `npm run build` → `dist/`.
- **Backend**: Supabase 프로젝트(무료/Pro). DB 마이그레이션은 `supabase/` SQL로 버전 관리.
- **환경변수**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 Vercel/`.env.local` 양쪽에 설정. `service_role`은 서버(Edge Function) 전용, 절대 클라이언트 금지.

---

## 2. 권장 폴더 구조

`CLAUDE.md §6`을 구현 관점으로 확장. (신규 추가: `api/`(서비스 레이어), `screens/admin/`, `mocks/`, `types/`, `supabase/` 세부)

```
PMC_ROUND2/
├─ index.html
├─ .env.local                     # VITE_SUPABASE_* (gitignore)
├─ .env.example                   # 키 이름만
├─ vercel.json                    # SPA rewrite (모든 경로 → /index.html)
├─ src/
│  ├─ main.js                     # 부트스트랩: env 검증 → store rehydrate → router.start()
│  ├─ css/
│  │  ├─ tokens.css               # 디자인 토큰 (color/type/space/z/glow)
│  │  ├─ base.css                 # reset + 전역 요소
│  │  ├─ layout.css               # AppShell 3단 그리드 + 반응형
│  │  ├─ animations.css           # keyframes / 전환 유틸
│  │  └─ screens/                 # (선택) 화면별 스타일 co-locate
│  ├─ js/
│  │  ├─ router.js                # History 라우터 + 가드 파이프라인
│  │  ├─ routes.js                # 경로 ↔ 화면 ↔ 가드 매핑 테이블
│  │  ├─ store/
│  │  │  ├─ index.js              # createStore(observable): get/set/subscribe/select
│  │  │  ├─ slices.js             # session/game/team/ranking/ui 초기 상태
│  │  │  └─ persist.js            # localStorage 동기화(mute/volume 등)
│  │  ├─ api/                     # Service 레이어 (Supabase 호출 캡슐화)
│  │  │  ├─ game.js               # 게임 상태 조회/구독
│  │  │  ├─ team.js               # 팀 선택/서약/진행 조회
│  │  │  ├─ cases.js              # 사건(문제) 조회(정답 제외)
│  │  │  ├─ submit.js             # 🔒 판단 제출 RPC
│  │  │  ├─ ranking.js            # 랭킹 조회/구독
│  │  │  └─ admin.js              # 관리자 제어 RPC
│  │  ├─ lib/
│  │  │  ├─ supabase.js           # 단일 클라이언트
│  │  │  ├─ realtime.js           # 채널 구독/해제 헬퍼
│  │  │  ├─ audio.js              # AudioManager (BGM/SFX/mute)
│  │  │  └─ fx.js                 # 전환/글로우/셰이크 연출 헬퍼
│  │  ├─ constants/
│  │  │  ├─ assets.js             # 에셋 경로 상수 (단일 출처)
│  │  │  ├─ stages.js             # Stage 메타(컬러/문항수/주제/아이템)
│  │  │  ├─ states.js             # game/team 상태 enum
│  │  │  └─ terms.js              # 게임 용어/UI 문자열
│  │  ├─ screens/
│  │  │  ├─ participant/          # SCR-001~023
│  │  │  └─ admin/                # SCR-101~110
│  │  ├─ utils/
│  │  │  ├─ dom.js                # el(), mount(), escape()
│  │  │  ├─ format.js             # 점수/시간 포맷
│  │  │  └─ guard.js              # 상태→허용화면 판정 로직
│  │  ├─ mocks/                   # Phase 1 정적 데이터(팀/사건/랭킹 샘플)
│  │  └─ types/                   # JSDoc typedef (엔터티/DTO)
│  └─ components/
│     ├─ shell/                   # AppHeader, LeftSidebar, RightInfoPanel, MobileNav
│     ├─ game/                    # CaseCard, EvidenceViewer, QuestionChoice, StageProgress, ...
│     ├─ item/                    # ItemSlot, ItemCard, BadgeDisplay, UnlockAnimation
│     ├─ raid/                    # VillainCharacter, HealthBar, AttackButton, DamageNumber
│     ├─ feedback/                # SuccessPanel, FailurePanel, Toast, ConfirmModal, LoadingOverlay
│     └─ primitives/              # Button, Icon, ProgressBar, Dropdown, Modal
├─ public/  (images/{...}, audio/{bgm,sfx}, videos/)   # assets-list.md 참조
├─ supabase/
│  ├─ migrations/                 # 0001_init.sql, 0002_rls.sql, ...
│  ├─ functions/                  # Edge Functions (필요 시)
│  └─ seed.sql                    # 팀/샘플 사건 시드
├─ docs/
└─ design/                        # LayOut.png 등 시안
```

---

## 3. 페이지 구조

### 3.1 레이아웃 기준 — `LayOut.png` (대시보드 셸)

```
┌──────────────────────────────────────────── AppHeader ───────────────────────────────────────────┐
│ [🛡 LG SW PM Competition 2026]   [● PM PROTECTION BUREAU ▾]        [🔔] [🔊] [⚙]                    │
├───────────────┬────────────────────────────────────────────────────┬───────────────────────────┤
│ LeftSidebar   │ MainContent (라우트별 화면이 렌더되는 outlet)          │ RightInfoPanel            │
│               │                                                      │                           │
│ TEAM NAME     │   ┌ hero (골드 PM 방패) ┐   PM보호국                  │  PMBOK 8th 3가지 관점      │
│  0 점          │   └───────────────────┘   프로젝트의 가치를 지키는…   │  현재 Stage 핵심 개념      │
│               │   ⚠ 긴급 사건 접수 — 15문항                           │  Agent Level              │
│ RANKING       │   ┌ 팀 선택 카드 ────────────┐                         │  진행률 / 도움말           │
│  1 서바이브 400 │   │ [— 팀을 선택하세요 ▾]     │                        │                           │
│  2 …          │   │ [◎ 사건 접수 시작]         │                        │                           │
│ STAGE SCORE   │   └──────────────────────────┘                         │                           │
│  🧠 Mindset 0/3│                                                       │                           │
│  🧊 Domain 0/7 │                                                       │                           │
│  🎯 AI 0/5     │                                                       │                           │
│ ITEMS         │                                                       │                           │
│  [S1][S2🔒][S3🔒]│                                                     │  EXP 0 / 100 ▓▓▁▁▁▁       │
│ Version 1.0.0 │                                                      │                           │
└───────────────┴────────────────────────────────────────────────────┴───────────────────────────┘
```

- **Left Sidebar는 게임플레이 전 구간에서 상시 고정**(Agent 정보 / Ranking / Stage Score / Items / Version). `docs/screen-list.md §2.4, SCR-006`과 일치.
- **Right Panel**: PMBOK 관점·현재 개념·Agent Level·`EXP` 게이지. (⚠️ EXP/레벨은 시안에만 존재 — 사양 미정, §12)
- **반응형**: Desktop 3단 → Tablet 2단(Right 접기) → Mobile 중앙 우선 + 사이드는 Drawer/하단 탭.

### 3.2 셸 사용 여부에 따른 화면 분류

| 유형 | 셸 | 화면 |
|---|---|---|
| Pre-game | 🧩(축약 HUD) | SCR-001 Entry, SCR-003 Team, SCR-004 Oath, SCR-005 Waiting |
| Cinematic | 🎬 풀블리드 | SCR-002 Opening, SCR-016 Emergency, SCR-018 Raid Battle, SCR-019 Villain Defeated, SCR-020 Badge, SCR-021 Ending |
| Gameplay | 🧩 셸 내부 | SCR-006 Dashboard, SCR-007 Briefing, SCR-008 Case, SCR-009~012 결과/집계, SCR-013 Item, SCR-014 Next |
| Post-game | 🧩/🎬 | SCR-015 Appointment(🎬 연출), SCR-022 Ranking(🧩), SCR-023 End |
| Admin | Admin 셸 | SCR-101~110 |

> 원칙: **정보(HUD)가 필요한 화면은 셸, 몰입 연출이 필요한 화면은 풀블리드.** 전환 시 셸이 fade로 등장/퇴장.

---

## 4. 컴포넌트 구조

### 4.1 컴포넌트 계약 (재확인 — `CLAUDE.md §9`)

모든 컴포넌트는 `createXxx(props) → { el, mount(parent), update(next), destroy() }`. `destroy()`에서 리스너·구독·타이머·rAF를 반드시 해제.

### 4.2 컴포넌트 트리

```
AppRoot
├─ AppShell (게임플레이/대시보드 화면 래퍼)
│  ├─ AppHeader ── BrandLogo · BureauStatusDropdown · NotificationBell · AudioToggle · SettingsButton
│  ├─ LeftSidebar
│  │   ├─ AgentInfo (팀명 · 계급 · 총점)
│  │   ├─ RankingList (Top N · 메달 컬러 · 내 팀 하이라이트)
│  │   ├─ StageScore (Mindset/Domain/AI · x/total)
│  │   ├─ ItemTray → ItemSlot ×3 (locked/unlocked · Glow)
│  │   └─ VersionTag
│  ├─ <ScreenOutlet>  ← 라우트별 화면 컴포넌트 마운트 지점
│  └─ RightInfoPanel (PMBOK 관점 · 현재 개념 · AgentLevel/EXP · 도움말)
│
├─ Screen: Case Investigation (예시, outlet 내부)
│   ├─ CaseHeader (Stage · 사건번호 · 진행률 · 남은시간 · 점수)
│   ├─ EvidenceViewer → { VideoEvidence | ImageEvidence | AudioEvidence | DocumentEvidence }
│   ├─ QuestionBlock → QuestionChoice ×N
│   └─ SubmitBar → Button[판단 제출]
│
├─ FullBleedStage (시네마틱 래퍼)
│   └─ Screen: Final Raid → VillainCharacter · HealthBar · RaidTimer · AttackButton · DamageNumber · SkillButton
│
└─ Overlays (셸과 독립, 최상위 z-index)
    ├─ ModalHost → ConfirmModal · ItemDetail · PMBOKExplanation · NetworkError · TimeExpired · ...
    ├─ ToastHost
    └─ TransitionLayer (Fade/Slide/Blur/ScanLine/Stage 컬러 확산)
```

### 4.3 컴포넌트 인벤토리 (구현 우선순위 태그)

`docs/screen-list.md §7` 목록을 기준으로, 아래 순서로 구축한다.

- **P1 (셸/공용)**: Button, Icon, Modal, ConfirmModal, Toast, LoadingOverlay, ProgressBar, Dropdown, AppHeader, LeftSidebar, RightInfoPanel, TransitionLayer.
- **P1 (게임)**: StageProgress, MissionCard, CaseCard, EvidenceViewer(+4종), QuestionChoice, ScoreCounter, Timer, RankingList.
- **P2 (아이템/후반)**: ItemSlot, ItemCard, ItemUnlockAnimation, BadgeDisplay.
- **P2 (레이드)**: VillainCharacter, HealthBar, AttackButton, DamageNumber, SkillButton, RaidTimer, ScreenShake, HitEffect.
- **P3 (관리자)**: AdminHeader, StatusCard, TeamStatusTable, QuestionTable, QuestionForm, GameControlPanel, SystemLog.

---

## 5. 라우팅 설계

### 5.1 라우터 메커니즘

- **History API 기반** 커스텀 라우터. Vercel은 `vercel.json` rewrite로 모든 경로를 `/index.html`로 서빙(SPA).
- **가드 파이프라인**: 라우트 진입 시 `(game.status, team.state)`를 `utils/guard.js`로 판정 → 허용되면 렌더, 아니면 허용된 화면으로 `replace` 리다이렉트.
- **Resume**: 부팅 시 서버에서 상태 조회 → 현재 팀 상태에 대응하는 "정규 화면"으로 이동. 딥링크/새로고침도 동일 규칙.
- **전환**: 화면 언마운트(`destroy`) → TransitionLayer 연출 → 다음 화면 마운트.

### 5.2 라우트 테이블 (`docs/screen-list.md §8~9` 기반)

| Path | 화면 | 셸 | 필요 game.status | 필요 team.state | 위반 시 |
|---|---|---|---|---|---|
| `/entry` | Entry | 🧩 | ≠ ended | any | — |
| `/opening` | Opening | 🎬 | ≠ ended | any | → /entry |
| `/team` | Team Selection | 🧩 | pledge_open+ | 미등록 | → 정규화면 |
| `/oath` | Oath | 🧩 | pledge_open+ | team_selected | → /team |
| `/waiting` | Waiting Room | 🧩 | waiting_room+ | pledged | → /oath |
| `/game/stage/:s` | Stage Briefing | 🧩 | started | 해당 stage 접근권 🔒 | → 허용 stage |
| `/game/stage/:s/case/:qid` | Case | 🧩 | started | 해당 case 권한 🔒 | → briefing |
| `/game/stage/:s/result` | Stage Result → Item | 🧩 | started | stage_n_cleared | → stage |
| `/appointment` | Officer Appointment | 🎬 | started/final | stage_3_cleared | → /game |
| `/alert` `/raid` | Emergency / Raid | 🎬 | final_raid | officer_appointed+ | → /appointment |
| `/ceremony` `/ending` `/ranking` `/complete` | 후반 | 🎬/🧩 | final_raid/ended | completed | → 정규화면 |
| `/admin/*` | Admin | Admin | any | — | 인증 실패 → /admin/login |

> 순차 진행(§`game-flow.md §3.2`)은 **클라 가드 + 서버 RPC 이중 검증** 🔒. URL 직접 접근은 항상 서버 상태로 교정.

---

## 6. 상태(State) 관리 구조

### 6.1 스토어 형태 (제안)

```js
// createStore(initial): { getState, setState(patch|fn), subscribe(fn), select(selector, fn) }
state = {
  session: {                 // 로컬(localStorage 동기화)
    participantKey,          // 경량 세션 식별자 ⚠️(§12)
    muted, volume, fullscreen,
    audioUnlocked            // 사용자 제스처 후 true
  },
  game: {                    // 서버 권위 · Realtime 반영
    status,                  // scheduled|pledge_open|waiting_room|started|final_raid|ended
    scheduledEndAt, actualStartAt
  },
  team: {                    // 서버 권위 (팀 단위 진행 ⚠️§12)
    id, name, color,
    state,                   // team_selected … completed
    scores: { mindset, domain, ai, total },
    items: { stage1, stage2, stage3 },   // acquired: bool
    currentStage, currentCaseNo,
    submissions              // {questionId: {choice, isCorrect, score}} (결과 확정분만)
  },
  ranking: [ { rank, teamId, name, total, medal } ],
  ui: {                      // 임시 뷰 상태
    route, transitioning, modal, toast, loading
  },
  meta: { connection: 'connected|reconnecting|offline', lastSyncAt }
}
```

### 6.2 규칙

- **View는 store만 구독**(서버를 직접 읽지 않음). 컴포넌트는 화면(screen)이 `select`로 필요한 슬라이스만 내려준다.
- **서버 상태는 절대 클라이언트가 최종 확정하지 않음** — 제출 결과·점수·상태 전이는 RPC 응답 또는 Realtime 이벤트로만 반영.
- **낙관적 UI는 연출에 한함**(예: 버튼 눌림/로딩). 데이터 확정은 서버 응답 후.
- **persist 대상은 세션 UI(mute/volume/fullscreen)뿐.** 진행 상태는 서버가 원천.

### 6.3 부팅/복구 시퀀스

```
main.js
 → env 검증 → supabase client 생성
 → store rehydrate(localStorage: session UI)
 → api.game.getStatus() + api.team.getMyProgress(participantKey)
 → store.setState(game, team, ranking)
 → realtime 구독(game, ranking, team)
 → router.start() → guard가 team.state에 맞는 화면으로 이동
```

---

## 7. 데이터 흐름

### 7.1 판단 제출 (핵심 경로) 🔒

```
[Case 화면] 선택지 클릭 → SubmitBar[판단 제출]
   → ConfirmModal(MOD-001) "제출 후 수정 불가"
   → api.submit.submitAnswer({ teamId, questionId, choice })   // RPC 호출
        └─ 서버(RPC, SECURITY DEFINER):
             1) game.status=started & now<scheduledEndAt 확인
             2) 중복 제출 여부 확인 (submissions unique)
             3) 정답 판정 · 점수 계산
             4) submissions insert · team score 갱신 · 다음 사건 권한 부여
             5) return { isCorrect, score, analysis, pmbokPoint }   // 정답'키'는 미반환
   → store.setState(team.scores, submissions[qid])
   → 정답이면 → SCR-010 Case Success / 오답이면 → SCR-011 Additional Investigation
   → Realtime: team score 변경 → ranking 갱신 브로드캐스트 → 다른 팀 화면 반영
```

### 7.2 대기실 → 시작 (Realtime) 

```
[Waiting Room] realtime.subscribe(game)
   → 관리자가 start_game 실행 🔒 → game.status: waiting_room→started, actualStartAt 기록
   → Postgres Changes 이벤트 → store.game.status='started'
   → 화면이 자동으로 /game/stage/1 (Briefing)로 전환 (새로고침 없이)
```

### 7.3 Stage 클리어 → 아이템 → 임명

```
마지막 사건 제출 → 서버가 team.state=stage_n_cleared, item_n 지급(조건: 최소 1정답 ⚠️§12)
   → SCR-012 Stage Result → SCR-013 Item Acquisition(연출) → SCR-014 Next
   → stage3_cleared & 3아이템 → officer_appointed → /appointment → /alert → /raid
```

### 7.4 Final Raid

```
[Raid Battle] 클릭/터치 → 로컬 연타 연출(rAF, 피격/데미지/셰이크)
   → 누적 공격수는 주기적으로 서버 반영(throttle) — 기여도 집계용
   → 20초 종료 → 서버가 raid 성공 확정(클릭수 무관) 🔒 → Villain Defeated → Ceremony
```

---

## 8. Supabase 설계 방향

### 8.1 스키마 스케치 (초안 — 구현 시 확정, `CLAUDE.md §10`)

| 테이블 | 핵심 컬럼 | 비고 |
|---|---|---|
| `game` | id(단일 row), status, scheduled_end_at, actual_start_at, raid_open | 전역 상태 |
| `teams` | id, name, color, max_members | 사전 시드 |
| `participants` | id, team_id, session_key, signer_name, pledged_at | 경량 식별 ⚠️ |
| `team_progress` | team_id(PK), state, current_stage, current_case_no, score_total, score_mindset, score_domain, score_ai | **팀 단위 진행** ⚠️§12 |
| `questions` | id, stage, order_no, title, briefing, clue_type, clue_url, question_text, choices(jsonb), score, active | **정답/해설 분리 저장** |
| `question_answers` | question_id(PK), correct_choice, analysis, pmbok_point | anon 접근 차단(RLS) |
| `submissions` | id, team_id, question_id, choice, is_correct, score, submitted_at | **unique(team_id, question_id)** |
| `team_items` | team_id, stage, acquired_at | 아이템 지급 기록 |
| `raid_contributions` | team_id, attack_count, updated_at | 기여도 |
| `rankings` (view) | rank, team_id, name, total, correct_count, completed_at | 정렬/동점 규칙(`game-flow.md §15.1`) |
| `admins` | user_id | Supabase Auth 연동 |

### 8.2 RLS 전략

- **participants/team_progress/submissions**: 자기 팀(row) 것만 select/insert. update는 원칙적으로 RPC 경유(직접 update 금지).
- **questions**: anon은 정답 없는 뷰/컬럼만 조회. `question_answers`는 anon 전면 차단(관리자/RPC만).
- **game**: anon select 허용(상태 구독), update는 관리자/RPC만.
- **rankings(view)**: 공개 여부는 관리자 플래그로 제어(`ranking_public`).
- **admins/관리자 기능**: `auth.uid()`가 `admins`에 있는 경우만.

### 8.3 서버 로직 (RPC / Edge Function) 🔒

| 함수 | 인자 | 책임 |
|---|---|---|
| `submit_answer` | team_id, question_id, choice | 시간/중복/권한 검증 → 채점 → 점수·진행 갱신 → 결과 반환(정답키 제외) |
| `select_team` | session_key, team_id, signer_name | 팀 배정/등록 |
| `complete_pledge` | participant_id | 서약 확정 → waiting |
| `start_game` / `end_game` | (admin) | status 전이 + actual_start_at / 제출 차단 |
| `start_raid` / `finish_raid` | (admin/자동) | final_raid 개방 / 성공 확정 |
| `record_attack` | team_id, delta | 기여도 누적(throttle) |
| `recalc_scores` | (admin) | 점수 재계산 |

### 8.4 Realtime 채널

- `game`(전역 상태), `rankings`(순위), `team_progress`(내 팀). Postgres Changes 우선, 관리자 공지는 Broadcast.

### 8.5 참가자 식별 ⚠️

로그인 없는 참가자 식별이 필요(`game-flow.md §5`: 새로고침·타 기기 재접속 이어하기). 후보:
- **(A) 팀 단위 진행 + 경량 세션키**(권장): 진행은 팀에 귀속, 참가자는 `localStorage` 세션키로 자기 팀 재확인. 타 기기에선 팀 재선택으로 이어가기.
- (B) Supabase Anonymous Auth: 익명 uid 발급. 기기 종속.
- **결정 필요**(§12) — 팀 경쟁 성격상 (A) 유력.

---

## 9. 개발 단계별 계획 (Phase)

각 Phase는 **Exit Criteria**를 통과해야 다음으로 진행. (`CLAUDE.md §16`, `game-flow.md §23`, `screen-list.md §10~11` 통합)

### Phase 0 — 인프라 & 기반 (0.5~1주)
- 산출물: 디자인 토큰·`AppShell` 3단 레이아웃(LayOut.png 재현)·라우터+가드(더미 상태)·store·`api/` 스텁·`lib/supabase.js`+env·상수(assets/stages/states/terms)·`vercel.json`.
- Exit: 빈 화면들이 라우트로 전환되고, 셸이 LayOut.png와 일치하며, 더미 상태로 가드 리다이렉트가 동작.

### Phase 1 — 정적 참가자 흐름 (MVP 화면, mock 데이터) (1~2주)
- 산출물: Entry→Opening→Team→Oath→Waiting→Briefing→Case→결과→StageResult→Item→(Officer→Raid→Badge→Ranking) 전 화면 + P1 컴포넌트.
- Exit: mock으로 15사건 흐름을 처음부터 끝까지 클릭 완주. 반응형 3단/2단/모바일 확인.

### Phase 2 — 사건(문제) 엔진 (1주)
- 산출물: 사건 데이터 스키마 확정, EvidenceViewer 4종, 선택·확인 모달·결과 표시. (정답은 클라이언트에 없음)
- Exit: JSON/DB 기반으로 사건이 로드되고 제출 UX가 완성(채점은 임시 서버/모의).

### Phase 3 — Supabase 연동 (1.5~2주)
- 산출물: 스키마·RLS·`submit_answer` 등 RPC·Realtime 구독·팀/서약/게임상태·랭킹·새로고침 복구.
- Exit: 실제 서버로 팀 선택→서약→시작→제출→점수→아이템→랭킹이 동작하고, 새로고침/재접속 복구·종료시간 차단·중복제출 방지가 검증됨(`CLAUDE.md §17`).

### Phase 4 — 관리자 (1~1.5주)
- 산출물: Admin Login/Dashboard/Game Control(Start·End 확인 모달)/Team Monitor/Ranking Control (+ Question 관리·Asset Preview·System Test).
- Exit: 관리자가 실제로 게임을 개방/시작/종료/레이드 제어하고 팀 현황·랭킹을 운영할 수 있음.

### Phase 5 — 연출 강화 & 행사 리허설 (1주+)
- 산출물: Stage 전환·아이템 획득·임명·Emergency Glitch·Raid 타격감·금배지·사운드·`prefers-reduced-motion` 대응.
- Exit: System Test(SCR-110) 전 항목 통과 + 다중 팀 동시 접속 리허설.

> 병렬화 팁: Phase 3(백엔드)는 Phase 1 진행 중 스키마/RPC 설계를 선행할 수 있음. 관리자(4)는 참가자 서버(3) 완료 후 착수.

---

## 10. 예상 리스크

| # | 리스크 | 영향 | 완화책 |
|---|---|---|---|
| R1 | **행사 당일 동시 접속 폭주**(다팀·실시간) | 高 | Realtime 채널 최소화, 랭킹은 view+throttle, 리허설로 부하 확인, Supabase 요금제 사전 상향 |
| R2 | **미디어 자동재생 차단**(브라우저 정책) | 中 | muted 자동재생 후 제스처 unmute, 오디오 권한 모달(MOD-002), 텍스트 대체 |
| R3 | **정답/배점 유출**(클라 노출) | 高 | 정답 테이블 RLS 차단 + 채점 RPC 전용, 번들/응답 검사(체크리스트) |
| R4 | **동시 제출 레이스**(팀 다중 멤버) | 中 | unique(team,question) + RPC 원자성, 먼저 확정된 제출만 인정 |
| R5 | **팀 vs 참가자 진행 단위 모호**(§12) | 高 | 조기 확정 필요. 팀 단위 권장. 미확정 시 전체 재작업 위험 |
| R6 | **에셋 무게**(mp4 2.6MB, png ~2MB)×모바일 | 中 | WebP/AVIF·비디오 재인코딩·프리로드/지연로드·poster |
| R7 | **프레임워크 부재 → 33화면 복잡도** | 中 | 엄격한 컴포넌트 계약·라우터·store 규율, destroy 누수 방지 |
| R8 | **종료 시각 신뢰**(클라 시계 조작) | 中 | 서버 시각 기준 판정, 클라 타이머는 표시용 |
| R9 | **RLS 오설정으로 데이터/정답 누출** | 高 | 정책 테스트(익명 세션으로 접근 시도), 마이그레이션 리뷰 |
| R10 | **Vercel SPA 라우팅/CSP·대소문자** | 低 | `vercel.json` rewrite, 소문자 kebab 에셋(완료), 배포 후 스모크 테스트 |
| R11 | **네트워크 단절 중 진행** | 中 | 재접속 백오프·마지막 저장지점 복구·"연결 보호중" 안내(§19.1) |
| R12 | **콘텐츠(15사건) 미확정** | 高 | 문제은행 문서/시드 조기 확보(§11) |

---

## 11. 추가로 필요한 문서

| 문서 | 목적 | 우선도 |
|---|---|---|
| `docs/question-bank.md` (+ seed) | 15개 사건 본문·선택지·**정답/해설/PMBOK 포인트**·배점 | ★★★ |
| `docs/data-model.md` | 최종 DB 스키마(ERD)·제약·인덱스 | ★★★ |
| `docs/api-contract.md` | RPC/Edge 함수 시그니처·요청/응답·에러코드 | ★★★ |
| `docs/design-system.md` | 토큰 값 확정·컴포넌트 비주얼 스펙(LayOut.png 기준)·아이콘셋 | ★★☆ |
| `docs/teams-config.md` | 팀 목록·컬러·최대 인원·시드 값 | ★★☆ |
| `docs/admin-runbook.md` | 행사 당일 운영 절차(개방→시작→레이드→종료→랭킹) | ★★☆ |
| `docs/test-plan.md` | 리허설 시나리오·다팀 부하·복구/예외 테스트 | ★★☆ |
| `docs/deployment.md` | Vercel/Supabase env·마이그레이션·롤백 | ★☆☆ |
| `docs/copy-deck.md` | 전 화면 UI 문자열(용어 일관성, `terms.js` 원본) | ★☆☆ |

---

## 12. 현재 문서에서 부족하거나 보완이 필요한 부분

> 아래는 **구현 착수 전 결정/확정이 필요한 항목**. 확정된 결정은 `CLAUDE.md` 또는 해당 사양 문서에 반영한다.

1. **진행 단위: 팀 vs 참가자** — `game-flow.md §5`는 "팀별 진행"이라 하나, 한 팀 다수 멤버가 각자 접속할 때 (a) 팀 공유 진행/제출인지 (b) 개인별 진행인지 불명확. **랭킹이 팀 단위이므로 팀 공유 진행 권장** → 확정 필요. (R5)
2. **참가자 식별/인증** — 로그인 없는 재접속·타 기기 이어하기 방식 미정(세션키 vs 익명 Auth). §8.5 결정 필요.
3. **아이템 지급 조건 상충** — `game-flow.md §24`("한 문제라도 맞으면 지급") vs `§8.3`("모든 사건 제출 시 통과"). 지급 조건/통과 기준을 하나로 확정.
4. **배점·통과 기준** — 문항별 배점, Stage 통과 점수(60%?), 미달 시 진행 허용 여부가 "운영 설정"으로만 남아 있음 → 기본값 확정 필요.
5. **문제 콘텐츠(정답 포함) 부재** — 15개 사건 본문·정답·해설이 문서에 없음. `question-bank.md` 필요(R12).
6. **팀 구성 데이터 부재** — 팀 개수/이름/컬러/최대 인원 미정(LayOut엔 4팀 예시). `teams-config.md` 필요.
7. **Right Panel / EXP·Agent Level 사양 부재** — LayOut.png에 `EXP 0/100`·Agent Level이 있으나 `screen-list.md`엔 개념만 있고 규칙(획득/레벨업/의미)이 없음. 정의 또는 제거 결정.
8. **LayOut.png 하단 4색 버튼 용도 불명** — Stage 컬러(보라/시안/초록/빨강) 버튼의 기능(스테이지 이동? 개발용? 공격?) 미정.
9. **Final Raid 팀 집계 방식** — 팀 멤버들의 클릭이 하나의 체력바에 합산되는지(공유), 팀별 독립인지, 기여도 계산식 미정.
10. **시간/타임존 기준** — 단일 종료 시각의 서버 시각 권위·표시 타임존(KST) 명시 필요.
11. **관리자 인증 상세** — 계정 발급/역할/2FA 여부, `admins` 관리 방법 미정.
12. **모바일 Final Raid 인터랙션** — 연타/터치 상세, 저사양 기기 성능 목표 미정.
13. **접근성 세부** — 키보드 내비 범위, 스크린리더 대응 수준, 자막 제공 범위의 구체 기준 필요.

---

_이 계획서는 결정이 확정될 때마다 갱신한다. 구현 착수 순서는 §9 Phase를 따르며, 각 Phase 종료 시 `CLAUDE.md §17` 체크리스트로 검증한다._
