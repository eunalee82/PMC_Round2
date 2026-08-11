-- ════════════════════════════════════════════════════════════════════════════
-- 0014_admin_extend_game.sql — 진행 중 제한 시간 연장 RPC
--
-- 왜: 네트워크 장애로 시간을 잃은 상황에서 지금까지는 Supabase SQL Editor 를 열어
--     `update games set ends_at = ends_at + interval '10 min'` 을 직접 실행해야 했다
--     (operation-checklist.md §8.4 (C)). 행사 중에 SQL 편집기를 여는 것은 부담이 크고
--     오타 한 번이 전체 진행을 망칠 수 있어, 관리자 콘솔 버튼으로 올린다.
--
-- 설계 결정
--   · **전 팀 공통으로만 연장된다.** games 는 단일 로우이고 ends_at 이 하나뿐이다.
--     팀별 연장은 스키마·채점 RPC·클라이언트 타이머까지 번지는 변경이라 하지 않는다.
--     개별 팀 장애는 결과 정리 시 완료 시각 보정으로 처리한다(§8.10).
--   · **status='started' 일 때만** 허용한다. 종료된 게임을 연장하면 제출이 조용히
--     다시 열려 종료 선언과 어긋난다. 종료를 되돌리는 것은 별개 절차다(§8.10 (5)).
--   · 기준은 greatest(ends_at, now()) — 이미 타임오버가 지난 뒤에 눌러도 **지금부터**
--     그 시간만큼 준다. 정상 상황에서는 남은 시간에 그대로 더해져 연타도 누적된다.
--   · duration_minutes 는 건드리지 않는다. 그 값은 '설정된 기본 제한시간'이라
--     연장으로 올리면 다음 [게임 시작] 이 85분으로 시작해 버린다.
--
-- 적용: Supabase 대시보드 → SQL Editor 에 붙여넣기 → Run. 멱등(create or replace).
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.admin_extend_game(p_minutes integer default 5)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_game public.games;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;

  -- 오조작 방지 — 콘솔은 5분만 보내지만 RPC 를 직접 부를 수도 있다.
  if p_minutes is null or p_minutes <= 0 or p_minutes > 60 then
    raise exception 'bad_minutes' using errcode = '22023';
  end if;

  select * into v_game from public.games where id = 1 for update;
  if v_game.status <> 'started' or v_game.ends_at is null then
    raise exception 'game_not_started';
  end if;

  update public.games
     set ends_at = greatest(v_game.ends_at, now()) + make_interval(mins => p_minutes),
         updated_at = now()
   where id = 1;

  return public.game_state();
end;
$$;

revoke execute on function public.admin_extend_game(integer) from public, anon;
grant  execute on function public.admin_extend_game(integer) to authenticated;

-- 확인:
--   select status, duration_minutes, started_at, ends_at from public.games where id = 1;
