-- ════════════════════════════════════════════════════════════════════════════
-- 0015_practice_mode.sql — 공개 연습 모드(solo): 팀 없이 누구나 사건을 풀 수 있게
--
-- 배경(운영 결정 2026-08-19): 행사(팀 대항)와 별개로, 상시 공개 URL 로 들어온 누구나 팀 선택 없이
--   바로 사건을 풀어볼 수 있어야 한다. 클라이언트는 lib/mode.js 의 solo 모드로 이 흐름을 탄다.
--
-- 왜 함수를 새로 만드는가:
--   · get_cases   는 팀 토큰 + games.status='started' 를 요구한다 → 연습에는 둘 다 없다.
--   · submit_answer 는 채점과 **동시에** answers·team_progress 에 기록한다 → 연습은 기록할 팀이 없다.
--   기존 두 함수는 **손대지 않는다**. 행사 경로의 보안 조건(토큰·시작 상태·중복 제출 차단)이
--   연습 때문에 느슨해지면 안 된다.
--
-- 원칙(0001·0012 와 동일):
--   · public.cases · public.case_answers 는 여전히 어떤 역할도 직접 SELECT 하지 못한다.
--   · 정답·해설은 브라우저 번들에 없다 — check_answer 가 **제출 1건에 대해서만** 판정 결과를 준다.
--   · 연습은 아무것도 저장하지 않는다 → 랭킹·팀 진행에 영향이 없다(진행/점수는 참가자 브라우저 로컬).
--
-- 노출 범위(수용한 사실): 공개 연습이므로 사건 본문은 누구나 받을 수 있다. 그것이 이 모드의 목적이다.
--   행사 중 문제 유출이 걱정되면 이 두 함수의 grant 를 회수하면 연습 모드만 즉시 닫힌다:
--     revoke execute on function public.get_cases_public(text) from anon, authenticated;
--     revoke execute on function public.check_answer(text, smallint, smallint[], text) from anon, authenticated;
--
-- 멱등: create or replace. 적용: Supabase 대시보드 SQL Editor 에 붙여넣고 Run.
-- ════════════════════════════════════════════════════════════════════════════

-- ════════════════════════ 1. 본문 조회(연습) ════════════════════════
-- get_cases 와 같은 형태로 돌려준다: [{ case_id, content }] — 정답·해설은 들어 있지 않다.
create or replace function public.get_cases_public(
  p_locale text default 'ko'
) returns jsonb language sql stable security definer set search_path = public, pg_temp as $$
  select coalesce(jsonb_agg(
           jsonb_build_object(
             'case_id', c.case_id,
             'content', case
                          when p_locale = 'en' and c.content_en is not null
                          then c.content_ko || c.content_en   -- en 이 있는 키만 덮어씀(0012 와 같은 규칙)
                          else c.content_ko
                        end
           )
           order by c.stage, c.case_no
         ), '[]'::jsonb)
    from public.cases c;
$$;

-- ════════════════════════ 2. 채점만(연습) ════════════════════════
-- submit_answer 와 판정 규칙은 같지만(단일=인덱스 일치, 복수=집합 일치) **아무것도 기록하지 않는다.**
-- 그래서 게임 상태·중복 제출·팀 토큰을 보지 않는다 — 연습에는 지킬 순서도, 한 번뿐인 제출도 없다.
-- 반환: { is_correct, correct_index, correct_indexes, analysis, stage }
create or replace function public.check_answer(
  p_case_id        text,
  p_choice_index   smallint   default null,
  p_choice_indexes smallint[] default null,
  p_locale         text       default 'ko'
) returns jsonb language plpgsql stable security definer set search_path = public, pg_temp as $$
declare
  v_ans     public.case_answers;
  v_multi   boolean;
  v_correct boolean;
begin
  select * into v_ans from public.case_answers where case_id = p_case_id;
  if not found then raise exception 'unknown_case'; end if;

  v_multi := (v_ans.answer_indexes is not null);

  -- 사건 형태와 제출 형태가 어긋나면 거부한다(복수 사건에 단일 답 제출 등) — 0009 와 같은 계약.
  if v_multi and p_choice_indexes is null then raise exception 'answer_shape'; end if;
  if not v_multi and p_choice_index is null then raise exception 'answer_shape'; end if;

  if v_multi then
    v_correct := public.same_index_set(p_choice_indexes, v_ans.answer_indexes);
  else
    v_correct := (p_choice_index = v_ans.answer_index);
  end if;

  return jsonb_build_object(
    'is_correct',      v_correct,
    'correct_index',   v_ans.answer_index,    -- 복수 사건에서는 null
    'correct_indexes', v_ans.answer_indexes,  -- 단일 사건에서는 null
    'analysis',        case when p_locale = 'en' and v_ans.analysis_en is not null
                            then v_ans.analysis_en else v_ans.analysis_ko end,
    'stage',           v_ans.stage            -- 서버가 stage 를 확정한다(클라이언트 값을 신뢰하지 않는다)
  );
end;
$$;

-- ════════════════════════ 3. 권한 ════════════════════════
-- 기본 PUBLIC 회수 후 재부여 (0012 와 같은 방식). 테이블 직접 SELECT 권한은 그대로 없다.
revoke execute on function public.get_cases_public(text) from public;
grant  execute on function public.get_cases_public(text) to anon, authenticated;

revoke execute on function public.check_answer(text, smallint, smallint[], text) from public;
grant  execute on function public.check_answer(text, smallint, smallint[], text) to anon, authenticated;

-- ════════════════════════ 검증 ════════════════════════
-- anon 키로:
--   select public.get_cases_public('ko');            → 사건 15건의 본문(정답 없음)
--   select public.check_answer('case-001', 0::smallint);  → { is_correct: ..., analysis: ... }
--   select * from public.cases;                      → 권한 오류 (변함없음)
--   select * from public.case_answers;               → 권한 오류 (변함없음)
