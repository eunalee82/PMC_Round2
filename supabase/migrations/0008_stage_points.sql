-- ════════════════════════════════════════════════════════════════════════════
-- 0008_stage_points.sql — 배점 변경: 사건당 20점(300점 만점) → 스테이지별 배점(100점 만점)
--
-- 결정(2026-08-05): 총점을 100점으로 산출한다.
--   Stage 1 · Mindset            7점 × 3사건 = 21
--   Stage 2 · Performance Domain 7점 × 7사건 = 49
--   Stage 3 · AI Use Case        6점 × 5사건 = 30
--                                  15사건    = 100
-- 스테이지마다 사건 수가 달라 균등 배점으로는 100점이 맞지 않으므로 stage → 배점 표를 둔다.
-- 클라이언트 표시값은 src/js/constants/scoring.js 가 같은 값을 갖는다(판정은 여기 서버가 권위 · CLAUDE.md §2 §11).
--
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등(create or replace + 재계산).
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1) 배점 표 (한 곳에서만 정의) ───────────────────────────────────────────
create or replace function public.stage_points(p_stage smallint)
returns smallint language sql immutable set search_path = public, pg_temp as $$
  select case p_stage when 1 then 7 when 2 then 7 when 3 then 6 else 0 end::smallint;
$$;

grant execute on function public.stage_points(smallint) to anon, authenticated;

-- ── 2) 제출·채점 — 정답이면 스테이지 배점을 가산 ────────────────────────────
create or replace function public.submit_answer(
  p_team_id      text,
  p_token        uuid,
  p_case_id      text,
  p_stage        smallint,
  p_choice_index smallint,
  p_locale       text default 'ko'
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_game    public.games;
  v_ans     public.case_answers;
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

  v_correct := (p_choice_index = v_ans.answer_index);
  v_stage   := v_ans.stage;   -- 서버가 stage 를 확정한다 (클라이언트 p_stage 를 신뢰하지 않는다)
  if v_correct then v_points := public.stage_points(v_stage); end if;

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

revoke execute on function public.submit_answer(text, uuid, text, smallint, smallint, text) from public;
grant  execute on function public.submit_answer(text, uuid, text, smallint, smallint, text) to anon, authenticated;

-- ── 3) 이미 저장된 제출을 새 배점으로 환산 ──────────────────────────────────
-- 구 배점(20점)으로 기록된 answers.points 를 다시 계산하고, team_progress.score 를 재집계한다.
-- 오답은 0점, 정답은 스테이지 배점. 여러 번 실행해도 결과가 같다.
update public.answers
   set points = case when is_correct then public.stage_points(stage) else 0::smallint end
 where points <> case when is_correct then public.stage_points(stage) else 0::smallint end;

select public.recalc_team_progress(team_id) from (
  select distinct team_id from public.answers
) t;
