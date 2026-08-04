# Supabase 최소 연동 설계

> **목적**: Mock(localStorage)으로 완성된 게임 흐름을 **2일 안에** 다중 기기 운영이 가능한 서버 기반으로 옮긴다.
> **범위**: 최소 구조. 화면 코드는 건드리지 않고 `src/js/lib/*` 내부만 서버 호출로 교체하는 것을 목표로 한다.
> 근거 문서: `CLAUDE.md §2 §8 §10 §11` · `docs/game-flow.md §3.1 §7.3 §18 §19.4 §20` · `docs/handoff.md`
>
> 상태: **착수 가능**(2026-08-04 결정 반영). §17의 ①②③④⑤⑥⑧ 확정, **⑦(서약 저장)만 미결**.
> 확정 요약은 §17.1 참조. 코드는 아직 수정하지 않았다.

---

## 0. 한눈에 보기

```
브라우저 (anon key만)                          Supabase
┌────────────────────────────┐                ┌──────────────────────────────┐
│ 화면 (screens/*)  ← 변경 없음│                │ Postgres + RLS               │
│   ↓ (기존 함수 시그니처 유지) │                │  games · teams · answers     │
│ lib/game.js      ──────────┼── RPC ────────▶│  team_progress · case_answers│
│ lib/entries.js   ──────────┼── RPC ────────▶│  admins                      │
│ lib/progress.js  ──────────┼── RPC ────────▶│                              │
│ lib/grade.js     ──────────┼── RPC ────────▶│ SECURITY DEFINER 함수(채점·   │
│ lib/teams.js     ──────────┼── SELECT ─────▶│  진행 갱신·관리자 제어)        │
│ lib/supabase.js (신규)      │                │                              │
│   ↑ Realtime(games.status)  │◀── WebSocket ──│ publication: games           │
│   ↑ 실패 시 5초 폴링         │                │                              │
└────────────────────────────┘                └──────────────────────────────┘
      정답·해설은 브라우저에 없다              service_role 키는 로컬 시드 스크립트 전용
```

**핵심 3가지**
1. **쓰기는 전부 RPC(SECURITY DEFINER)로만.** anon 역할에는 테이블 INSERT/UPDATE 정책을 아예 만들지 않는다.
2. **팀 소유 증명은 `claim_token`(uuid).** 참가자 로그인(Auth)은 없다. 관리자만 Supabase Auth를 쓴다.
3. **시간은 서버가 정한다.** `started_at`·`ends_at`은 서버 `now()`, 제출 가능 판정도 서버에서 한다. 클라이언트 타이머는 표시용.

---

## 1. 범위

### 포함 (v1)
| 항목 | 내용 |
|---|---|
| 게임 상태 | `scheduled → started → ended` 단일 로우, 서버 시간 기준 시작·종료 |
| 팀 입장 | 팀 선택 + 수사관 3명 이메일 등록 = 점유(팀당 1기기·기기당 1팀), 이메일로 기기 인계 |
| 답안 제출 | 서버 채점(정답 비노출), 팀×사건 1회 제한, 종료 시각 이후 차단 |
| 진행/점수 | 팀별 점수·Stage별 정답 수·제출 목록·종반부 저장 지점 |
| 랭킹 | 사이드바용 점수판(팀명+점수) + 관리자 발표용 상세 |
| 관리자 | **게임 시작 / 게임 종료 / 팀 현황 / 점수 조회** (4가지) |
| Realtime | `games.status` 우선 적용, 실패 시 5초 폴링 |
| 보안 | 전 테이블 RLS, anon은 화이트리스트 컬럼만 읽기, service_role 브라우저 금지 |

### 제외 (v1에서 하지 않음)
- **문제(사건) CRUD** — 사건 본문은 계속 `src/js/data/cases.js`에 둔다. 관리자 문제 편집 화면도 만들지 않는다.
- 참가자 계정/로그인, 이메일 인증, 비밀번호
- 랭킹 공개/숨김 토글, Final Raid 관리자 개방 제어(SCR-109)
- Final Raid 기여도의 서버 검증(타수는 클라이언트 신고값을 그대로 저장)
- Edge Function, 파일 스토리지, 감사 로그, 다중 관리자 권한 등급
- 문제별 타이머, 시간 보너스

---

## 2. 원칙

1. **서버 권위**: 진행 단계·점수·정답·시간은 서버가 판정한다. 클라이언트는 표현과 입력만 한다(`CLAUDE.md §2`).
2. **정답 비노출**: `SOLUTIONS`(정답 인덱스·해설)는 브라우저 번들에서 제거하고 `case_answers` 테이블로 옮긴다. anon은 이 테이블에 **어떤 권한도 없다**(§4.5, §17-①).
3. **RLS 기본 거부**: 모든 테이블 `enable row level security`. 정책을 만들지 않은 조합은 거부된다.
4. **service_role 금지**: 브라우저·저장소·Vercel 클라이언트 환경변수에 절대 두지 않는다. 시드/마이그레이션 실행에만 로컬에서 사용한다(§12).
5. **화면 무변경**: `lib/*`의 내보내는 함수 이름·인자·반환 모양을 유지해 `screens/*`를 수정하지 않는다(§10). 2일 일정의 근거다.
6. **연출·네트워크 독립**: 서버 호출 실패 시 사용자 안내 + 재시도를 제공하고, 진행 중 상태를 잃지 않는다(`docs/game-flow.md §19.1`).

---

## 3. 참가자 신원 모델 (Auth 없음)

참가자는 로그인하지 않는다. 대신 팀 점유를 **토큰**으로 증명한다.

```
팀 선택 + 이메일 3개 등록
      → claim_team RPC
      → 서버가 claim_token(uuid) 생성·반환
      → 브라우저 localStorage 에 { teamId, claimToken } 저장
      → 이후 모든 쓰기 RPC 에 (teamId, claimToken) 을 함께 보낸다
```

