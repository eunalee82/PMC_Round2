# Assets List

> 이 문서는 `public/`에 실제 존재하거나 준비 예정인 에셋의 **정본 매니페스트**입니다.
> 런타임 경로는 항상 절대경로(`/images/...`, `/audio/...`, `/videos/...`)로 참조하며, 파일명은 **kebab-case**로 통일합니다.
>
> 상태: **있음**(파일 존재) · **준비**(계획됨/미제작) · **미정**(사용 여부 결정 전)

## Images

### Backgrounds — `/images/backgrounds/`

| File | Purpose | Status |
|---|---|---|
| /images/backgrounds/opening.png | 오프닝 배경 | 있음 |
| /images/backgrounds/waiting.png | 대기실 배경 | 있음 |
| /images/backgrounds/all-pass.png | Stage 3 통과(전체 통과) 배경 | 있음 |
| /images/backgrounds/one-pass.jpg | Stage 1·2 통과 배경 | 있음 |
| /images/backgrounds/logo.png | 게임 로고 | 있음 |
| /images/backgrounds/question-bg.png | 사건(문제) 배경 | 있음 |

### Logos — `/images/logos/`

| File | Purpose | Status |
|---|---|---|
| /images/logos/badge-black.png | 헤더 로고 · 임명 화면 임시 배지(SCR-015) | 있음 · 사용 중 |
| /images/logos/badge-gold.png | 입장·서약·대기실 · 금배지 수여식(SCR-020) · 엔딩 · 게임 종료(SCR-023) | 있음 · 사용 중 |

### Characters — `/images/characters/`

| File | Purpose | Status |
|---|---|---|
| /images/characters/all-members.png | 전체 캐릭터(엔딩 대체 연출 SCR-021) | 있음 · 사용 중 |
| /images/characters/billian.png | 빌런왕(긴급 경보 SCR-016 · 레이드 SCR-018 공격 대상) | 있음 · 사용 중 |
| /images/characters/billian-dead.png | 빌런왕 격퇴 상태(SCR-019) | 있음 · 사용 중 |
| /images/characters/boss.png | 국장(감독관 임명 SCR-015 · 엔딩 메시지 SCR-021) | 있음 · 사용 중 |

### 사건 단서 이미지 — `/images/questions/`

파일명 `questionN`의 N은 **사건 진행 순번**(1~15)이다. Stage 1 = 1~3 · Stage 2 = 4~10 · Stage 3 = 11~15.

