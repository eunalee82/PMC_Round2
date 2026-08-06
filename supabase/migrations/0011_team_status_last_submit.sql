-- ════════════════════════════════════════════════════════════════════════════
-- 0011_team_status_last_submit.sql — 팀 현황에 '마지막 제출 시각' 추가 (운영 요청 2026-08-06)
--
-- 배경: 관리자 콘솔 [팀 현황]은 입장시각·제출 수·점수만 보여줘서, **어느 팀이 언제 마지막 답을
--       냈는지**를 행사 중에 확인할 수 없었다. 랭킹 발표 화면(admin_scoreboard)에는 있었지만
--       전체 화면 발표용이라 진행 중 모니터링에는 쓰기 어렵다.
--
-- team_progress.last_submit_at 은 submit_answer 가 매 제출마다 now() 로 갱신한다(서버 시각).
-- 동점 시 순위 tie-break 에도 쓰이는 값이라 이미 신뢰할 수 있다.
--
-- create or replace view 는 기존 컬럼 순서를 유지하고 **뒤에 덧붙이는** 것만 허용된다 → 맨 끝에 추가.
--
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등.
-- ════════════════════════════════════════════════════════════════════════════

create or replace view public.admin_team_status with (security_invoker = true) as
  select t.id as team_id, t.name, t.sort_order,
         (t.entered_at is not null) as is_claimed,
         t.member_emails, t.entered_at, t.transferred_at, t.flags,
         coalesce(p.submitted_count, 0) as submitted_count,
         coalesce(p.score, 0)           as score,
         p.last_submit_at                                   -- ← 추가
    from public.teams t
    left join public.team_progress p on p.team_id = t.id;

grant select on public.admin_team_status to authenticated;

-- 확인
-- select name, submitted_count, score, last_submit_at from public.admin_team_status order by sort_order;