- **다른 기기 인계**: `verify_and_transfer(팀, 등록된 이메일 중 하나, 새 기기 id)` → 서버가 **토큰을 재발급(rotate)** 한다. 이전 기기의 토큰은 즉시 무효가 되어 다음 RPC에서 `not_owner` 오류 → 기존 `flow.assertClaim()` 경로로 팀 선택 화면으로 되돌아간다(현재 동작과 동일).
- **기기당 1팀**: `claim_team`이 같은 `device_id`가 쥔 다른 팀의 점유를 서버에서 먼저 해제한다.
- **한계(수용)**: 토큰은 localStorage에 있으므로 그 기기를 만질 수 있는 사람은 그 팀으로 행동할 수 있다. 현재 mock의 기기 점유와 같은 수준이며, 행사 환경(팀별 지정 기기)에서 수용한다.
- **관리자**: Supabase Auth(이메일+비밀번호) 계정 1개를 대시보드에서 수동 생성하고 `admins` 테이블에 등록한다. 회원가입(Sign-up)은 비활성화한다.

---

## 4. 데이터 모델

전부 `public` 스키마. 시각은 모두 `timestamptz`.

### 4.1 `games` — 단일 로우 게임 상태
```sql
create table public.games (
  id                integer primary key default 1 check (id = 1), -- 단일 로우 강제
  status            text    not null default 'scheduled'
                    check (status in ('scheduled','started','ended')),
  duration_minutes  integer not null default 60,
  started_at        timestamptz,
  ends_at           timestamptz,
  updated_at        timestamptz not null default now()
);
insert into public.games (id) values (1) on conflict do nothing;
```
- `pledge_open`/`waiting_room`/`final_raid`(문서 §4의 6단계)는 v1에서 쓰지 않는다: 입장은 항상 열려 있고, Final Raid는 팀별 Stage 3 완료 직후 자동 진입이다(현재 구현). 필요해지면 CHECK 목록에 값을 추가한다(§17-②).
- `ends_at = started_at + duration_minutes`를 **시작 시점에 서버가 확정**해 저장한다. 이후 종료 판정은 이 값 하나만 본다.

### 4.2 `teams` — 팀 로스터 + 입장(점유)
```sql
create table public.teams (
  id             text primary key,                 -- mocks/teams.js 의 id 그대로 (예: 'team-test')
  name           text not null,
  color          text not null,
  sort_order     integer not null,
  is_test        boolean not null default false,
  -- 입장(점유) 정보
  member_emails  text[]  not null default '{}',    -- PII: anon 접근 금지
  device_id      text,                             -- anon 접근 금지
  claim_token    uuid,                             -- anon 접근 금지
  entered_at     timestamptz,
  transferred_at timestamptz,
  flags          text[]  not null default '{}',    -- 'suspect' 등 운영 플래그
  -- 서약(SCR-004) — docs/game-flow.md §18 '서약 완료 시각 저장'. §17-⑦ 결정에 따라 채택
  pledged_at     timestamptz,
  signer_name    text,
  updated_at     timestamptz not null default now()
);
```
- 별도 `team_entries` 테이블을 만들지 않고 `teams`에 합친다(테이블 수 최소화). 현재 `lib/entries.js`의 개념이 그대로 컬럼으로 들어온다.
- **anon에게는 컬럼 단위로만 SELECT를 허용**한다(§7.2). `member_emails`·`device_id`·`claim_token`은 어떤 경우에도 anon이 읽지 못한다.
- 팀 목록은 시드로 넣는다. 팀명·색 수정은 v1에서 SQL로 처리한다(관리자 UI 제외).

### 4.3 `answers` — 제출 원본 (진실의 원천)
```sql
create table public.answers (
  id            bigint generated always as identity primary key,
  team_id       text not null references public.teams(id) on delete cascade,
  case_id       text not null,                     -- cases.js 의 id (예: 'case-s3-014')
  stage         smallint not null check (stage between 1 and 3),
  choice_index  smallint not null check (choice_index >= 0),
  is_correct    boolean  not null,
  points        smallint not null default 0,
  submitted_at  timestamptz not null default now(),
  unique (team_id, case_id)                        -- 중복 제출 서버 차단 (CLAUDE.md §17)
);
create index on public.answers (team_id);
```

### 4.4 `team_progress` — 진행 상태 투영(projection)
`answers`가 원본이고 이 테이블은 **RPC가 갱신하는 캐시**다. 사이드바·라우터 가드가 매 화면에서 읽으므로 집계 대신 로우 한 줄로 둔다.

```sql
create table public.team_progress (
  team_id           text primary key references public.teams(id) on delete cascade,
  score             integer  not null default 0,
  solved_count      smallint not null default 0,
  submitted_count   smallint not null default 0,
  stage1_solved     smallint not null default 0,
  stage2_solved     smallint not null default 0,
  stage3_solved     smallint not null default 0,
  stage1_submitted  smallint not null default 0,
  stage2_submitted  smallint not null default 0,
  stage3_submitted  smallint not null default 0,
  last_submit_at    timestamptz,
  -- 종반부 저장 지점 (docs/game-flow.md §18)
  appointed_at      timestamptz,
  raid_started_at   timestamptz,
  raid_ended_at     timestamptz,
  raid_hits         integer  not null default 0,
  raid_damage       integer  not null default 0,
  badge_at          timestamptz,
  ended_at          timestamptz,
  updated_at        timestamptz not null default now()
);
```
- 불일치가 의심되면 `recalc_team_progress(p_team_id)`(§6.3)로 `answers`에서 다시 계산한다. 운영 중 안전장치.

### 4.5 `case_answers` — 정답·해설 (anon 접근 전면 금지)
```sql
create table public.case_answers (
  case_id      text primary key,
  answer_index smallint not null,
  analysis_ko  text not null,
  analysis_en  text
);
```
- **문제 CRUD가 아니다.** 사건 본문은 계속 `cases.js`에 있고, 이 테이블은 채점을 위한 정답·해설 시드다. 관리자 편집 UI는 만들지 않으며 내용 변경은 SQL 시드 재실행으로 한다.
- 값은 `scripts/export-answers.mjs`(신규, Node)로 `cases.js`의 `SOLUTIONS`에서 뽑아 SQL로 생성한다(§11.3).

