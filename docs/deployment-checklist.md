# 배포 체크리스트

> 행사 전에 **한 번** 수행하는 배포 절차. 당일 진행 절차는 `docs/operation-checklist.md`.
> 대상: `https://pmc-round2.vercel.app` (Vercel) · Supabase 프로젝트 `teyngjaladwqolxwykqk`
> 최종 검증: 2026-08-04

---

## 0. 배포 전 필수 확인 (Go / No-Go)

1·2·3·4·5·6 이 ✅ 여야 배포한다(3b 는 권장).

| # | 항목 | 확인 방법 | 현재 |
|---|---|---|---|
| 1 | 마이그레이션 `0001`~`0007` 전부 적용 | §2 쿼리 | ✅ 적용(2026-08-04) · 쿼리 확인 권장 |
| 2 | 관리자 계정 1개 + `admins` 등록 + 로그인 성공 | §3 | ✅ (`euna.lee@lge.com`) |
| 3 | Email provider **ON** (로그인 가능) | §3.1 | ✅ 2026-08-04 |
| 3b | 공개 가입 **OFF** | §3.1 | ⚠️ 아직 열림 — **차단 아님**(§3.3) |
| 4 | 번들에 `service_role`·비밀키 없음 | §5 | ✅ |
| 5 | `npm run build` · `npm run validate` 통과 | §1 | ✅ |
| 6 | Vercel 환경변수 2개 등록 + **등록 후 재배포** | §4 | ✅ (2026-08-04 등록) |

> 정답 비노출은 §6 에서 해소됐다(번들에 정답 0건).

---

## 1. 코드 검증

```bash
npm run validate    # 사건 15개 · 정답 인덱스 · ko/en 정합 · 단서 파일 · 문구 키
npm run build       # 오류 0 이어야 한다
```

기대 출력:
- `validate` → `✔ 오류 없음` (경고 1건 = Stage 2 임시 데이터 안내, 의도된 것)
- `build` → JS 약 366KB / gzip 108KB · CSS 78KB / gzip 14KB (정답 분리로 30KB 감소)

---

## 2. DB 마이그레이션

Supabase 대시보드 → **SQL Editor** 에서 **순서대로** 실행(파일 전체 선택 → Run). 모두 멱등하므로 재실행 안전.

| 파일 | 내용 |
|---|---|
| `0001_init.sql` | 테이블 6개 · RLS · RPC 10개 · 뷰 3개 · Realtime publication |
| `0002_seed_teams.sql` | 팀 33개 (`team01`~`team32` + `team-test`) |
| `0003_seed_answers.sql` | 정답·해설 15개 — **생성 후 적용, 파일은 삭제**(커밋 금지) |
| `0004_fix_function_grants.sql` | anon 의 내부·관리자 함수 EXECUTE 회수 + `admin_scoreboard` 컬럼 |
| `0005_fix_admin_reset.sql` | 리허설 초기화의 WHERE 누락 수정 |
| `0006_transfer_returns_emails.sql` | 기기 인계 시 팀원 명단 반환 |
| `0007_fix_submit_end_reason.sql` | **종료 후 제출 사유를 `game_ended`로 정정** |

`0003` 생성: `node scripts/export-seed.mjs` → `supabase/migrations/0003_seed_answers.sql` 생성 → 적용 → **파일 삭제**.

**적용 확인 쿼리**
```sql
-- 테이블·시드
select (select count(*) from public.teams)        as teams,        -- 33
       (select count(*) from public.case_answers) as case_answers, -- 15
       (select count(*) from public.admins)       as admins;       -- 1

-- 0004 적용 여부 (anon 이 관리자 함수를 실행할 수 없어야 한다)
select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon_can_exec
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname='public'
  and p.proname in ('admin_start_game','recalc_team_progress','norm_email','is_admin','game_state','submit_answer')
order by 1;
-- 기대: game_state·submit_answer 만 true, 나머지 false

-- 0007 적용 여부 (함수 본문에 종료 우선 판정이 있는지)
select position('status = ''ended''' in pg_get_functiondef(p.oid)) > 0 as has_end_check
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='submit_answer';
-- 기대: true

-- Realtime publication
select tablename from pg_publication_tables
where pubname='supabase_realtime' and schemaname='public';
-- 기대: games 포함
```

---

## 3. Supabase 설정

### 3.1 Auth — 이 두 개는 **서로 다른 스위치**다 (사고 지점)

| 설정 | 있어야 하는 값 | 틀리면 |
|---|---|---|
| `Enable Email provider` | **ON** | 관리자가 **로그인 자체를 못 한다** → 게임 시작·종료 불가 |
| `Allow new users to sign up` | **OFF** | 외부인이 임의로 계정을 만들 수 있다 |

