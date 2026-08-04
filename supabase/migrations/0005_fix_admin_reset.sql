-- ════════════════════════════════════════════════════════════════════════════
-- 0005_fix_admin_reset.sql — admin_reset_game() 수정 (버그)
--
-- 증상(2026-08-04 실측): 관리자 세션에서 admin_reset_game(true) 호출 시
--   {"code":"21000","message":"DELETE requires a WHERE clause"} → 트랜잭션 전체 롤백.
--
-- 원인: Supabase 는 API 롤(authenticated/anon) 세션에 safeupdate 보호를 걸어
--       **WHERE 없는 DELETE/UPDATE 를 거부**한다. SECURITY DEFINER 로 소유자 권한으로
--       실행돼도 이 설정은 세션 단위라 그대로 적용된다.
--       (0001 의 다른 문장들은 모두 WHERE 가 있어 영향 없다 — 이 함수만 해당)
--
-- 수정: 전체 삭제/갱신에 `where true` 를 명시한다.
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등(create or replace).
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.admin_reset_game(p_wipe_progress boolean default false)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;

  update public.games
     set status = 'scheduled', started_at = null, ends_at = null, updated_at = now()
   where id = 1;

  if p_wipe_progress then
    -- Supabase safeupdate: 전체 대상 DELETE/UPDATE 에도 WHERE 가 필요하다
    delete from public.answers        where true;
    delete from public.team_progress  where true;
    update public.teams
       set claim_token = null, device_id = null, entered_at = null, transferred_at = null,
           member_emails = '{}', flags = '{}', updated_at = now()
     where true;
    -- 점수판이 0점으로 보이도록 진행 로우를 다시 만들어 둔다
    insert into public.team_progress (team_id)
    select id from public.teams on conflict (team_id) do nothing;
  end if;

  return public.game_state();
end;
$$;

revoke execute on function public.admin_reset_game(boolean) from public, anon;
grant  execute on function public.admin_reset_game(boolean) to authenticated;
