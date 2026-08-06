-- ════════════════════════════════════════════════════════════════════════════
-- PM보호국 · Supabase 최소 연동 — 초기 스키마
-- 설계: docs/supabase-minimum-design.md (2026-08-04 확정본)
--
-- 적용: Supabase 대시보드 → SQL Editor 에 전체 붙여넣기 → Run
-- 멱등: 재실행 가능 (create ... if not exists / drop policy if exists / create or replace)
--
-- 원칙
--   · 쓰기는 전부 SECURITY DEFINER RPC 로만. anon 에는 INSERT/UPDATE 정책을 만들지 않는다.
--   · 참가자는 로그인하지 않는다 — 팀 소유는 claim_token(uuid)으로 증명한다.
--   · 정답(case_answers)은 어떤 역할도 직접 읽을 수 없다. 채점 RPC 내부에서만 읽는다.
--   · 시작·종료 시각과 제출 가능 판정은 서버 now() 기준.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ════════════════════════ 1. 테이블 ════════════════════════

-- 1.1 게임 상태 (단일 로우)
create table if not exists public.games (
  id                integer primary key default 1 check (id = 1),
  status            text    not null default 'scheduled'
                    check (status in ('scheduled','started','ended')),
  duration_minutes  integer not null default 80,  -- 운영 결정 2026-08-06: 60 → 80분 (0010 참조)
  started_at        timestamptz,
  ends_at           timestamptz,
  updated_at        timestamptz not null default now()
);
insert into public.games (id) values (1) on conflict (id) do nothing;

-- 1.2 팀 로스터 + 입장(점유)
--     서약(pledged_at/signer_name)은 서버에 저장하지 않는다 — 운영 결정 2026-08-04(설계 §17-⑦ = B).
--     세션(localStorage)에만 남기므로 기기 인계 시 새 기기에서 서약을 한 번 더 받는다.
create table if not exists public.teams (
  id             text primary key,
  name           text not null,
  color          text not null,
  sort_order     integer not null,
  is_test        boolean not null default false,
  member_emails  text[]  not null default '{}',   -- PII · anon 접근 금지
  device_id      text,                            -- anon 접근 금지
  claim_token    uuid,                            -- anon 접근 금지
  entered_at     timestamptz,
  transferred_at timestamptz,
  flags          text[]  not null default '{}',
  updated_at     timestamptz not null default now()
);

-- 1.3 제출 원본 (진실의 원천)
create table if not exists public.answers (
  id            bigint generated always as identity primary key,
  team_id       text     not null references public.teams(id) on delete cascade,
  case_id       text     not null,
  stage         smallint not null check (stage between 1 and 3),
  choice_index  smallint not null check (choice_index >= 0),
  is_correct    boolean  not null,
  points        smallint not null default 0,
  submitted_at  timestamptz not null default now(),
  unique (team_id, case_id)                        -- 중복 제출 서버 차단
);
create index if not exists answers_team_idx on public.answers (team_id);

-- 1.4 진행 상태 투영 (RPC가 갱신, answers 로부터 재계산 가능)
create table if not exists public.team_progress (
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
  appointed_at      timestamptz,
  raid_started_at   timestamptz,
  raid_ended_at     timestamptz,
  raid_hits         integer  not null default 0,
  raid_damage       integer  not null default 0,
  badge_at          timestamptz,
  ended_at          timestamptz,
  updated_at        timestamptz not null default now()
);

-- 1.5 정답·해설 (anon/authenticated 직접 접근 전면 금지)
create table if not exists public.case_answers (
  case_id      text primary key,
  stage        smallint not null check (stage between 1 and 3),
  answer_index smallint not null,
  analysis_ko  text not null,
  analysis_en  text
);

-- 1.6 관리자 허용 목록
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  note    text
);