### 4.6 `admins` — 관리자 허용 목록
```sql
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note    text
);
```

---

## 5. 뷰

```sql
-- 사이드바 점수판: 팀명 + 점수만. 이메일·종반부 상태는 포함하지 않는다.
create view public.scoreboard as
  select t.id as team_id, t.name, t.sort_order,
         coalesce(p.score,0) as score,
         coalesce(p.solved_count,0) as solved_count,
         p.last_submit_at,
         coalesce(p.raid_hits,0) as raid_hits
  from public.teams t
  left join public.team_progress p on p.team_id = t.id;

-- 관리자 발표용 상세 (순위 기준: docs/game-flow.md §15.1)
create view public.admin_scoreboard as
  select rank() over (
           order by coalesce(p.score,0) desc,
                    coalesce(p.solved_count,0) desc,
                    p.last_submit_at asc nulls last,
                    coalesce(p.raid_hits,0) desc
         ) as rank,
         t.id as team_id, t.name,
         coalesce(p.score,0) as score,
         coalesce(p.stage1_solved,0) as stage1_solved,
         coalesce(p.stage2_solved,0) as stage2_solved,
         coalesce(p.stage3_solved,0) as stage3_solved,
         coalesce(p.solved_count,0)  as solved_count,
         coalesce(p.submitted_count,0) as submitted_count,
         p.last_submit_at, coalesce(p.raid_hits,0) as raid_hits,
         p.appointed_at, p.raid_ended_at, p.ended_at
  from public.teams t
  left join public.team_progress p on p.team_id = t.id;

-- 관리자 팀 현황 (입장·이메일·플래그). 이메일이 있으므로 관리자 전용.
create view public.admin_team_status as
  select t.id as team_id, t.name, t.sort_order,
         (t.entered_at is not null) as is_claimed,
         t.member_emails, t.entered_at, t.transferred_at, t.flags,
         coalesce(p.submitted_count,0) as submitted_count,
         coalesce(p.score,0) as score
  from public.teams t
  left join public.team_progress p on p.team_id = t.id;
```
- `scoreboard`는 anon SELECT 허용, `admin_*`는 관리자만(§7.4).
- 뷰가 기반 테이블의 RLS를 우회하지 않도록 **`security_invoker = true`로 만들고**, anon이 필요한 컬럼은 §7.2의 컬럼 GRANT로 허용한다. (Supabase의 "security definer view" 경고를 피하는 방식)

---

## 6. RPC 목록

모든 RPC는 `language plpgsql security definer set search_path = public, pg_temp`. 반환은 다루기 쉽게 `jsonb`.
쓰기 RPC는 첫 두 인자로 `p_team_id text, p_token uuid`를 받고 **토큰 검증 실패 시 `not_owner` 예외**를 던진다.

### 6.1 참가자 RPC (`grant execute ... to anon`)

| RPC | 인자 | 반환 | 서버 검증 |
|---|---|---|---|
| `game_state()` | — | `{status, started_at, ends_at, duration_minutes, server_now}` | 없음(공개) |
| `claim_team()` | `p_team_id, p_emails text[], p_device_id, p_token uuid default null` | `{ok, token, entered_at, flags}` | 팀 존재 · 미점유이거나 토큰 일치(재편집) · 이메일 3개 비어있지 않고 팀 내 중복 없음 · 같은 기기의 다른 팀 점유 해제 |
| `verify_and_transfer()` | `p_team_id, p_email, p_device_id` | `{ok, token}` | 이메일이 `member_emails`에 있어야 함 · **토큰 재발급** |
| `release_team()` | `p_team_id, p_token` | `{ok}` | 토큰 일치 |
| `submit_answer()` | `p_team_id, p_token, p_case_id, p_stage, p_choice_index, p_locale default 'ko'` | `{is_correct, correct_index, analysis, score, stage_solved, submitted_count}` | 토큰 · `games.status='started'` · `now() < games.ends_at` · `(team,case)` 미제출 · `case_answers`에 해당 사건 존재 |
| `my_progress()` | `p_team_id, p_token` | `{score, stage:{1,2,3}, submittedStage:{...}, submitted_case_ids[], solved_case_ids[], last_submit_at, finale:{...}}` | 토큰 |
| `record_milestone()` | `p_team_id, p_token, p_milestone text, p_hits int default null, p_damage int default null` | `{finale:{...}}` | 토큰 · `p_milestone in ('appointed','raid_started','raid_ended','badge','finished')` · 시각은 **서버 now()** 로 최초 1회만 기록(COALESCE) · 타수·데미지는 `greatest()` |

- `submit_answer`는 **하나의 트랜잭션**에서 채점 → `answers` insert → `team_progress` 갱신을 처리한다. 유니크 위반(동시 이중 제출)은 잡아서 `already_submitted` 예외로 변환한다.
- 배점은 서버 상수(`points_per_case = 20`)로 두고 클라이언트가 보내지 않는다.
- `record_milestone`은 종반부 진입 자격(Stage 1~3 전부 제출)을 서버에서도 확인한다 → 클라이언트 가드와 이중화(`CLAUDE.md §10`).

### 6.2 관리자 RPC (`grant execute ... to authenticated`, 내부에서 `is_admin()` 확인)

| RPC | 인자 | 동작 |
|---|---|---|
| `admin_start_game()` | `p_duration_minutes int default null` | `status='started'`, `started_at=now()`, `ends_at=now()+duration`. 이미 started면 그대로 반환(멱등) |
| `admin_end_game()` | — | `status='ended'`, `ends_at=least(ends_at, now())` |
| `admin_reset_game()` | `p_wipe_progress boolean default false` | 리허설 전용. `scheduled`로 되돌리고, 옵션에 따라 `answers`·`team_progress`·점유 초기화 |