| File | Purpose | Status |
|---|---|---|
| /images/questions/question1.webp | Stage 1 · 1번째 사건 #007 단서 4 (Proactive Mindset) — **영문판 이미지**(CLUE 1~4). 2026-08-05 교체: 단서 5개→4개, 국문→영문 | 있음 · 사용 중 |
| /images/questions/question2.webp | Stage 1 · 2번째 사건 #002 현장 자료 — **영문판 1종으로 운영**(프로젝트 상황판). 2026-08-06 신규 | 있음 · 사용 중 |
| /images/questions/question3-1.webp | Stage 1 · 3번째 사건 #003 다이어리 1/4 (증거물 A) · 국문 | 있음 · 사용 중 |
| /images/questions/question3-2.webp | Stage 1 · 3번째 사건 #003 다이어리 2/4 (증거물 B) · 국문 | 있음 · 사용 중 |
| /images/questions/question3-3.webp | Stage 1 · 3번째 사건 #003 다이어리 3/4 (증거물 C) · 국문 | 있음 · 사용 중 |
| /images/questions/question3-4.webp | Stage 1 · 3번째 사건 #003 다이어리 4/4 (증거물 D) · 국문 | 있음 · 사용 중 |
| /images/questions/question3-1_en.webp | 같은 단서 **영문판** (2026-08-06 도착). 국문판의 '현장 메모' 포스트잇이 영문판에는 없다 | 있음 · 사용 중 |
| /images/questions/question3-2_en.webp | 같은 단서 영문판 | 있음 · 사용 중 |
| /images/questions/question3-3_en.webp | 같은 단서 영문판 | 있음 · 사용 중 |
| /images/questions/question3-4_en.webp | 같은 단서 영문판 | 있음 · 사용 중 |
| /images/questions/question4.webp | 출시 17분 후 AUTH ERROR · Incident Analysis 장면. **어느 사건도 쓰지 않는다** — 사건 #004(플랫폼 변경 거버넌스)와 내용이 맞지 않아 `assets.js` 미등록 | 있음 · 미사용 |
| /images/questions/question5-1~5.webp | Stage 2 · 사건 #005 증거물 A~E (무손실 — 평면 텍스트 패널) · 영문판 1종 | 있음 · 사용 중 |
| /images/questions/question6.webp | Stage 2 · 사건 #006 Week 4 Schedule Health Board (q90 — 질감 일러스트) | 있음 · 사용 중 |
| /images/questions/question8-1~5.webp | Stage 2 · 사건 #008 수기 메모 1~5 (q90 — 사진) | 있음 · 사용 중 |
| /images/questions/question10.webp | Stage 2 · 사건 #010 회고 보고서 발췌 · 국문 (q96 — 평면 인포그래픽, 텍스트 선명도 우선) | 있음 · 사용 중 |
| /images/questions/question10_en.webp | 같은 보고서 **영문판** | 있음 · 사용 중 |
| /images/questions/question12-1.webp | Stage 3 · 12번째 사건 #012 단서 1/4 (확보 단서 A) | 있음 · 사용 중 |
| /images/questions/question12-2.webp | Stage 3 · 12번째 사건 #012 단서 2/4 (확보 단서 B) | 있음 · 사용 중 |
| /images/questions/question12-3.webp | Stage 3 · 12번째 사건 #012 단서 3/4 (확보 단서 C) | 있음 · 사용 중 |
| /images/questions/question12-4.webp | Stage 3 · 12번째 사건 #012 단서 4/4 (확보 단서 D) | 있음 · 사용 중 |
| /images/questions/question13.webp | Stage 3 · 13번째 사건 #013 복구된 AI 프로젝트 대시보드. **국문·영문 공용**(운영 결정 2026-08-06 — 별도 영문판을 만들지 않는다) | 있음 · 사용 중 |
| /images/questions/question15-logA.webp | Stage 3 · 15번째 사건 #015 복구된 로그 A (무손실 — 평면 텍스트 패널) · 국문 | 있음 · 사용 중 |
| /images/questions/question15-logB.webp | Stage 3 · 15번째 사건 #015 복구된 로그 B · 국문 | 있음 · 사용 중 |
| /images/questions/question15-logC.webp | Stage 3 · 15번째 사건 #015 복구된 로그 C · 국문 | 있음 · 사용 중 |
| /images/questions/question15-logD.webp | Stage 3 · 15번째 사건 #015 복구된 로그 D · 국문 | 있음 · 사용 중 |
| /images/questions/question15-logA~D_en.webp | 같은 로그 **영문판** (2026-08-06 도착 · 무손실 · 장당 8~10KB) | 있음 · 사용 중 |
| /images/questions/question12-1~4_en.webp | 사건 #012 확보 단서 A~D **영문판** (2026-08-06 도착 · 무손실 · 장당 30~39KB) | 있음 · 사용 중 |

