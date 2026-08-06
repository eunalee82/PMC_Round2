-- ════════════════════════════════════════════════════════════════════════════
-- 0010_duration_80min.sql — 게임 제한시간 60분 → 80분 (운영 결정 2026-08-06)
--
-- 0001_init.sql 의 기본값도 80 으로 고쳤지만, **이미 만들어진 games 로우는 그대로 60** 이므로
-- 이 마이그레이션이 실제 값을 바꾼다. 클라이언트 표시 기본값(src/js/lib/game-mock.js ·
-- game-server.js)도 80 으로 맞췄다 — 세 곳은 항상 같이 고친다.
--
-- 주의: 이미 게임이 started 인 상태에서 실행하면 ends_at 도 함께 다시 계산한다
--       (started_at + 80분). 행사 중이 아니라면 신경 쓸 필요 없다.
--
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.games alter column duration_minutes set default 80;

update public.games
   set duration_minutes = 80,
       -- 진행 중이면 종료 시각을 새 제한시간 기준으로 다시 잡는다. 대기(scheduled)면 null 유지.
       ends_at = case when status = 'started' and started_at is not null
                      then started_at + interval '80 minutes'
                      else ends_at end,
       updated_at = now()
 where id = 1;

-- 확인
-- select status, duration_minutes, started_at, ends_at from public.games where id = 1;
