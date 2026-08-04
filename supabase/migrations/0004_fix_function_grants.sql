-- ════════════════════════════════════════════════════════════════════════════
-- 0004_fix_function_grants.sql — 함수 실행 권한 보강 (보안)
--
-- 배경(2026-08-04 실측): 0001 의 `revoke execute on function ... from public` 만으로는
-- anon 의 EXECUTE 가 사라지지 않았다. Supabase 가 public 스키마에 대해
-- `alter default privileges ... grant all on functions to anon, authenticated` 를 걸어두기 때문에
-- anon/authenticated 에 **직접** 부여된 권한이 남는다(PUBLIC 회수와 별개).
--
-- 확인된 노출(모두 내부 검사로 막혀 있었지만 호출 자체는 가능했다):
--   anon → admin_start_game / admin_end_game  → 'forbidden' (is_admin() 이 차단)
--   anon → assert_team_token                  → 'not_owner' (토큰 오라클로 쓸 여지)
--   anon → recalc_team_progress               → **실행 성공** (SECURITY DEFINER 쓰기 함수)
--   anon → is_admin / norm_email / email_suspect → 실행 성공 (정보성)
--
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등(revoke 는 여러 번 실행해도 안전).
-- ⚠️ 앞으로 public 스키마에 함수를 추가할 때마다 같은 패턴으로 revoke → 필요한 롤에만 grant 한다.
-- ════════════════════════════════════════════════════════════════════════════

-- 내부 유틸 — 참가자·관리자 모두 직접 호출할 이유가 없다.
-- (다른 SECURITY DEFINER 함수 내부에서는 소유자 권한으로 실행되므로 회수해도 동작에 영향 없다)
revoke execute on function public.norm_email(text)                 from anon, authenticated;
revoke execute on function public.email_suspect(text)              from anon, authenticated;
revoke execute on function public.assert_team_token(text, uuid)    from anon, authenticated;
revoke execute on function public.recalc_team_progress(text)       from anon, authenticated;

-- is_admin() 은 RLS 정책(to authenticated)이 평가할 때 호출하므로 authenticated 에는 남긴다.
revoke execute on function public.is_admin()                       from anon;

-- 관리자 RPC — anon 은 호출 자체가 불가능해야 한다(내부 is_admin() 검사 이전에 차단).
revoke execute on function public.admin_start_game(integer)        from anon;
revoke execute on function public.admin_end_game()                 from anon;
revoke execute on function public.admin_reset_game(boolean)        from anon;

-- 참가자 RPC 는 anon 에 유지된다(설계상 필요):
--   game_state · claim_team · verify_and_transfer · release_team · submit_answer
--   my_progress · record_milestone

-- ════════════════════════════════════════════════════════════════════════════
-- 추가: admin_scoreboard 에 Stage별 '제출 수' 컬럼 (관리자 랭킹의 '획득 장비' 판정용)
-- 장비 해제는 정답이 아니라 '제출 완료' 기준이므로(사이드바 EVIDENCE 와 동일) 필요하다.
-- create or replace view 는 뒤에 컬럼을 추가하는 것만 허용된다 → 맨 끝에 붙인다.
-- ════════════════════════════════════════════════════════════════════════════
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
         p.appointed_at, p.raid_ended_at, p.ended_at,
         coalesce(p.stage1_submitted,0) as stage1_submitted,
         coalesce(p.stage2_submitted,0) as stage2_submitted,
         coalesce(p.stage3_submitted,0) as stage3_submitted
    from public.teams t
    left join public.team_progress p on p.team_id = t.id;

grant select on public.admin_scoreboard to authenticated;