- 팀 현황·점수 조회는 RPC 없이 `admin_team_status` / `admin_scoreboard` 뷰 SELECT로 처리한다.
- **문제 CRUD RPC는 만들지 않는다.**

### 6.3 내부 함수 (anon·authenticated 실행 권한 없음)
| 함수 | 용도 |
|---|---|
| `is_admin()` | `admins`에 `auth.uid()`가 있는지 |
| `assert_team_token(p_team_id, p_token)` | 토큰 검증, 실패 시 예외 |
| `recalc_team_progress(p_team_id)` | `answers`에서 `team_progress` 재계산(운영 복구용) |

---

## 7. RLS 정책

`alter table ... enable row level security;` 를 **6개 테이블 전부**에 적용한다. 아래에 없는 조합은 전부 거부.

### 7.1 `games`
```sql
create policy games_read_all on public.games for select to anon, authenticated using (true);
-- UPDATE 정책 없음 → 관리자 RPC(SECURITY DEFINER)만 변경 가능
```
> Realtime의 `postgres_changes`는 RLS를 따르므로 **anon SELECT 허용이 Realtime 수신의 전제**다.

### 7.2 `teams` — 행 허용 + 컬럼 단위 GRANT
```sql
create policy teams_read_all on public.teams for select to anon, authenticated using (true);

revoke all on public.teams from anon;
grant select (id, name, color, sort_order, is_test, entered_at) on public.teams to anon;
-- member_emails · device_id · claim_token · flags 는 GRANT 하지 않는다 → anon은 조회 자체가 실패
grant select on public.teams to authenticated;  -- 관리자 화면(뷰 경유)
```
- 클라이언트는 `select('id,name,color,sort_order,is_test,entered_at')`처럼 **컬럼을 명시**해야 한다. `select('*')`는 권한 오류가 난다(의도된 방어).
- "내 팀인지"는 서버가 아니라 **로컬에 토큰이 있는지**로 판단한다(§3). `device_id`를 노출하지 않는 이유.

### 7.3 `answers` · `team_progress` · `case_answers`
```sql
-- answers: anon 정책 없음(=거부). 관리자만 읽기.
create policy answers_admin_read on public.answers for select to authenticated using (is_admin());

-- team_progress: 관리자는 전체 열람. anon은 §7.4의 점수판 컬럼만(그 외는 my_progress RPC).
create policy tp_admin_read on public.team_progress for select to authenticated using (is_admin());

-- case_answers: 어떤 역할도 직접 접근 불가. 채점 RPC(SECURITY DEFINER)만 읽는다.
revoke all on public.case_answers from anon, authenticated;
```

### 7.4 뷰 권한
```sql
grant select on public.scoreboard to anon, authenticated;       -- 팀명+점수만
grant select on public.admin_scoreboard, public.admin_team_status to authenticated;
create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());
```
- `scoreboard`는 `security_invoker=true`이므로 기반 테이블 정책을 따른다 → `team_progress`에 anon 정책이 없으면 빈 결과가 된다. 따라서 **점수판 전용 정책 + 컬럼 GRANT**를 둔다(이것이 `team_progress`에 대한 anon 권한의 전부다):
```sql
create policy tp_public_score on public.team_progress for select to anon using (true);
revoke all on public.team_progress from anon;                       -- 먼저 전부 회수
grant select (team_id, score, solved_count, last_submit_at, raid_hits)
  on public.team_progress to anon;                                  -- 점수판 컬럼만 재부여
```
→ anon은 점수·정답 수·완료 시각·타수만 읽을 수 있고 **종반부 상태(appointed_at 등)와 제출 내역은 읽을 수 없다**.
（GRANT 회수·재부여 순서가 중요하다. `grant` 뒤에 `revoke all`을 실행하면 컬럼 권한까지 사라져 점수판이 빈다.)

### 7.5 검증(반드시 수행)
anon 키만 가진 클라이언트에서 아래가 **모두 실패**해야 한다(§14 체크리스트에 포함).
```
select * from teams                 → 권한 오류
select member_emails from teams     → 권한 오류
select * from answers               → 0행 또는 오류
select * from case_answers          → 오류
update games set status='started'   → 오류
insert into answers ...             → 오류
```

---

## 8. Realtime + 폴링 폴백

### 8.1 대상
v1은 **`games.status`에만** Realtime을 적용한다. 대기실(SCR-005)이 관리자 Start를 즉시 받는 것이 유일한 실시간 요구다.
점수·팀 현황(관리자 화면)은 5초 폴링으로 충분하다.

```sql
alter publication supabase_realtime add table public.games;
```

### 8.2 클라이언트 동작 (`lib/game.js` 내부)
```
1) 부팅 시 즉시 game_state() 1회 호출 → 상태·서버시간 확보 (Realtime을 기다리지 않는다)
2) channel('game').on('postgres_changes', {table:'games'}) 구독
3) 구독 상태 처리
   - SUBSCRIBED                       → 폴링 중지
   - CHANNEL_ERROR / TIMED_OUT / CLOSED → 폴링 시작
   - 5초 안에 SUBSCRIBED 없으면        → 폴링 시작 (안전망)
4) 폴링: setInterval(5000) → game_state()
5) 추가 보정: document visibilitychange(→visible) · window focus 시 즉시 1회 호출
   (백그라운드 탭에서 타이머가 스로틀되는 환경 대비)
6) 상태가 바뀌면 기존 subscribe(fn) 리스너에 그대로 통지 → 화면 코드 변경 없음
```
- 폴링 주기 5초 고정(상수). 32팀 × 12회/분 = 분당 약 384 요청 — 무료/기본 티어에서 문제되지 않는 수준.
- Realtime이 붙었다가 끊기면 다시 폴링으로 내려오고, 재연결되면 폴링을 멈춘다(양방향 전환).