-- ════════════════════════ 2. 내부 함수 ════════════════════════

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- 팀 소유 증명. 실패 시 예외(권한 오류)로 중단한다.
create or replace function public.assert_team_token(p_team_id text, p_token uuid)
returns void language plpgsql stable security definer set search_path = public, pg_temp as $$
begin
  if p_token is null then raise exception 'not_owner' using errcode = '42501'; end if;
  if not exists (select 1 from public.teams t where t.id = p_team_id and t.claim_token = p_token) then
    raise exception 'not_owner' using errcode = '42501';
  end if;
end;
$$;

-- 이메일 정규화 (클라이언트 utils/email.js normalizeEmail 과 같은 규칙)
create or replace function public.norm_email(p_raw text)
returns text language sql immutable set search_path = pg_temp as $$
  select regexp_replace(
           lower(replace(regexp_replace(coalesce(p_raw,''), '\s+', '', 'g'), '＠', '@')),
           '[.,;]+$', ''
         );
$$;

-- 형식 의심 여부 (차단이 아니라 flags 표시용 · utils/email.js isSuspect 근사)
create or replace function public.email_suspect(p_email text)
returns boolean language sql immutable set search_path = pg_temp as $$
  select case
    when coalesce(p_email,'') = '' then false
    when p_email !~ '^[a-z0-9._%+-]+@[^@\s]+\.[^@\s]+$' then true
    when p_email ~ '[ㄱ-ㅎㅏ-ㅣ가-힣]' then true
    else false
  end;
$$;

