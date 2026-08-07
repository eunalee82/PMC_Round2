-- ════════════════════════════════════════════════════════════════════════════
-- 0012_cases_content.sql — 사건 "본문"을 서버로 이관 (문제 유출 방지)
--
-- 배경: 정답·해설은 이미 case_answers 로 옮겨져 있었으나(0001), 사건 본문(제목·brief·prompt·
--       선택지·evidence)은 여전히 브라우저 번들(src/js/data/cases.js)에 있어 추출 가능했다.
--       이 마이그레이션이 본문을 public.cases 로 옮기고, 참가자는 get_cases RPC 로만 받는다.
--
-- 원칙(0001 과 동일):
--   · public.cases 는 case_answers 처럼 **어떤 역할도 직접 SELECT 못 한다**(GRANT 없음 · RLS 거부).
--   · 본문은 오직 SECURITY DEFINER 함수 get_cases 로만 나간다.
--   · LIVE(참가자)는 games.status='started' + 팀 토큰이 있어야 받는다 → 사전·미인증 유출 차단.
--   · 관리자(is_admin())는 검수(PREVIEW)용으로 상태와 무관하게 받는다. 정답·해설은 여기서 안 나간다.
--
-- 적용 순서: 0012(스키마) → 0013_seed_cases.sql(본문 시드, scripts/export-cases.mjs 로 생성)
-- 멱등: create ... if not exists / create or replace / drop policy if exists
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════ 1. 테이블 ════════════════════════
-- content_ko / content_en = jsonb { title, brief, prompt, evidence, choices }
-- en 은 부분일 수 있다 → 조회 시 content_ko || content_en 로 병합(en 이 있는 키만 덮어씀 = localizeCase 규칙).
create table if not exists public.cases (
  case_id      text primary key,
  stage        smallint not null check (stage between 1 and 3),
  case_no      smallint not null,
  file_no      text,
  choice_count smallint not null default 0,
  multi        boolean  not null default false,
  select_count smallint not null default 1,
  content_ko   jsonb    not null,
  content_en   jsonb,
  updated_at   timestamptz not null default now()
);

-- ════════════════════════ 2. 조회 RPC ════════════════════════
-- 반환: [{ case_id, content }]  — content 는 로케일 반영된 본문(정답 없음).
-- 참가자: 토큰 검증 + started 확인. 관리자: 검수용 무조건 허용.
create or replace function public.get_cases(
  p_team_id text default null,
  p_token   uuid default null,
  p_locale  text default 'ko'
) returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare v_status text;
begin
  if not public.is_admin() then
    perform public.assert_team_token(p_team_id, p_token);      -- 참가자: 팀 토큰 필수(미인증 anon 차단)
    select status into v_status from public.games where id = 1;
    if v_status = 'ended'      then raise exception 'game_ended';       end if;  -- 종료 후 조회 차단
    if v_status <> 'started'   then raise exception 'game_not_started'; end if;  -- 시작 전 조회 차단
  end if;

  return (
    select coalesce(jsonb_agg(
             jsonb_build_object(
               'case_id', c.case_id,
               'content', case
                            when p_locale = 'en' and c.content_en is not null
                            then c.content_ko || c.content_en   -- en 이 있는 키만 덮어씀(evidence 포함)
                            else c.content_ko
                          end
             )
             order by c.stage, c.case_no
           ), '[]'::jsonb)
      from public.cases c
  );
end;
$$;

-- ════════════════════════ 3. RLS + 권한 ════════════════════════
alter table public.cases enable row level security;
-- 정책을 만들지 않는다 → anon·authenticated 직접 SELECT 전면 거부(case_answers 와 동일).
revoke all on public.cases from anon, authenticated;

-- 함수 실행 권한: 기본 PUBLIC 회수 후 재부여
revoke execute on function public.get_cases(text, uuid, text) from public;
grant  execute on function public.get_cases(text, uuid, text) to anon, authenticated;

-- ════════════════════════ 완료 ════════════════════════
-- 다음: node scripts/export-cases.mjs 로 0013_seed_cases.sql 생성 → 실행 → 파일 삭제(커밋 금지).
-- 검증(anon 키로 아래가 실패해야 한다):
--   select * from public.cases;                          → 권한 오류
--   select content_ko from public.cases limit 1;         → 권한 오류
--   select public.get_cases(null, null, 'ko');           → not_owner(토큰 없음)