Supabase 대시보드 → **Authentication → Sign In / Providers → Email** 카드 안에 둘이 같이 있다.
가입만 막으려다 **카드 전체를 꺼서 로그인이 죽는 사고가 두 번 있었다** — 반드시 아래 명령으로 확인한다.

**확인 (값을 화면에 찍지 않는다)**
```bash
KEY=$(grep '^VITE_SUPABASE_ANON_KEY=' .env.local | cut -d= -f2-)
curl -s -H "apikey: $KEY" https://teyngjaladwqolxwykqk.supabase.co/auth/v1/settings   | python -c "import json,sys; d=json.load(sys.stdin); print('email provider:', d['external']['email'], '(기대 True)'); print('disable_signup:', d.get('disable_signup'), '(기대 True)')"
```
기대 출력:
```
email provider: True (기대 True)
disable_signup: True (기대 True)
```

### 3.2 관리자 계정

- [ ] **Authentication → Users**: 관리자 계정 1개, `Auto Confirm User` 상태
- [ ] `admins` 등록 (등록하지 않으면 로그인은 되지만 모든 RPC 가 `forbidden`):
      ```sql
      insert into public.admins (user_id, note) select id, 'operator ' || email from auth.users
      on conflict (user_id) do nothing;
      ```
- [ ] 관리자 콘솔(`?admin`) 로그인 성공 + 상태 카드 표시까지 확인
- [ ] 게임 상태 초기화: `select public.admin_reset_game(true);` 는 **관리자 콘솔에서** 실행
      (SQL Editor 는 `auth.uid()` 가 null 이라 `forbidden`)

### 3.3 공개 가입이 열려 있으면 어디까지 위험한가

가입만으로는 **데이터에 닿지 못한다** — 배포본 실측(2026-08-04)으로 확인했다.

- `authenticated` 를 대상으로 한 모든 테이블 정책이 `public.is_admin()` 을 통과해야 한다
  (`teams_read_admin` · `answers_admin_read` · `tp_admin_read`)
- `is_admin()` 은 `admins` 테이블에 행이 있어야 true → 임의 가입자는 항상 false
- 관리자 RPC 3종(`admin_start_game`·`admin_end_game`·`admin_reset_game`)은 본문 첫 줄에서
  `is_admin()` 을 확인하고 `forbidden`(42501) 을 던진다
- 관리자 뷰는 `security_invoker=true` → 위 RLS 를 그대로 따르므로 0행
- `admins_self_read` 는 자기 행만 읽게 하는데, 임의 가입자에겐 그 행이 없다

**따라서 3b 는 배포 차단 사유가 아니다.** 다만 남겨두면 (1) `auth.users` 오염,
(2) 확인 메일 발송 남용, (3) 나중에 누군가 `to authenticated` 정책을 `is_admin()` 없이 추가하면
그 순간 구멍이 된다. 행사 전에 끄는 것을 권장한다.

위치: **Authentication → Sign In / Providers** 페이지의 **`User Signups`** 섹션
(Email 카드와 **다른 곳**이다) → `Allow new users to sign up` **OFF** → Save

---

## 4. 환경변수