-- answers 로부터 team_progress 재계산 (운영 복구용)
create or replace function public.recalc_team_progress(p_team_id text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.team_progress (team_id) values (p_team_id) on conflict (team_id) do nothing;
  update public.team_progress p set
    score            = coalesce(s.score, 0),
    solved_count     = coalesce(s.solved, 0),
    submitted_count  = coalesce(s.submitted, 0),
    stage1_solved    = coalesce(s.s1_solved, 0),
    stage2_solved    = coalesce(s.s2_solved, 0),
    stage3_solved    = coalesce(s.s3_solved, 0),
    stage1_submitted = coalesce(s.s1_sub, 0),
    stage2_submitted = coalesce(s.s2_sub, 0),
    stage3_submitted = coalesce(s.s3_sub, 0),
    last_submit_at   = s.last_at,
    updated_at       = now()
  from (
    select sum(points) as score,
           count(*) filter (where is_correct) as solved,
           count(*) as submitted,
           count(*) filter (where is_correct and stage = 1) as s1_solved,
           count(*) filter (where is_correct and stage = 2) as s2_solved,
           count(*) filter (where is_correct and stage = 3) as s3_solved,
           count(*) filter (where stage = 1) as s1_sub,
           count(*) filter (where stage = 2) as s2_sub,
           count(*) filter (where stage = 3) as s3_sub,
           max(submitted_at) as last_at
    from public.answers where team_id = p_team_id
  ) s
  where p.team_id = p_team_id;
end;
$$;

-- ════════════════════════ 3. 참가자 RPC ════════════════════════

-- 3.1 게임 상태 + 서버 시간 (Realtime 폴백 폴링도 이걸 호출한다)
create or replace function public.game_state()
returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select jsonb_build_object(
    'status',           g.status,
    'duration_minutes', g.duration_minutes,
    'started_at',       g.started_at,
    'ends_at',          g.ends_at,
    'server_now',       now()
  ) from public.games g where g.id = 1;
$$;

-- 3.2 팀 점유 (신규 등록 + 같은 기기의 이메일 수정 겸용)
create or replace function public.claim_team(
  p_team_id   text,
  p_emails    text[],
  p_device_id text,
  p_token     uuid default null
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_team   public.teams;
  v_token  uuid;
  v_norm   text[];
  v_flags  text[] := '{}';
begin
  select * into v_team from public.teams where id = p_team_id for update;
  if not found then raise exception 'team_not_found'; end if;

  -- 다른 기기가 이미 점유 → 인계(verify_and_transfer) 경로로 보낸다
  if v_team.claim_token is not null and (p_token is null or p_token <> v_team.claim_token) then
    raise exception 'claimed';
  end if;

  select array_agg(public.norm_email(e) order by ord)
    into v_norm
    from unnest(p_emails) with ordinality as t(e, ord)
   where public.norm_email(e) <> '';

  if coalesce(array_length(v_norm, 1), 0) <> 3 then
    raise exception 'emails_required';            -- 빈칸 차단 (운영 원칙: 형식은 막지 않는다)
  end if;
  if (select count(distinct x) from unnest(v_norm) x) <> 3 then
    raise exception 'emails_duplicated';          -- 팀 내 중복 차단
  end if;
  if exists (select 1 from unnest(v_norm) x where public.email_suspect(x)) then
    v_flags := array['suspect'];                  -- 통과시키고 운영진 확인용 플래그만 남긴다
  end if;

  -- 기기당 1팀 — 같은 기기가 쥔 다른 팀의 점유를 먼저 비운다(운영 보드 정확도)
  update public.teams
     set claim_token = null, device_id = null, entered_at = null,
         member_emails = '{}', flags = '{}', updated_at = now()
   where device_id = p_device_id and id <> p_team_id;

  v_token := coalesce(v_team.claim_token, gen_random_uuid());

  update public.teams
     set member_emails = v_norm,
         device_id     = p_device_id,
         claim_token   = v_token,
         entered_at    = coalesce(v_team.entered_at, now()),
         flags         = v_flags,
         updated_at    = now()
   where id = p_team_id;

  insert into public.team_progress (team_id) values (p_team_id) on conflict (team_id) do nothing;

  return jsonb_build_object('ok', true, 'token', v_token, 'flags', v_flags,
                            'entered_at', coalesce(v_team.entered_at, now()));
end;
$$;

-- 3.3 다른 기기 인계 — 등록된 이메일 중 하나를 증명하면 토큰을 재발급한다
create or replace function public.verify_and_transfer(
  p_team_id   text,
  p_email     text,
  p_device_id text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_team public.teams; v_token uuid;
begin
  select * into v_team from public.teams where id = p_team_id for update;
  if not found then raise exception 'team_not_found'; end if;
  if not (public.norm_email(p_email) = any (v_team.member_emails)) then
    raise exception 'email_not_registered';
  end if;

  update public.teams
     set claim_token = null, device_id = null, entered_at = null,
         member_emails = '{}', flags = '{}', updated_at = now()
   where device_id = p_device_id and id <> p_team_id;   -- 기기당 1팀

  v_token := gen_random_uuid();                          -- 재발급 → 이전 기기 토큰 무효
  update public.teams
     set claim_token = v_token, device_id = p_device_id,
         transferred_at = now(), updated_at = now()
   where id = p_team_id;

  return jsonb_build_object('ok', true, 'token', v_token);
end;
$$;

-- 3.4 점유 해제 (본인 기기)
create or replace function public.release_team(p_team_id text, p_token uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.assert_team_token(p_team_id, p_token);
  update public.teams
     set claim_token = null, device_id = null, entered_at = null,
         member_emails = '{}', flags = '{}', updated_at = now()
   where id = p_team_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- 3.5 답안 제출 = 채점 + 저장 + 진행 갱신 (한 트랜잭션)
create or replace function public.submit_answer(
  p_team_id      text,
  p_token        uuid,
  p_case_id      text,
  p_stage        smallint,
  p_choice_index smallint,
  p_locale       text default 'ko'
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  POINTS_PER_CASE constant smallint := 20;   -- 20점 × 15사건 = 300점 만점
  v_game    public.games;
  v_ans     public.case_answers;
  v_correct boolean;
  v_points  smallint := 0;
  v_stage   smallint;
  v_prog    public.team_progress;
begin
  perform public.assert_team_token(p_team_id, p_token);

  select * into v_game from public.games where id = 1;
  if v_game.status <> 'started' then raise exception 'game_not_started'; end if;
  if v_game.ends_at is not null and now() >= v_game.ends_at then raise exception 'game_ended'; end if;

  select * into v_ans from public.case_answers where case_id = p_case_id;
  if not found then raise exception 'unknown_case'; end if;

  v_correct := (p_choice_index = v_ans.answer_index);
  if v_correct then v_points := POINTS_PER_CASE; end if;
  v_stage := v_ans.stage;   -- 서버가 stage 를 확정한다(클라이언트 p_stage 는 신뢰하지 않는다)

  begin
    insert into public.answers (team_id, case_id, stage, choice_index, is_correct, points)
    values (p_team_id, p_case_id, v_stage, p_choice_index, v_correct, v_points);
  exception when unique_violation then
    raise exception 'already_submitted';
  end;

  insert into public.team_progress (team_id) values (p_team_id) on conflict (team_id) do nothing;
  update public.team_progress set
    score            = score + v_points,
    solved_count     = solved_count + (case when v_correct then 1 else 0 end),
    submitted_count  = submitted_count + 1,
    stage1_solved    = stage1_solved + (case when v_correct and v_stage = 1 then 1 else 0 end),
    stage2_solved    = stage2_solved + (case when v_correct and v_stage = 2 then 1 else 0 end),
    stage3_solved    = stage3_solved + (case when v_correct and v_stage = 3 then 1 else 0 end),
    stage1_submitted = stage1_submitted + (case when v_stage = 1 then 1 else 0 end),
    stage2_submitted = stage2_submitted + (case when v_stage = 2 then 1 else 0 end),
    stage3_submitted = stage3_submitted + (case when v_stage = 3 then 1 else 0 end),
    last_submit_at   = now(),
    updated_at       = now()
  where team_id = p_team_id
  returning * into v_prog;

  return jsonb_build_object(
    'is_correct',    v_correct,
    'correct_index', v_ans.answer_index,
    'analysis',      case when p_locale = 'en' and v_ans.analysis_en is not null
                          then v_ans.analysis_en else v_ans.analysis_ko end,
    'points',        v_points,
    'score',         v_prog.score,
    'stage',         v_stage,
    'stage_solved',  case v_stage when 1 then v_prog.stage1_solved
                                  when 2 then v_prog.stage2_solved
                                  else v_prog.stage3_solved end,
    'submitted_count', v_prog.submitted_count
  );
end;
$$;

-- 3.6 내 팀 진행 상태 (새로고침 복구용) — 제출 목록은 여기서만 나간다
create or replace function public.my_progress(p_team_id text, p_token uuid)
returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_prog public.team_progress; v_submitted text[]; v_solved text[];
begin
  perform public.assert_team_token(p_team_id, p_token);
  select * into v_prog from public.team_progress where team_id = p_team_id;

  select coalesce(array_agg(case_id order by submitted_at), '{}') into v_submitted
    from public.answers where team_id = p_team_id;
  select coalesce(array_agg(case_id order by submitted_at), '{}') into v_solved
    from public.answers where team_id = p_team_id and is_correct;

  return jsonb_build_object(
    'score',            coalesce(v_prog.score, 0),
    'stage',            jsonb_build_object('1', coalesce(v_prog.stage1_solved,0),
                                           '2', coalesce(v_prog.stage2_solved,0),
                                           '3', coalesce(v_prog.stage3_solved,0)),
    'submittedStage',   jsonb_build_object('1', coalesce(v_prog.stage1_submitted,0),
                                           '2', coalesce(v_prog.stage2_submitted,0),
                                           '3', coalesce(v_prog.stage3_submitted,0)),
    'submitted',        to_jsonb(v_submitted),
    'solved',           to_jsonb(v_solved),
    'lastSubmitAt',     v_prog.last_submit_at,
    'finale', jsonb_build_object(
      'appointedAt',   v_prog.appointed_at,
      'raidStartedAt', v_prog.raid_started_at,
      'raidEndedAt',   v_prog.raid_ended_at,
      'raidHits',      coalesce(v_prog.raid_hits, 0),
      'raidDamage',    coalesce(v_prog.raid_damage, 0),
      'badgeAt',       v_prog.badge_at,
      'endedAt',       v_prog.ended_at
    )
  );
end;
$$;

-- 3.7 종반부 저장 지점 — 시각은 서버가 최초 1회만 기록, 누적치는 최대값 유지
create or replace function public.record_milestone(
  p_team_id   text,
  p_token     uuid,
  p_milestone text,
  p_hits      integer default null,
  p_damage    integer default null
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_prog public.team_progress; v_cleared boolean;
begin
  perform public.assert_team_token(p_team_id, p_token);
  if p_milestone not in ('appointed','raid_started','raid_ended','badge','finished') then
    raise exception 'unknown_milestone';
  end if;

  insert into public.team_progress (team_id) values (p_team_id) on conflict (team_id) do nothing;

  -- 종반부 진입 자격: Stage 1~3 모두 제출 (클라이언트 가드와 이중화).
  -- 필요 사건 수는 case_answers 에서 세므로 콘텐츠 수가 바뀌어도 따라간다(Stage 2 확정 대비).
  select (p.stage1_submitted >= t.s1 and p.stage2_submitted >= t.s2 and p.stage3_submitted >= t.s3)
    into v_cleared
    from public.team_progress p
    cross join (
      select count(*) filter (where stage = 1) as s1,
             count(*) filter (where stage = 2) as s2,
             count(*) filter (where stage = 3) as s3
        from public.case_answers
    ) t
   where p.team_id = p_team_id;
  if not coalesce(v_cleared, false) then raise exception 'stages_not_cleared'; end if;

  update public.team_progress set
    appointed_at    = case when p_milestone = 'appointed'    then coalesce(appointed_at, now())    else appointed_at end,
    raid_started_at = case when p_milestone = 'raid_started' then coalesce(raid_started_at, now()) else raid_started_at end,
    raid_ended_at   = case when p_milestone = 'raid_ended'   then coalesce(raid_ended_at, now())   else raid_ended_at end,
    badge_at        = case when p_milestone = 'badge'        then coalesce(badge_at, now())        else badge_at end,
    ended_at        = case when p_milestone = 'finished'     then coalesce(ended_at, now())        else ended_at end,
    raid_hits       = greatest(raid_hits,   coalesce(p_hits, 0)),
    raid_damage     = greatest(raid_damage, coalesce(p_damage, 0)),
    updated_at      = now()
  where team_id = p_team_id
  returning * into v_prog;

  return jsonb_build_object('finale', jsonb_build_object(
    'appointedAt',   v_prog.appointed_at,
    'raidStartedAt', v_prog.raid_started_at,
    'raidEndedAt',   v_prog.raid_ended_at,
    'raidHits',      v_prog.raid_hits,
    'raidDamage',    v_prog.raid_damage,
    'badgeAt',       v_prog.badge_at,
    'endedAt',       v_prog.ended_at
  ));
end;
$$;

-- ════════════════════════ 4. 관리자 RPC ════════════════════════

create or replace function public.admin_start_game(p_duration_minutes integer default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_game public.games; v_dur integer;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select * into v_game from public.games where id = 1 for update;
  if v_game.status = 'started' then return public.game_state(); end if;   -- 멱등

  v_dur := coalesce(p_duration_minutes, v_game.duration_minutes);
  update public.games
     set status = 'started', duration_minutes = v_dur,
         started_at = now(), ends_at = now() + make_interval(mins => v_dur),
         updated_at = now()
   where id = 1;
  return public.game_state();
end;
$$;

create or replace function public.admin_end_game()
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.games
     set status = 'ended',
         ends_at = least(coalesce(ends_at, now()), now()),
         updated_at = now()
   where id = 1;
  return public.game_state();
end;
$$;

-- 리허설 전용: 대기 상태로 되돌린다. p_wipe_progress=true 면 제출·진행·점유까지 초기화.
create or replace function public.admin_reset_game(p_wipe_progress boolean default false)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.games
     set status = 'scheduled', started_at = null, ends_at = null, updated_at = now()
   where id = 1;

  if p_wipe_progress then
    delete from public.answers;
    delete from public.team_progress;
    update public.teams
       set claim_token = null, device_id = null, entered_at = null, transferred_at = null,
           member_emails = '{}', flags = '{}', updated_at = now();
  end if;
  return public.game_state();
end;
$$;

-- ════════════════════════ 5. 뷰 ════════════════════════
-- security_invoker = true → 기반 테이블의 RLS/권한을 그대로 따른다(정의자 우회 금지)

create or replace view public.scoreboard with (security_invoker = true) as
  select t.id as team_id, t.name, t.sort_order,
         coalesce(p.score, 0)        as score,
         coalesce(p.solved_count, 0) as solved_count,
         p.last_submit_at,
         coalesce(p.raid_hits, 0)    as raid_hits
    from public.teams t
    left join public.team_progress p on p.team_id = t.id;

create or replace view public.admin_scoreboard with (security_invoker = true) as
  select rank() over (
           order by coalesce(p.score,0) desc,
                    coalesce(p.solved_count,0) desc,
                    p.last_submit_at asc nulls last,
                    coalesce(p.raid_hits,0) desc
         ) as rank,
         t.id as team_id, t.name, t.sort_order,
         coalesce(p.score,0)            as score,
         coalesce(p.stage1_solved,0)    as stage1_solved,
         coalesce(p.stage2_solved,0)    as stage2_solved,
         coalesce(p.stage3_solved,0)    as stage3_solved,
         coalesce(p.solved_count,0)     as solved_count,
         coalesce(p.submitted_count,0)  as submitted_count,
         p.last_submit_at,
         coalesce(p.raid_hits,0)        as raid_hits,
         p.appointed_at, p.raid_ended_at, p.ended_at
    from public.teams t
    left join public.team_progress p on p.team_id = t.id;

create or replace view public.admin_team_status with (security_invoker = true) as
  select t.id as team_id, t.name, t.sort_order,
         (t.entered_at is not null) as is_claimed,
         t.member_emails, t.entered_at, t.transferred_at, t.flags,
         coalesce(p.submitted_count,0) as submitted_count,
         coalesce(p.score,0)           as score,
         p.last_submit_at              -- 마지막 답안 제출 시각 (0011 에서 추가)
    from public.teams t
    left join public.team_progress p on p.team_id = t.id;

-- ════════════════════════ 6. RLS ════════════════════════

alter table public.games         enable row level security;
alter table public.teams         enable row level security;
alter table public.answers       enable row level security;
alter table public.team_progress enable row level security;
alter table public.case_answers  enable row level security;
alter table public.admins        enable row level security;

-- 6.1 games — 누구나 읽기(Realtime 수신 전제). 쓰기 정책 없음 → 관리자 RPC만 변경 가능
drop policy if exists games_read_all on public.games;
create policy games_read_all on public.games for select to anon, authenticated using (true);

-- 6.2 teams — 행은 전부 허용하되 anon 은 컬럼 GRANT 로 제한 (§6.5)
drop policy if exists teams_read_all on public.teams;
drop policy if exists teams_read_anon on public.teams;
drop policy if exists teams_read_admin on public.teams;
-- anon: 모든 행 허용하되 §6.5 컬럼 GRANT 로 이메일·토큰은 읽지 못한다
create policy teams_read_anon on public.teams for select to anon using (true);
-- authenticated: 관리자만. (계정이 관리자뿐이어도 정책으로 한 번 더 막는다 — 이메일은 PII)
create policy teams_read_admin on public.teams for select to authenticated using (public.is_admin());

-- 6.3 answers / team_progress — 관리자 읽기 + 점수판용 anon 읽기
drop policy if exists answers_admin_read on public.answers;
create policy answers_admin_read on public.answers for select to authenticated using (public.is_admin());

drop policy if exists tp_admin_read on public.team_progress;
create policy tp_admin_read on public.team_progress for select to authenticated using (public.is_admin());

drop policy if exists tp_public_score on public.team_progress;
create policy tp_public_score on public.team_progress for select to anon using (true);

-- 6.4 case_answers / admins — 정책 없음(=전면 거부). 정답은 RPC 내부에서만 읽힌다
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());

-- 6.5 테이블 권한 — Supabase 는 public 스키마 테이블에 anon/authenticated 기본 권한을 넓게 준다.
--     따라서 **전부 회수한 뒤 필요한 것만 재부여**한다. (revoke 를 반드시 먼저 실행)
revoke all on public.games, public.teams, public.answers,
              public.team_progress, public.case_answers, public.admins
  from anon, authenticated;

-- 참가자(anon): 게임 상태 전체 + 팀/점수는 화이트리스트 컬럼만. 쓰기 권한은 주지 않는다.
grant select on public.games to anon, authenticated;
grant select (id, name, color, sort_order, is_test, entered_at) on public.teams to anon;
grant select (team_id, score, solved_count, last_submit_at, raid_hits) on public.team_progress to anon;

-- 관리자(authenticated): 테이블 읽기는 열되 RLS(is_admin())가 실제 접근을 통제한다.
grant select on public.teams, public.team_progress, public.answers, public.admins to authenticated;

-- 뷰: security_invoker=true 이므로 위 컬럼 권한 + RLS 를 그대로 따른다.
grant select on public.scoreboard to anon, authenticated;
grant select on public.admin_scoreboard, public.admin_team_status to authenticated;

-- case_answers 는 어떤 역할에도 부여하지 않는다 → 정답은 RPC 내부에서만 읽힌다.

-- ════════════════════════ 7. 함수 실행 권한 ════════════════════════
-- create function 은 기본적으로 PUBLIC 에 EXECUTE 를 준다 → 명시적으로 회수 후 재부여

revoke execute on function public.is_admin()                              from public;
revoke execute on function public.assert_team_token(text, uuid)           from public;
revoke execute on function public.recalc_team_progress(text)              from public;
revoke execute on function public.norm_email(text)                        from public;
revoke execute on function public.email_suspect(text)                     from public;
revoke execute on function public.game_state()                            from public;
revoke execute on function public.claim_team(text, text[], text, uuid)    from public;
revoke execute on function public.verify_and_transfer(text, text, text)   from public;
revoke execute on function public.release_team(text, uuid)                from public;
revoke execute on function public.submit_answer(text, uuid, text, smallint, smallint, text) from public;
revoke execute on function public.my_progress(text, uuid)                 from public;
revoke execute on function public.record_milestone(text, uuid, text, integer, integer) from public;
revoke execute on function public.admin_start_game(integer)               from public;
revoke execute on function public.admin_end_game()                        from public;
revoke execute on function public.admin_reset_game(boolean)               from public;

grant execute on function public.game_state()                            to anon, authenticated;
grant execute on function public.claim_team(text, text[], text, uuid)    to anon, authenticated;
grant execute on function public.verify_and_transfer(text, text, text)   to anon, authenticated;
grant execute on function public.release_team(text, uuid)                to anon, authenticated;
grant execute on function public.submit_answer(text, uuid, text, smallint, smallint, text) to anon, authenticated;
grant execute on function public.my_progress(text, uuid)                 to anon, authenticated;
grant execute on function public.record_milestone(text, uuid, text, integer, integer) to anon, authenticated;

grant execute on function public.admin_start_game(integer)  to authenticated;
grant execute on function public.admin_end_game()           to authenticated;
grant execute on function public.admin_reset_game(boolean)  to authenticated;
grant execute on function public.is_admin()                 to authenticated;

-- ════════════════════════ 8. Realtime ════════════════════════
-- games.status 변경을 대기실이 즉시 받는다. 실패 시 클라이언트가 5초 폴링으로 내려간다.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'games'
     )
  then
    alter publication supabase_realtime add table public.games;
  end if;
end $$;

-- ════════════════════════ 완료 ════════════════════════
-- 다음: 0002_seed_teams.sql (팀 33개) → 0003_seed_answers.sql (정답 15개, 커밋 금지)
