# PM Protection Bureau (PM보호국) — PMC 2026 예선 2R

PMBOK® Guide 8판 기반 PM 역량 검증 **크라임씬 게임**. 참가자는 PM보호국 신입 감독관이 되어
15개의 "사건"을 해결한다. 32팀 동시 진행 · 제한 시간 80분.

- **참가자**: https://pmc-round2.vercel.app
- **감독관(운영진) 콘솔**: https://pmc-round2.vercel.app/?admin
- 스택: Vanilla JS (ES Modules) + Vite · Supabase (Postgres · RLS · Realtime · Auth) · Vercel

---

## 1. 빠른 시작

```bash
npm install
cp .env.example .env.local      # 값 채우기 (§2)
npm run dev                     # http://localhost:5173
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run validate` | **커밋 전 필수** — 콘텐츠 정합성 + 흐름 가드 회귀 검증 |
| `npm run validate:flow` | 흐름 가드만 단독 검증 |
| `node scripts/check-migrations.mjs` | 서버에 마이그레이션이 적용됐는지 확인(읽기 전용) |

개발 중에는 우하단 **DEV 메뉴**(비번 `2026`)로 화면·진행을 건너뛸 수 있다.
프로덕션 빌드에서는 자동으로 제거되므로, 실 서버 제어는 `?admin` 콘솔을 쓴다.

---

## 2. 저장소에 **없는** 것 — 인계 시 별도로 받아야 한다

아래는 보안상 저장소에 두지 않는다. 소스만으로는 동작하지 않으므로 반드시 함께 인계받을 것.

| 항목 | 설명 |
|---|---|
| `.env.local` 값 | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` (anon 키는 공개돼도 안전) |
| **Supabase 프로젝트 접근 권한** | 대시보드 로그인 — SQL Editor 로 마이그레이션·시드를 적용한다 |
| **관리자 계정** | `?admin` 로그인용. Supabase Auth 계정 + `public.admins` 테이블 등록이 모두 필요 |
| **Vercel 접근 권한** | 배포용. 계정 `pingjueuna-3402` · 프로젝트 `pmc-round2` |
| 시드 SQL 2종 | `0003_seed_answers.sql`(정답) · `0013_seed_cases.sql`(사건 본문) — **커밋 금지**. 아래 방법으로 재생성한다 |

**시드 재생성** (원본은 저장소에 있다):
```bash
node scripts/export-seed.mjs     # → supabase/migrations/0003_seed_answers.sql
node scripts/export-cases.mjs    # → supabase/migrations/0013_seed_cases.sql
# SQL Editor 에서 실행 → 파일 삭제 (둘 다 멱등이라 재실행 안전)
```
> 해설·본문을 고칠 때는 **SQL 을 직접 고치지 말고** 원본(`src/js/dev/solutions.js` ·
> `src/js/dev/cases-content.js`)을 고쳐 재생성한다. SQL 은 자동 생성물이다.

⚠️ **이 저장소에는 정답이 들어 있다**(`src/js/dev/`). DEV 전용 모듈이라 프로덕션 번들에서는
제거되지만, **저장소 자체는 참가자에게 공유하면 안 된다.**

---

## 3. 문서 — 이 순서로 읽는다

| 순서 | 문서 | 언제 보는가 |
|---|---|---|
| 1 | **`CLAUDE.md`** | **개발 규칙. 코드를 건드리기 전에 반드시 먼저 읽는다** — 아키텍처 원칙, 코딩 스타일, 용어 규칙, 리뷰 체크리스트 |
| 2 | `docs/handoff.md` | 세션별 작업 기록. **§10~§12 가 최신**이고 앞쪽은 과거 기록이다 |
| 3 | `docs/operation-checklist.md` | **행사 당일 진행 담당자용.** 타임라인 · 장애 대응 · 재시작 절차 |
| 4 | `docs/deployment-checklist.md` | 배포 전 Go/No-Go · 마이그레이션 목록 · 배포 명령 |
| 5 | `docs/participant-notice.md` | 참가자 사전 안내문(국문·영문). 구현 근거를 표로 함께 관리한다 |
| — | `docs/game-flow.md` · `screen-list.md` · `game-story.md` | 게임 사양(진실의 원천). 코드보다 우선한다 |
| — | `docs/supabase-minimum-design.md` | 서버 설계 — 테이블·RPC·RLS 근거 |
| — | `docs/assets-list.md` | 에셋 정본 매니페스트. 에셋을 바꾸면 여기도 고친다 |

---

## 4. 구조 한눈에

```
src/
├─ main.js              부트스트랩 (게임 상태 로드 → 참가자 흐름 시작)
├─ js/
│  ├─ flow.js           참가자 흐름 상태 기계 (화면 전환·세션·가드)
│  ├─ constants/flow.js resolveStep() — 접근 가드 판정(순수 함수)
│  ├─ lib/              supabase · game(상태) · entries(팀 점유) · progress(점수) · audio
│  ├─ screens/          participant · gameplay · finale · admin
│  └─ dev/              ⚠️ 정답·사건 본문 원본 (프로덕션 번들에서 제거됨)
├─ components/          재사용 UI (팩토리 함수 계약: mount/update/destroy)
└─ css/                 tokens → base → layout → animations
supabase/migrations/    스키마·RPC·정책 (0001~0014, 멱등)
scripts/                검증·시드 생성 (런타임 코드 아님)
public/                 웹 루트로 그대로 서빙 (절대경로 참조)
```

**핵심 원칙 3가지** (자세히는 `CLAUDE.md`):
1. **서버가 진실의 원천이다.** 진행·점수·정답 판정은 전부 서버(RPC)가 한다.
2. **모든 화면은 재진입 가능해야 한다.** 새로고침하면 서버 저장 지점으로 복구된다.
3. **연출과 로직을 분리한다.** 애니메이션·사운드가 실패해도 게임은 진행된다.

---

## 5. 배포

GitHub 자동배포는 **연결돼 있지 않다.** 코드를 반영하려면 CLI 로 배포한다.

```bash
npm run validate && npm run build          # 먼저 통과시킬 것
npx vercel --prod --yes --scope pingjueuna-3402s-projects
```
> `--scope` 없이 실행하면 `Not authorized` 로 실패한다(`.vercel/project.json` 의 orgId 가
> 현재 로그인 스코프와 다르다). 배포 후 확인 절차는 `docs/deployment-checklist.md §8`.

---

## 6. 상태 (2026-08-11 기준)

- 프로덕션 배포 완료 · 마이그레이션 `0001`~`0014` 전부 적용
- 사건 **15개 전부 확정**(임시 데이터 없음) · 사건 본문과 정답은 **서버에만** 내려간다
- 32팀 동시 진행 부하 시뮬레이션 통과 (`docs/handoff.md §12.12`)
- 알려진 미해결: Final Raid BGM 미재생 (`docs/handoff.md §5`)