> 파일명은 소문자로 통일 — Vercel/Linux 대소문자 구분 대응(§14). 경로 상수는 `src/js/constants/assets.js`의 `ASSETS.questions`가 단일 출처이며, **사건 미제작 파일은 아직 상수에 등록하지 않았다**(사건 데이터를 만들 때 함께 추가한다).
>
> **영문판 단서 규칙**: 같은 단서의 영문 이미지는 `-_en` 접미사(`question3-1_en.webp`)로 두고, `cases.js`의 `en.evidence.images[].src`만 교체한다(사건 #003이 유일한 사례). 영문판이 없는 사건은 en 화면도 국문 이미지를 그대로 쓴다.
> 원본 PNG는 **서빙되지 않는 `img/questions/`** 에 보관한다(`.gitignore`의 `/img/` — git 미추적). `public/`에는 WebP만 둔다. 확장자 대문자(`.PNG`)로 받은 파일은 반드시 소문자 `.webp`로 변환해 넣는다.
> ✅ **최적화 완료**: PNG(장당 1.8~2.3MB, 합계 16.1MB) → **WebP(합계 1.5MB, -91%)**. 해상도는 원본 유지. 원본 PNG는 커밋 `2ac781b` 이전 히스토리에 남아 있다(`git show 2ac781b:public/images/questions/question1.png > 파일`로 복구).
>
> **인코딩 규칙 — 그림 종류에 따라 다르게 쓴다.** 새 단서 이미지를 넣을 때 이 기준을 따른다(Pillow 사용).
> - **사진·일러스트형**(다이어리·현장 사진 등): 손실 `save(out,'WEBP',quality=90,method=6)` → 1/10 이하로 줄고 원본 대비 PSNR 38~45dB로 텍스트 가독성 영향 없음.
> - **선·표·글자형**(화면 캡처·도표 = `question12-*`): **무손실** `save(out,'WEBP',lossless=True,method=6)`. 이런 그림은 손실 q90이 PSNR 34dB까지 떨어지면서 용량 이득도 30%뿐이지만, 무손실은 **품질 손실 0으로 -56%**(231KB→101KB)다.
>
> 판단 기준은 "UI 캡처냐"가 아니라 **그림 자체가 평면(flat)이냐**다. `question13`은 대시보드지만 배경이 그려진 일러스트라 무손실이 821KB인 반면 손실 q90은 158KB이고, 3배 확대 비교에서 SPI 1.02·CPI 0.99 같은 정답 근거 숫자가 원본과 구분되지 않아 손실을 택했다.
>
> ℹ️ **영문 단서 미디어**: 문제 이미지·음성의 영문판은 별도 제공 예정이다. 도착하면 파일을 `-en` 접미사로 추가하고 `cases.js`의 `en.evidence` 안 `src`만 교체한다(`localizeCase`가 `c.en.evidence`를 우선한다). 지금은 en도 국문 미디어를 그대로 참조한다.

### 기타 이미지 폴더 (준비)

`/images/badges/`, `/images/icons/`, `/images/ui/` 폴더는 생성되어 있으나 현재 파일은 없다. 아이콘 세트, UI 조각 등을 여기에 추가한다.

## Videos — `/videos/`

| File | Purpose | Status |
|---|---|---|
| /videos/opening.mp4 | 게임 시작 전 오프닝 (현재는 YouTube 임베드를 사용) | 있음 · 미사용 |
| YouTube 임베드 `BLitSGtLXHY` | **실제 사용하는 오프닝 영상**(SCR-002). 교체는 `ASSETS.videos.openingEmbedId` 한 곳만 바꾼다 | 2026-08-06 교체 · 사용 중 |
| /videos/ending.mp4 | 게임 종료(엔딩) 영상 | 미정 |

> **엔딩 영상 게이트**: 파일이 없으므로 `src/js/constants/assets.js`의 `ASSETS.videos.endingAvailable = false`로 두어 **요청 자체를 하지 않는다**(404 방지). 이 상태에서 SCR-021은 `all-members.png` + `boss.png`(국장 최종 메시지) + `badge-gold.png` 대체 연출로 진행한다(`docs/game-flow.md §14.3`).
> 영상이 준비되면 `public/videos/ending.mp4`를 넣고 플래그만 `true`로 바꾼다 — 재생 실패 시에도 `error` 이벤트로 대체 연출로 자동 전환된다.

## Audio

### BGM — `/audio/bgm/`

| File | Purpose | Loop | Status |
|---|---|---|---|
| /audio/bgm/opening.mp3 | 오프닝·서약서 서명 음악 | Yes | 있음 · 사용 중 |
| /audio/bgm/quiz-pass.mp3 | Stage(Mission) 클리어 — Stage 결과 화면(SCR-012)에서 **단발 재생**(AudioManager `playSfx`) | No | 있음 · 사용 중 |
| /audio/bgm/kill-billian.mp3 | Final Raid·빌런왕 처치 (SCR-016~019 진행 중 BGM) | Yes | 있음 · 사용 중 |

### SFX — `/audio/sfx/` (준비)

| File | Purpose | Status |
|---|---|---|
| /audio/sfx/case-success.mp3 | 사건 해결 성공 | 준비 |
| /audio/sfx/case-fail.mp3 | 추가 조사 필요 | 준비 |
| /audio/sfx/item-acquire.mp3 | 아이템 획득 | 준비 |
| /audio/sfx/appointment.mp3 | 감독관 임명 | 준비 |
| /audio/sfx/ceremony.mp3 | 금배지 수여식 | 준비 |

> SFX 파일명은 예시이며, 실제 추가 시 이 표와 `src/js/constants/assets.js`를 함께 갱신한다.
> 현재 이 5개 SFX는 **모두 미제작**이라 코드에서 참조하지 않는다(없는 경로를 상수에 넣어 404를 만들지 않는다).
> 제작되면 `ASSETS.sfx`를 추가하고 `ctx.audio.playSfx(...)`로 호출한다 — 호출 지점 후보: 사건 결과(SCR-010/011), 아이템 획득(SCR-013), 감독관 임명 수락(SCR-015), 금배지 수여식(SCR-020). 재생 실패는 조용히 무시되므로 연출이 없어도 진행은 막히지 않는다.

### 사건 단서 오디오(녹취) — `/audio/sfx/questionN/`

듣기 단서. 사건 순번 폴더 아래에 두고, 한 사건에 여러 개면 `-1`~`-4` 접미사를 붙인다.
EvidenceViewer가 네이티브 컨트롤로 재생하고 헤더 소리 설정(볼륨·음소거)을 따른다(`docs/game-flow.md §19.3`).

| File | Purpose | Status |
|---|---|---|
| /audio/sfx/question2/question2-1.mp3 | Stage 1 · 2번째 사건 #002 녹취 A | 있음 · 사용 중 |
| /audio/sfx/question2/question2-2.mp3 | Stage 1 · 2번째 사건 #002 녹취 B (**정답 대화**) | 있음 · 사용 중 |
| /audio/sfx/question2/question2-1~4_en.mp3 | 같은 녹취 **영문판** (2026-08-06 도착) | 있음 · 사용 중 |
| /audio/sfx/question2/question2-3.mp3 | Stage 1 · 2번째 사건 #002 녹취 C | 있음 · 사용 중 |
| /audio/sfx/question2/question2-4.mp3 | Stage 1 · 2번째 사건 #002 녹취 D | 있음 · 사용 중 |
| /audio/sfx/question3/question3.mp3 | Stage 1 · 3번째 사건 #003 감독관 브리핑 · 국문 (2026-08-06 도착) | 있음 · 사용 중 |
| /audio/sfx/question3/question3_en.mp3 | 같은 브리핑 **영문판** | 있음 · 사용 중 |
| /audio/sfx/question4/question4.mp3 | Stage 2 · 사건 #004 관계자 인터뷰 · 국문. **인터뷰 1~4가 한 파일** — 사건 #011은 2026-08-10에 화자별로 나눴으므로 이제 이 사건만 병합 형태다 | 있음 · 사용 중 |
| /audio/sfx/question4/question4_en.mp3 | 같은 인터뷰 **영문판** | 있음 · 사용 중 |
| /audio/sfx/question7/question7-1~4.mp3 | Stage 2 · 사건 #007 PM 후보 A~D 답변 · 국문 | 있음 · 사용 중 |
| /audio/sfx/question7/question7-1~4_en.mp3 | 같은 답변 **영문판** | 있음 · 사용 중 |
| /audio/sfx/question9/question9-1~4.mp3 | Stage 2 · 사건 #009 인터뷰 A~D(개발조직장·사업부 임원·HR·Chief Architect) · 국문 | 있음 · 사용 중 |
| /audio/sfx/question9/question9-1~4_en.mp3 | 같은 인터뷰 **영문판** | 있음 · 사용 중 |
| /audio/sfx/question11/question11-1~4.mp3 | Stage 3 · 사건 #011 참가자 증언 1~4(개발자·일정 담당자·상품기획 담당자·품질 담당자) · 국문. **2026-08-10 화자별 분할**(각 28~32초 · 합 121.2초 ≈ 병합본 120.8초) | 있음 · 사용 중 |
| /audio/sfx/question11/question11-1~4_en.mp3 | 같은 증언 **영문판** 화자별 분할(각 25~29초 · 합 106.7초 ≈ 병합본 106.8초) | 있음 · 사용 중 |
| ~~/audio/sfx/question11/question11.mp3~~<br>~~/audio/sfx/question11/question11_en.mp3~~ | 증언 4명을 이어 붙인 **병합본**. 특정 증언만 다시 들을 수 없어 제한 시간을 크게 먹어서 화자별 분할로 대체(2026-08-10). `img/audio-src/` 로 옮겼다 | 서빙 제외 · 보관 |
| /audio/sfx/question14/question14-1~4_en.mp3 | Stage 3 · 사건 #014 후보 PM 인터뷰 **영문판** (2026-08-06 도착). 원본이 WAV(0.7~1.2MB)로 와서 **64kbps 모노 MP3 로 변환**했다(60~103KB). 원본 WAV 는 `img/audio-src/` 보관 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-1.mp3 | Stage 3 · 14번째 사건 #014 이 PM 인터뷰 녹취 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-2.mp3 | Stage 3 · 14번째 사건 #014 최 PM 인터뷰 녹취 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-3.mp3 | Stage 3 · 14번째 사건 #014 한 PM 인터뷰 녹취 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-4.mp3 | Stage 3 · 14번째 사건 #014 박 PM 인터뷰 녹취 | 있음 · 사용 중 |

> 경로 상수는 `ASSETS.questionAudio`(`src/js/constants/assets.js`). 사건 미제작 파일은 아직 상수에 등록하지 않았다.
> 재생 길이 확인: `question11-1~4.mp3` 각 28~32초(합 2:01) · `question14-1~4.mp3` 각 10~14초.
> 분할 파일은 **합계가 병합본 길이와 일치하는지**로 누락을 확인한다(MP3 프레임 헤더 기준).
>
> ⚠️ **사건 파일 번호 중복**: Stage 3의 14번째 사건이 Stage 1의 2번째 사건과 같은 `사건 파일 #014`를 쓴다.
> 데이터 id는 `case-014`(Stage 1) / `case-s3-014`(Stage 3)로 분리했지만 **화면에는 둘 다 "사건 파일 #014"로 표시**된다.
> 운영상 혼동이 우려되면 Stage 3쪽 `fileNo`를 다른 번호로 바꾸면 된다(`cases.js`의 `fileNo`만 수정).
