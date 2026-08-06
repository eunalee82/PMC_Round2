-- ════════════════════════════════════════════════════════════════════════════
-- 0009_multi_answer.sql — 복수 정답 사건 지원
--
-- 배경(2026-08-06): Stage 2 사건 #005「사라진 두 달」은 증거물 5개 중 **3개**를 고른다.
--   기존 스키마는 정답·제출이 모두 단일 인덱스(smallint)여서 표현할 수 없었다.
--
-- 설계:
--   · case_answers.answer_indexes  smallint[]  ← 복수 정답 사건만 채운다(단일 사건은 null)
--   · answers.choice_indexes       smallint[]  ← 복수 정답 제출만 채운다
--   · 채점은 **집합 일치**(순서 무관·중복 제거). 부분 점수는 없다 — 3개를 정확히 맞히면 스테이지 배점,
--     하나라도 틀리면 0점. 클라이언트(src/js/lib/grade.js)의 mock 채점도 같은 규칙이다.
--   · 배점은 0008 의 stage_points(stage) 를 그대로 쓴다 → 총점 100점 설계가 바뀌지 않는다.
--
-- 호환: submit_answer 는 p_choice_indexes 를 **기본값 null 로** 받는다. 단일 선택 사건의 클라이언트
--   호출(이 인자를 아예 보내지 않는다)은 그대로 동작한다.
--
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등(if not exists · drop constraint if exists · create or replace).
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1) 스키마 ───────────────────────────────────────────────────────────────
alter table public.case_answers add column if not exists answer_indexes smallint[];
alter table public.case_answers alter column answer_index drop not null;

-- 단일이면 answer_index, 복수면 answer_indexes — 둘 중 정확히 하나만 채운다(채점 기준이 둘이 되지 않게).
alter table public.case_answers drop constraint if exists case_answers_answer_shape;
alter table public.case_answers add constraint case_answers_answer_shape check (
  (answer_index is not null and answer_indexes is null)
  or
  (answer_index is null and answer_indexes is not null and array_length(answer_indexes, 1) >= 2)
);

alter table public.answers add column if not exists choice_indexes smallint[];
alter table public.answers alter column choice_index drop not null;

-- 제출도 한쪽은 반드시 있어야 한다. (기존 check (choice_index >= 0) 는 null 이면 통과 — 3값 논리)
alter table public.answers drop constraint if exists answers_choice_shape;
alter table public.answers add constraint answers_choice_shape check (
  choice_index is not null or choice_indexes is not null
);

-- ── 2) 집합 비교 헬퍼 — 순서·중복을 무시하고 같은 집합인지 본다 ───────────────
create or replace function public.same_index_set(a smallint[], b smallint[])
returns boolean language sql immutable set search_path = public, pg_temp as $$
  select (
    select coalesce(array_agg(x order by x), '{}'::smallint[])
      from (select distinct unnest(coalesce(a, '{}'::smallint[])) as x) sa
  ) = (
    select coalesce(array_agg(y order by y), '{}'::smallint[])
      from (select distinct unnest(coalesce(b, '{}'::smallint[])) as y) sb
  );
$$;

grant execute on function public.same_index_set(smallint[], smallint[]) to anon, authenticated;

-- ── 3) submit_answer 교체 ───────────────────────────────────────────────────
-- 인자가 추가되면 create or replace 가 아니라 **오버로드**가 되어 PostgREST 가 모호해진다 → 옛 것을 지운다.
drop function if exists public.submit_answer(text, uuid, text, smallint, smallint, text);

create or replace function public.submit_answer(
  p_team_id        text,
  p_token          uuid,
  p_case_id        text,
  p_stage          smallint,
  p_choice_index   smallint     default null,
  p_choice_indexes smallint[]   default null,
  p_locale         text         default 'ko'
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_game    public.games;
  v_ans     public.case_answers;
  v_multi   boolean;
  v_correct boolean;
  v_points  smallint := 0;
  v_stage   smallint;
  v_prog    public.team_progress;
begin
  perform public.assert_team_token(p_team_id, p_token);

  select * into v_game from public.games where id = 1;
  -- 종료를 먼저 판정한다(ended 를 '미시작'으로 오인하지 않도록 · 0007)
  if v_game.status = 'ended' then raise exception 'game_ended'; end if;
  if v_game.status <> 'started' then raise exception 'game_not_started'; end if;
  if v_game.ends_at is not null and now() >= v_game.ends_at then raise exception 'game_ended'; end if;

  select * into v_ans from public.case_answers where case_id = p_case_id;
  if not found then raise exception 'unknown_case'; end if;

  v_multi := (v_ans.answer_indexes is not null);

  -- 사건 형태와 제출 형태가 어긋나면 거부한다(복수 사건에 단일 답 제출 등).
  if v_multi and p_choice_indexes is null then raise exception 'answer_shape'; end if;
  if not v_multi and p_choice_index is null then raise exception 'answer_shape'; end if;

  if v_multi then
    -- 고를 개수가 다르면 오답이다 — 2개만 찍어 맞히는 것을 막는다(집합 비교로 자연히 걸린다).
    v_correct := public.same_index_set(p_choice_indexes, v_ans.answer_indexes);
  else
    v_correct := (p_choice_index = v_ans.answer_index);
  end if;

  v_stage := v_ans.stage;   -- 서버가 stage 를 확정한다 (클라이언트 p_stage 를 신뢰하지 않는다)
  if v_correct then v_points := public.stage_points(v_stage); end if;

  begin
    insert into public.answers (team_id, case_id, stage, choice_index, choice_indexes, is_correct, points)
    values (p_team_id, p_case_id, v_stage, p_choice_index, p_choice_indexes, v_correct, v_points);
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
    'is_correct',      v_correct,
    'correct_index',   v_ans.answer_index,      -- 복수 사건에서는 null
    'correct_indexes', v_ans.answer_indexes,    -- 단일 사건에서는 null
    'analysis',        case when p_locale = 'en' and v_ans.analysis_en is not null
                            then v_ans.analysis_en else v_ans.analysis_ko end,
    'points',          v_points,
    'score',           v_prog.score,
    'stage',           v_stage,
    'stage_solved',    case v_stage when 1 then v_prog.stage1_solved
                                    when 2 then v_prog.stage2_solved
                                    else v_prog.stage3_solved end,
    'submitted_count', v_prog.submitted_count
  );
end;
$$;

revoke execute on function public.submit_answer(text, uuid, text, smallint, smallint, smallint[], text) from public;
grant  execute on function public.submit_answer(text, uuid, text, smallint, smallint, smallint[], text) to anon, authenticated;

-- ── 4) 확인용 (실행 후 눈으로 보는 값) ──────────────────────────────────────
-- select case_id, answer_index, answer_indexes from public.case_answers order by case_id;