---

## 9. 서버 시간 기준 시작·종료

- `admin_start_game()`이 `started_at = now()`, `ends_at = now() + duration_minutes`를 **서버에서** 계산해 저장한다. 클라이언트 시각은 어디에도 쓰지 않는다.
- `game_state()`가 `server_now`를 함께 반환한다. 클라이언트는 최초 1회 `offset = server_now - Date.now()`를 계산해 두고, 헤더 타이머를 `ends_at - (Date.now() + offset)`으로 표시한다 → 기기 시계가 틀어져 있어도 남은 시간이 팀마다 같다.
- **제출 차단은 서버 판정이 최종**이다. `submit_answer`가 `now() >= ends_at`이면 `game_ended` 예외를 던진다. 클라이언트 타이머는 UX 보조일 뿐이다(`docs/game-flow.md §19.4`).
### 9.1 종료 시각 도달 시 동작 (③ 확정 — 신규 기능)

현재 코드에는 종료 처리가 **없다**(헤더 타이머가 0에서 멈출 뿐). 아래를 새로 만든다.

| 계층 | 동작 |
|---|---|
| 서버 | `submit_answer`가 `now() >= games.ends_at` 또는 `status <> 'started'`면 **`game_ended` 예외**. 최종 판정은 항상 여기 |
| 클라이언트(제출 시) | 예외를 받으면 확인 모달을 닫고 **사건 화면을 유지**한 채 안내 배너 표시 + `[판단 제출]` 비활성화. 선택 상태는 남긴다 |
| 클라이언트(대기 중) | `games.status='ended'`가 Realtime/폴링으로 도착하면 즉시 같은 배너를 띄우고 제출 버튼을 잠근다(제출 시도 없이도 반영) |
| 강제 이동 | **하지 않는다.** 진행 중 팀의 화면을 끊지 않고, 이동은 운영진 안내에 따른다 |
| 종반부 | 임명·레이드·금배지는 시간 제한과 무관하게 계속 진행 가능(제출이 없는 구간이므로) |

필요 문구 2개를 `constants/copy.js`에 ko/en으로 추가한다: `case.endedNotice`(예: "게임이 종료되어 더 이상 판단을 제출할 수 없습니다."), `case.endedHint`(운영진 안내 대기).

---

## 10. 클라이언트 매핑 — 화면을 건드리지 않는 방법

**규칙**: `lib/*`의 내보내는 함수 이름과 반환 모양을 유지하고 내부만 바꾼다. 동기 getter는 **모듈 캐시**를 읽고, 서버 왕복은 `refresh*()`가 담당한다.

| 파일 | 지금(Mock) | 연동 후 | 시그니처 변화 |
|---|---|---|---|
| `lib/supabase.js` | 없음 | `createClient(env)` 단일 인스턴스 | 신규 |
| `lib/game.js` | localStorage + storage 이벤트 | `game_state()` + Realtime + 5초 폴링 | `getStatus/isStarted/subscribe/remainingSeconds` 유지. **`ensureStarted()`는 제거**(클라이언트가 게임을 시작할 수 없다) |
| `lib/entries.js` | localStorage 레지스트리 | `claim_team` / `verify_and_transfer` / `release_team` + 토큰 저장 | `claimTeam/verifyMember/transferTeam/releaseTeam/ownsTeam/teamStatus` 유지(내부에서 토큰 사용). `entriesCsv`·`crossTeamDuplicates`는 관리자 뷰 기반으로 이동 |
| `lib/progress.js` | localStorage | `my_progress`(캐시 채움) · `submit_answer` · `record_milestone` · `scoreboard` | `getProgress/getFinale/getRanking`은 **동기 캐시 읽기 유지**, `recordSubmission`→`submitAnswer`(async), `recordFinale`→`recordMilestone`(async) |
| `lib/grade.js` | `SOLUTIONS` 조회 | `submit_answer` 반환값을 그대로 전달 | `gradeCase(caseId, idx)` → async. **호출부(case.js) 1곳만 `await` 추가** |
| `lib/teams.js` | mocks + localStorage | `teams` SELECT(컬럼 명시) 결과 캐시 | `getTeams/findTeam` 동기 유지 |
| `lib/stage-progress.js` | — | 변경 없음 (`CASES` + progress 캐시로 판정) | 없음 |
| `constants/flow.js` | — | 변경 없음 (facts를 flow.js가 주입) | 없음 |
| `flow.js` | — | 부팅 시 `await` 초기 로드(게임 상태·팀·내 진행) 후 `start()` | 부트 시퀀스 1곳 |

### 불가피한 코드 변경 (호출부 실측, 2026-08-04)
| # | 변경 | 위치 수 | 비고 |
|---|---|---|---|
| 1 | `ensureStarted()` 호출 제거 | 1 (`case.js:72`) | 라우터 가드가 이미 미시작 시 대기실로 보낸다. `lib/game.js`의 함수 자체도 삭제(DEV `stage-jump.js` 2곳은 DEV 전용 대체) |
| 2 | `gradeCase(...)`에 `await` + 실패 안내 | 1 (`case.js` `doSubmit`) | 실패 시 `submitted` 플래그·제출 버튼 복구 필요 |
| 3 | `recordSubmission` → `await submitAnswer` | 1 (`case.js`) | 서버 채점 결과로 화면 확정 |
| 4 | `recordFinale` → `await recordMilestone` | 5 (`appointment`1·`raid`2·`ending`2) | +DEV `stage-jump.js` 2곳 |
| 5 | 부팅 시 초기 로드(await) + 실패 재시도 | 1 (`flow.js`) | 게임 상태·팀 목록·내 진행 |
| 6 | env 누락 안내/폴백 | 1 (`main.js`) | — |
| — | `getProgress`(12) · `findTeam`(8) · `getTeams`(7) · `getRanking`(3) · `getFinale`(3) | **0** | 동기 캐시 유지 → **화면 코드 무변경** |