| 변수 | Vercel(Production) | `.env.local` | 값 |
|---|---|---|---|
| `VITE_SUPABASE_URL` | ✅ Production·Preview | ✅ | `https://teyngjaladwqolxwykqk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Production·Preview | ✅ | `sb_publishable_…` (공개 안전) |
| `VITE_BACKEND` | 미설정(기본 supabase) | 미설정 | 비상 시에만 `mock` |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **절대 등록 금지** | ❌ | 시드는 SQL Editor 로 처리 |

- [ ] Vercel 환경변수 등록 후 **재배포**해야 반영된다(빌드 타임에 주입).
      **미등록 상태로 배포하면 mock 모드로 빌드되고, 프로덕션 mock 은 정답이 없어 채점이 아예 안 된다**
      (실제로 첫 배포 직전에 미등록 상태였다). 등록 여부는 반드시 명령으로 확인한다:
      ```bash
      npx vercel env ls production     # VITE_SUPABASE_URL · VITE_SUPABASE_ANON_KEY 2건
      ```
      배포본이 서버 모드인지는 번들에 프로젝트 URL 이 박혔는지로 확인한다:
      ```bash
      JS=$(curl -s https://pmc-round2.vercel.app/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js')
      curl -s "https://pmc-round2.vercel.app$JS" | grep -c 'teyngjaladwqolxwykqk.supabase.co'   # 1
      ```
- [ ] `.env*` 는 `.gitignore` 대상 — 커밋된 env 파일 0건 확인: `git ls-files | grep -c '^\.env'` → `0`

---

## 5. 비밀키·번들 감사

```bash
npm run build
JS=$(ls dist/assets/*.js)
for p in service_role SUPABASE_SERVICE "sb_secret_[A-Za-z0-9]" fastForward devmenu__ createTeamManager; do
  echo "$p: $(grep -coE "$p" "$JS")"
done
```
- [ ] 위 전부 **0건** (`sb_secret_` 는 supabase-js 내부 형식 검사 리터럴만 존재하며 실제 값 패턴은 0건)
- [ ] `sb_publishable_` · 프로젝트 URL 은 번들에 있어도 정상(공개 키)
- [ ] 커밋 이력에 키 없음: `git grep -nE "sb_publishable_[A-Za-z0-9_-]{10,}"` → 결과 없음

---

## 6. ✅ 정답 비노출 (해소됨, 2026-08-04)

정답·해설은 프로덕션 번들에 **포함되지 않는다**.

- `SOLUTIONS` 를 `src/js/dev/solutions.js` (DEV/검증 전용 모듈)로 분리
- `lib/grade.js` 의 mock 채점은 `if (import.meta.env.DEV)` 안에서 동적 import →
  프로덕션 빌드에서 분기와 모듈이 함께 제거된다
- 운영 채점은 서버 `case_answers` + `submit_answer` RPC 가 담당(정답은 anon 이 조회 불가)

**확인 명령**
```bash
npm run build
JS=$(ls dist/assets/*.js)
grep -c "answerIndex" "$JS"        # 0
grep -c "이 문제의 함정은" "$JS"    # 0
ls dist/assets/*.js | wc -l         # 1 (정답이 별도 청크로도 빠지지 않는다)
```

**비상 mock 실행 시 주의**: 프로덕션 빌드 + `VITE_BACKEND=mock` 은 정답이 없어 채점되지 않는다
(`no_backend` 반환). 비상 폴백은 **개발 모드**(`VITE_BACKEND=mock npm run dev`)로 띄워야 한다.

---

## 7. 배포

```bash
npx vercel --prod --yes      # 계정 pingjueuna-3402 · 프로젝트 pmc-round2
```
- GitHub 자동배포는 미연결 상태 → **CLI 배포 필요**
- 배포 후 `https://pmc-round2.vercel.app` 에서 §8 수행

---

## 8. 배포 후 스모크 테스트 (10분)

**기기 2대**(또는 서로 다른 브라우저 프로필)로 진행한다.

- [ ] A기기: 입장 → 팀 선택(테스트 팀) → 이메일 3개 → 서약 → 대기실
- [ ] 관리자(`?admin`) 로그인 → 상태 `SCHEDULED` 확인 → **[게임 시작]**
- [ ] A기기 대기실이 **5초 내** Stage 1로 자동 전환
- [ ] 사건 1건 제출 → `CASE RESOLVED` + 해설 표시 + 사이드바 점수 20점
- [ ] A기기 **새로고침** → 같은 지점·점수로 복구
- [ ] B기기에서 같은 팀 선택 → 재입장 모달 → 등록 이메일로 인계 → A기기는 팀 선택으로 되돌아감
- [ ] 관리자 [팀 현황] → 입장 팀·이메일 확인 / [최종 랭킹 발표] → 점수 확인
- [ ] 관리자 [게임 종료] → 참가자가 제출 시도 시 차단 안내
- [ ] 영어: `?lang=en` 또는 입장 화면에서 English 선택 → 사건·해설이 영문
- [ ] 마무리: 관리자 [대기 상태로 되돌리기] → **진행 데이터 초기화 선택** → 점수 0 확인

---

## 9. 롤백 계획

| 상황 | 대응 |
|---|---|
| 배포본에 문제 발생 | `npx vercel rollback` 또는 이전 배포를 Promote |
| Supabase 장애 | `VITE_BACKEND=mock npm run dev` (개발 모드)로 로컬 진행 · 점수 수동 집계.
  프로덕션 빌드는 정답을 갖고 있지 않아 mock 채점이 되지 않는다(§6) |
| 마이그레이션 오류 | 각 파일이 멱등하므로 수정 후 재실행. 데이터 초기화는 `admin_reset_game(true)` |
| 진행 데이터 불일치 | `select public.recalc_team_progress('team01');` — `answers` 로부터 재계산 |

---

## 10. 배포 기록

| 날짜 | 커밋 | 마이그레이션 | 비고 |
|---|---|---|---|
| 2026-08-04 | `4e9b57a` | 0001~0006 적용 · **0007 대기** | 서버 연동 후 첫 배포. `dpl_9bXxqeuMugvrtqoG9fQfUMUZU6Cz`<br>배포 전 환경변수 2개를 새로 등록(그 전엔 0건이었다).<br>배포본 검증: 서버 모드 주입 ✅ · 정답·비밀키 0건 ✅ · `game_state` RPC ✅ · Realtime 연결 ✅<br>프로덕션 anon 침투 점검 9/9 차단 ✅ · Auth provider ON ✅ |
