-- ════════════════════════════════════════════════════════════════════════════
-- 0006_transfer_returns_emails.sql — verify_and_transfer 반환값 보강
--
-- 배경: 기기 인계 후 새 기기는 팀원 이메일을 알 수 없다. 그런데 클라이언트 접근 가드
--       (constants/flow.js isRegistered)는 '수사관 3명 등록'을 요구하므로, 이메일이 없으면
--       인계받은 기기가 서약·대기 화면으로 진입하지 못한다.
--
-- 결정: **본인 팀의 이메일 중 하나를 증명한 기기에게만** 팀원 이메일을 돌려준다.
--       (증명 전에는 여전히 노출하지 않는다 — 재입장 모달은 입장 시각만 보여준다)
--       anon 의 teams.member_emails 직접 조회는 계속 차단된 상태다.
--
-- 적용: SQL Editor 에 붙여넣고 Run. 멱등(create or replace).
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.verify_and_transfer(
  p_team_id   text,
  p_email     text,
  p_device_id text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_team public.teams; v_token uuid;
begin
  select * into v_team from public.teams where id = p_team_id for update;
  if not found then raise exception 'team_not_found'; end if;
  if not (public.norm_email(p_email) = any (v_team.member_emails)) then
    raise exception 'email_not_registered';
  end if;

  update public.teams
     set claim_token = null, device_id = null, entered_at = null,
         member_emails = '{}', flags = '{}', updated_at = now()
   where device_id = p_device_id and id <> p_team_id;   -- 기기당 1팀

  v_token := gen_random_uuid();                          -- 재발급 → 이전 기기 토큰 무효
  update public.teams
     set claim_token = v_token, device_id = p_device_id,
         transferred_at = now(), updated_at = now()
   where id = p_team_id;

  -- 증명에 성공한 기기에만 팀 구성 정보를 돌려준다(로컬 세션 복구·명단 표시용)
  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'emails', to_jsonb(v_team.member_emails),
    'entered_at', v_team.entered_at,
    'flags', to_jsonb(v_team.flags)
  );
end;
$$;

revoke execute on function public.verify_and_transfer(text, text, text) from public;
grant  execute on function public.verify_and_transfer(text, text, text) to anon, authenticated;