### 폴백 스위치 (권장)
```
VITE_BACKEND=mock | supabase   (기본 supabase)
```
`lib/*` 내부에서 이 값으로 분기해 **행사 당일 서버 장애 시 mock 빌드로 즉시 되돌릴 수 있게** 둔다. mock 채점에 필요한 `SOLUTIONS`는 `src/js/dev/solutions.js`로 옮겨 **프로덕션 번들에서 제거**하고(DEV 전용 import), 비상용 mock 빌드는 별도로 만들어 둔다.

---

## 11. 마이그레이션·시드

```
supabase/
├─ migrations/
│  ├─ 0001_init.sql        # 테이블 · 뷰 · RLS · 함수/RPC · publication
│  ├─ 0002_seed_teams.sql  # 팀 33개 (mocks/teams.js 에서 생성)
│  └─ 0003_seed_answers.sql# case_answers (cases.js SOLUTIONS 에서 생성)
└─ README.md               # 적용 순서 · 재실행 방법 · 관리자 계정 등록 절차
```

1. **0001** — 위 §4~§7을 그대로 옮긴다. 멱등하게 작성(`create table if not exists`, `on conflict do nothing`).
2. **0002** — `scripts/export-teams.mjs`(신규)가 `src/js/mocks/teams.js`를 읽어 33개 INSERT를 생성. `id`는 현재 값 그대로 유지해야 기존 세션(`session.teamId`)과 호환된다.
3. **0003** — `scripts/export-answers.mjs`(신규)가 `SOLUTIONS`에서 `case_id, answer_index, analysis_ko, analysis_en`를 뽑아 INSERT를 생성. **이 파일은 절대 커밋하지 않는다**(`.gitignore`에 `supabase/migrations/0003_seed_answers.sql` 추가) — 정답이 저장소에 남지 않게 한다. 생성 → 적용 → 삭제.
   - ⚠️ **`scripts/validate.mjs`가 `SOLUTIONS`를 import한다**(정답 인덱스 범위·ko/en 해설 검증). `SOLUTIONS`를 `src/js/dev/solutions.js`로 옮기면 **검증 스크립트의 import 경로도 함께 바꿔야** 한다. 옮기지 않으면 `npm run validate`가 깨진다.
   - 런타임에서 `SOLUTIONS`를 참조하는 곳은 `lib/grade.js` **한 곳뿐**이다(실측) → 이관 영향 범위는 작다.
4. 관리자 계정: 대시보드에서 Auth 사용자 1명 생성 → `insert into admins(user_id) values ('...')`. Sign-up은 비활성화.
5. 적용은 로컬에서 `supabase db push` 또는 psql. **CI/브라우저에서 실행하지 않는다.**

---

## 12. 환경변수·키 관리

