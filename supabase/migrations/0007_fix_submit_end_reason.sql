-- ════════════════════════════════════════════════════════════════════════════
-- 0007_fix_submit_end_reason.sql — submit_answer 의 종료 사유 구분 (버그)
--
-- 증상(2026-08-04 실측): 관리자가 게임을 종료(status='ended')한 뒤 참가자가 제출하면
--   "아직 게임이 시작되지 않았습니다"(game_not_started) 가 표시됐다.
-- 원인: `status <> 'started'` 검사가 먼저 걸려 'ended' 도 미시작으로 취급했다.
-- 영향: 행사 종료 시점에 참가자에게 잘못된 안내가 나간다(제출 차단 자체는 정상이었다).
--
-- 수정: 종료 상태를 먼저 판정한다. 시간 초과도 같은 사유('game_ended')로 통일.
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등(create or replace).
-- ════════════════════════════════════════════════════════════════════════════

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
  -- 종료를 먼저 판정한다(ended 를 '미시작'으로 오인하지 않도록)
  if v_game.status = 'ended' then raise exception 'game_ended'; end if;
  if v_game.status <> 'started' then raise exception 'game_not_started'; end if;
  if v_game.ends_at is not null and now() >= v_game.ends_at then raise exception 'game_ended'; end if;

  select * into v_ans from public.case_answers where case_id = p_case_id;
  if not found then raise exception 'unknown_case'; end if;

  v_correct := (p_choice_index = v_ans.answer_index);
  if v_correct then v_points := POINTS_PER_CASE; end if;
  v_stage := v_ans.stage;   -- 서버가 stage 를 확정한다

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
