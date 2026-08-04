-- 0002_seed_teams.sql — 팀 로스터 시드 (생성: scripts/export-seed.mjs)
-- 원본: src/js/mocks/teams.js · id 는 기존 세션과 호환되도록 그대로 유지한다.
-- 멱등: 이름·색·순서만 갱신하고 점유 정보(claim_token 등)는 건드리지 않는다.

insert into public.teams (id, name, color, sort_order, is_test) values
  ('team-test', '테스트', '#9aa4b2', 0, true),
  ('team01', 'Agentic Titans', '#7c87ff', 1, false),
  ('team02', 'Automation Avengers', '#2cc7e6', 2, false),
  ('team03', 'B2B솔루션PMO즈의 마법사', '#37d089', 3, false),
  ('team04', 'ESync PM', '#e7b24c', 4, false),
  ('team05', 'ID롱챠', '#f0555f', 5, false),
  ('team06', 'IN:SIGHT', '#b98bff', 6, false),
  ('team07', 'KICA', '#4ea3ff', 7, false),
  ('team08', 'LG PM Reinventors', '#4ade80', 8, false),
  ('team09', 'LGEDV PM Explorer', '#ff8a52', 9, false),
  ('team10', 'LG트리오', '#7c87ff', 10, false),
  ('team11', 'MS WM Sphinx', '#2cc7e6', 11, false),
  ('team12', 'PM Sentinel', '#37d089', 12, false),
  ('team13', 'PM Transformers', '#e7b24c', 13, false),
  ('team14', 'PM장군', '#f0555f', 14, false),
  ('team15', 'Project Defence Force', '#b98bff', 15, false),
  ('team16', 'Project Secret Sauce', '#4ea3ff', 16, false),
  ('team17', 'QUALIPRO', '#4ade80', 17, false),
  ('team18', 'Simply. U+', '#ff8a52', 18, false),
  ('team19', 'The Guardians', '#7c87ff', 19, false),
  ('team20', 'Trivisions', '#2cc7e6', 20, false),
  ('team21', 'Value Guardians', '#37d089', 21, false),
  ('team22', 'webOS Rangers', '#e7b24c', 22, false),
  ('team23', 'webOS Titans', '#f0555f', 23, false),
  ('team24', '가치수사대', '#b98bff', 24, false),
  ('team25', '본선만 가자', '#4ea3ff', 25, false),
  ('team26', '붉은대게진사갈비 (Red Crab Jinsa BBQ)', '#4ade80', 26, false),
  ('team27', '산리오 퓨로랜드', '#ff8a52', 27, false),
  ('team28', '서바이브', '#7c87ff', 28, false),
  ('team29', '서태지', '#2cc7e6', 29, false),
  ('team30', '스콥좀줄여조', '#37d089', 30, false),
  ('team31', '시너지엠파이어(Synergy Empire)', '#e7b24c', 31, false),
  ('team32', '프로젝트 파인다이닝', '#f0555f', 32, false)
on conflict (id) do update
  set name = excluded.name,
      color = excluded.color,
      sort_order = excluded.sort_order,
      is_test = excluded.is_test,
      updated_at = now();

-- 진행 로우 미리 생성 (점수판이 0점으로 보이도록)
insert into public.team_progress (team_id)
select id from public.teams on conflict (team_id) do nothing;