| 변수 | 위치 | 값 |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env.local`, Vercel(Production) | 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | `.env.local`, Vercel(Production) | anon(publishable) 키 — 공개 안전. 현 프로젝트는 **신형식 `sb_publishable_...`** 사용 |
| `VITE_BACKEND` | 선택 | `supabase`(기본) / `mock` |
| `SUPABASE_SERVICE_ROLE_KEY` | **로컬 셸에서만** | 시드 스크립트 실행용. `.env.local`에도 쓰지 않는 것을 권장 |

- `.gitignore`는 이미 `.env*`를 무시한다 → `.env.example`에 **키 이름만** 추가한다.
- `VITE_` 접두어가 붙은 값은 번들에 그대로 들어간다 → service_role 키에 절대 `VITE_`를 붙이지 않는다.
- 배포 후 확인: `dist/assets/*.js`에 `service_role` 문자열이 없는지 grep(§14 체크리스트).
- 현재 관리자 콘솔 비밀번호 `2026`은 번들에 노출된다 → Supabase Auth로 대체되며 상수는 제거한다.

### 키 형식 주의 (2026-08-04 실측)
발급된 키는 신형식 `sb_publishable_...`(레거시 JWT `eyJ...` 아님)이다. 검증 결과:
- `GET /auth/v1/health` + `apikey` 헤더 → **200**
- `GET /rest/v1/games?select=*` + `apikey` 헤더 → **PGRST205 (table not found)** = 인증 통과, 스키마가 비어 있음(마이그레이션 전 정상)
- `GET /rest/v1/` (OpenAPI 루트)만 401 — 신형식 키에서 스펙 조회가 제한된 것이며 실제 쿼리에는 영향 없다

⚠️ 신형식 키는 **최신 `@supabase/supabase-js`** 에서 지원된다. 설치 후 클라이언트가 키를 거부하면 대시보드 *Settings → API Keys → Legacy keys* 의 `anon` JWT 키로 교체한다(같은 권한).

### 필요한 패키지 (현재 미설치 — 실측)
`package.json`의 의존성은 `vite` 하나뿐이다. 연동에는 **`@supabase/supabase-js` 1개 설치가 필요**하다(REST·RPC·Auth·Realtime을 한 클라이언트로 처리).
- `npm i @supabase/supabase-js` — `CLAUDE.md §3`의 "임의 도입 금지"에 해당하므로 **설치 승인 필요**(§17-⑧).
- 번들 영향: 현재 JS gzip 55KB → 공식 클라이언트 추가 시 **+35~45KB(gzip) 예상**. 설치 후 실측하고, 필요하면 Realtime만 쓰는 경량 구성(REST는 `fetch` 직접 호출)으로 줄일 수 있다.
- 대안(비권장): 전부 `fetch`로 직접 호출하면 패키지는 0이지만 Realtime WebSocket 프로토콜을 직접 구현해야 해 2일 일정에 맞지 않는다.

---

## 13. 2일 작업 계획

전제: Supabase 프로젝트 생성 완료, 팀 로스터 확정, 정답 데이터 확정.

### Day 1 — 서버 골격 + 게임 상태 동기화 (약 8h)
| 시간 | 작업 | 완료 판정 |
|---|---|---|
| 1.0h | 프로젝트 생성 · env 세팅 · `lib/supabase.js` | 브라우저에서 `game_state()` 호출 성공 |
| 2.5h | `0001_init.sql` (테이블·뷰·RLS·함수) | §7.5 anon 침투 시도 전부 실패 |
| 1.0h | `0002/0003` 시드 (팀·정답) | 팀 33행, `case_answers` 15행 |
| 1.5h | `lib/game.js` 교체 (RPC + Realtime + 5초 폴링 + 서버시간 오프셋) | 두 기기에서 관리자 Start 후 5초 내 자동 전환 |
| 1.0h | 관리자 Auth + `admin_start_game/admin_end_game` + `?admin` 연결 | 로그인 후 시작/종료 동작, 비로그인 시 거부 |
| 1.0h | 예비(디버깅) | — |

### Day 2 — 팀 입장 · 제출 · 진행 (약 8h)
| 시간 | 작업 | 완료 판정 |
|---|---|---|
| 2.0h | `lib/entries.js` 교체 (claim/transfer/release + 토큰) | 기기 A 점유 → 기기 B가 이메일로 인계 → A는 팀 선택으로 되돌아감 |
| 2.5h | `lib/progress.js` + `lib/grade.js` 교체 (`submit_answer`·`my_progress`·`record_milestone`·`scoreboard`) | 제출 → 서버 채점·점수 반영, 새로고침 후 같은 지점 복구, 재제출 차단 |
| 1.0h | `SOLUTIONS` 이관 정리(`dev/solutions.js`) + `ensureStarted` 제거 + 부팅 시퀀스 | 프로덕션 번들에 정답 문자열 없음(grep) |
| 1.0h | 관리자 팀 현황·점수 조회 화면(뷰 SELECT + 5초 갱신) | 32팀 입장/점수 확인, 이메일 중복 플래그 표시 |
| 1.0h | 2기기 이상 전체 리허설(국문·영문) + 종료 시각 강제 확인 | §14 체크리스트 통과 |
| 0.5h | 롤백 경로 확인(`VITE_BACKEND=mock` 빌드) | mock 빌드로 전체 흐름 동작 |

**일정 리스크**: RLS·권한 디버깅이 가장 잘 늘어난다. Day 1의 §7.5 검증을 미루면 Day 2가 밀린다 → 예비 1시간은 여기에 쓴다.

---

## 14. 수락 기준 체크리스트

**흐름**
- [ ] 관리자 Start → **다른 기기**의 대기실이 5초 내 Stage 1로 전환(Realtime 또는 폴링)
- [ ] 관리자 Start 전에는 사건 화면에 접근 불가(서버 상태 기준)
- [ ] 15개 사건 제출·점수 반영, Stage별 점수 계산
- [ ] Stage 3 완료 → 임명 → Raid → 금배지 → 종료까지 저장 지점이 서버에 기록
- [ ] 새로고침·다른 기기 재접속 후 마지막 저장 지점으로 복구
- [ ] 이미 제출한 사건 재제출 차단(서버 유니크)
- [ ] `ends_at` 이후 제출 차단(서버 판정), 안내 표시

**보안**
- [ ] anon 키로 `teams.member_emails` / `answers` / `case_answers` 조회 실패
- [ ] anon 키로 `games` UPDATE, `answers` INSERT 실패
- [ ] 프로덕션 번들에 정답(`answerIndex`·해설 문자열) 없음
- [ ] 프로덕션 번들에 `service_role` 문자열 없음
- [ ] 관리자 RPC를 비로그인/비관리자 계정으로 호출 시 거부
- [ ] 다른 팀의 토큰 없이 그 팀 이름으로 제출 시도 → `not_owner`

**운영**
- [ ] Realtime 차단 환경(WebSocket 차단)에서 폴링만으로 전체 흐름 진행
- [ ] 네트워크 순간 단절 후 재시도로 제출 성공(중복 생성 없음)
- [ ] 관리자 화면에서 팀 입장 현황·점수·이메일 중복 확인
- [ ] `admin_reset_game(wipe)`으로 리허설 후 초기화

---

## 15. 실패 대비

| 상황 | 대응 |
|---|---|
| Realtime 미작동 | 5초 폴링(§8) — 설계상 기본 경로 |
| 제출 RPC 실패 | 사용자 안내 + 재시도. 유니크 제약으로 중복 저장 없음. 선택 상태는 화면에 유지 |
| Supabase 전체 장애 | `VITE_BACKEND=mock` 비상 빌드로 전환(팀별 기기 독립 진행, 점수는 수동 집계) |
| 진행 데이터 불일치 | `recalc_team_progress(team_id)`로 `answers`에서 재계산 |
| 팀 오선택 | 관리자 팀 현황에서 이메일 중복 확인 → `admin_reset` 또는 `release_team`로 정정(시작 전) |
| 종료 시각 오설정 | `admin_end_game()`으로 즉시 종료, 또는 `games.ends_at` SQL 수정 |

---

## 16. 이 설계가 만들지 않는 것

문제 CRUD · 참가자 로그인 · 랭킹 공개 토글 · Final Raid 관리자 개방(SCR-109) · 기여도 서버 검증 · 감사 로그 · 다중 관리자 등급 · Edge Function · 파일 스토리지 · 문제별 타이머 · 시간 보너스.
필요해지면 v2에서 다룬다. v1은 **"32팀이 각자 기기에서 같은 게임을 안전하게 끝까지 진행"** 만 만족시킨다.

---

## 16.1 사전 준비물 (착수 전 필요, 2026-08-04 실측)

| 항목 | 현재 상태 | 필요한 조치 |
|---|---|---|
| Supabase 프로젝트 | ✅ **생성 완료** (2026-08-04) — ref `teyngjaladwqolxwykqk`, API `https://teyngjaladwqolxwykqk.supabase.co` | 완료 |
| anon 키 | ✅ **설정 완료** — `.env.local`에 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY` 등록, 유효성 검증 통과(§12) | 완료 (Vercel Production 등록은 배포 전) |
| DB 스키마 | ✅ **비어 있음 확인** (`public.games` 없음) | `0001~0003` 마이그레이션 적용 |
| `supabase/` 디렉터리 | 비어 있음(파일 0개) | `migrations/` 3개 파일 작성 |
| `@supabase/supabase-js` | **미설치** | 설치 승인 후 `npm i`(§17-⑧) |
| `.env.example` | **없음** | 키 이름만 담아 커밋(값 없이) |
| Vercel 환경변수 | 미설정 | Production에 `VITE_SUPABASE_URL`·`VITE_SUPABASE_ANON_KEY` 등록 |
| 관리자 Auth 계정 | 없음 | 대시보드에서 1개 생성 + `admins` 등록, Sign-up 비활성화 |

**서버 연동 후 정리 대상(현재 mock 전용 도구)**
- DEV `team-manager.js`(팀 이름·색 편집) — localStorage를 고치므로 서버 값과 어긋난다 → 제거 또는 읽기 전용화.
- DEV `entry-monitor.js`(입장 현황·CSV) — 같은 이유. 기능은 관리자 `admin_team_status` 뷰 화면으로 대체한다(§6.2).
- `lib/game.js`의 `ensureStarted()` — 클라이언트가 게임을 시작하는 함수라 서버 권위와 충돌 → 삭제(§10).

---

## 17. 구현 시작 전 확정할 것

저장소에서 확인 가능한 것은 **검증 완료**(✔), 운영 판단이 필요한 것만 남겼다.

| # | 항목 | 선택지 | 권장 / 검증 결과 |
|---|---|---|---|
| ① | 정답·해설 위치 | **A 확정** — `case_answers` 테이블 이관 + 서버 채점 | ✅ 2026-08-04 결정. 런타임 참조는 `lib/grade.js` 1곳, 검증 스크립트 import 경로 동반 수정(§11-3) |
| ② | `games.status` 값 | **3단계 확정** (`scheduled/started/ended`) | ✅ 현재 코드는 두 값만 사용 → `ended`만 신규 |
| ③ | 종료 시각 도달 시 참가자 화면 | **A 확정** — 화면 유지 + 제출 차단 안내 | ✅ 2026-08-04 결정. 신규 기능이므로 동작 명세를 §9.1에 확정 |
| ④ | 팀 id 체계 | 현재 값 유지 vs uuid 재발급 | **유지 확정 가능**. ✔ 검증: `team01`~`team32` + `team-test` = 33개, 고정·유일. 단 DEV '팀 관리'가 만드는 id는 `team-<timestamp>`이며 서버 연동 후 그 도구는 무의미해진다(§16-보류 항목) |
| ⑤ | 관리자 계정 수 | **1개(공용) 기본값 채택** | 별도 지시 없으면 공용 1계정으로 진행. `admins`에 행을 추가하면 언제든 확장 |
| ⑥ | Stage 2 임시 콘텐츠 | 서버 연동 전 확정 vs 임시 유지 | **독립**. ✔ 확정되면 `cases.js` 교체 + `0003` 재시드만 하면 된다(서버 스키마 영향 없음) |
| ⑦ | **서약(SCR-004) 저장 위치** | (A′) `pledged_at` 1컬럼 + `record_milestone`에 `'pledged'` 추가 (약 10분) / (B) 로컬 유지(0분, 기기 인계 시 재서약 10초) / (A) 컬럼 2개 + 서명자 기록 | 🟡 **미결**. A′ 권장. B를 택하면 `docs/game-flow.md §18`의 저장 지점에서 이탈하므로 그 사실을 문서에 명시한다 |
| ⑧ | 패키지 설치 | **승인됨** — `@supabase/supabase-js` 1개 | ✅ 2026-08-04 승인. Day 1 1시간차에 `npm i` 실행, 설치 후 번들 증가 실측 기록 |

---

## 17.1 확정 사항 (2026-08-04)

```
① 정답·해설  → 서버 이관 확정. cases.js 는 본문만 유지, 채점은 submit_answer RPC
② 게임 상태  → scheduled / started / ended 3단계
③ 종료 처리  → 화면 유지 + 제출 차단 안내 (동작 명세 §9.1)
④ 팀 id      → team01~team32 + team-test 그대로 시드
⑤ 관리자     → 공용 1계정 (기본값)
⑥ Stage 2    → 서버 작업과 독립. 확정 시 cases.js 교체 + 0003 재시드
⑧ 패키지     → @supabase/supabase-js 설치 승인
⑦ 서약 저장  → 미결 (A′ 권장: pledged_at 1컬럼)
```

**①에 따른 구체 작업**
1. `src/js/data/cases.js`의 `SOLUTIONS` 블록을 `src/js/dev/solutions.js`로 이동(DEV·검증 전용, 프로덕션 번들 제외).
2. `scripts/export-answers.mjs`로 `0003_seed_answers.sql` 생성 → 적용 → 파일 삭제(커밋 금지).
3. `scripts/validate.mjs`의 import 경로를 `dev/solutions.js`로 변경(정답 검증 유지).
4. `lib/grade.js`는 `submit_answer` 반환값을 그대로 전달하는 얇은 래퍼로 축소.
5. 빌드 후 `dist/assets/*.js`에서 정답 문자열이 사라졌는지 grep 검증(§14).

⑦이 A′로 확정되면 `teams.pledged_at` 1컬럼 + `record_milestone`의 마일스톤 목록에 `'pledged'`를 추가하고, 서약 화면에서 호출한다. B로 확정되면 `teams`의 `pledged_at`·`signer_name` 컬럼을 스키마에서 제거하고 §4.2 주석에 이탈 사유를 남긴다.

---

_이 문서는 구현 착수 시 결정 사항(§17)을 반영해 갱신하고, 스키마가 바뀌면 `supabase/migrations`와 함께 버전을 맞춘다._
