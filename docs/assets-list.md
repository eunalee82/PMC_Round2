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
| /images/logos/badge-black.png | 좌측 패널 로고(미획득/기본 배지) | 있음 |
| /images/logos/badge-gold.png | 서약서·결과·수여식 금배지 | 있음 |

### Characters — `/images/characters/`

| File | Purpose | Status |
|---|---|---|
| /images/characters/all-members.png | 전체 캐릭터(엔딩 대체 연출) | 있음 |
| /images/characters/billian.png | 빌런왕(등장/공격 대상) | 있음 |
| /images/characters/billian-dead.png | 빌런왕 피격·격퇴 상태 | 있음 |
| /images/characters/boss.png | 국장(감독관 임명·엔딩 메시지) | 있음 |

### 사건 단서 이미지 — `/images/questions/`

파일명 `questionN`의 N은 **사건 진행 순번**(1~15)이다. Stage 1 = 1~3 · Stage 2 = 4~10 · Stage 3 = 11~15.

| File | Purpose | Status |
|---|---|---|
| /images/questions/question1.webp | Stage 1 · 1번째 사건 #007 단서 5 (Proactive Mindset) | 있음 · 사용 중 |
| /images/questions/question2-1.webp | Stage 1 · 2번째 사건 #014 단서 1/4 (증거물 A) | 있음 · 사용 중 |
| /images/questions/question2-2.webp | Stage 1 · 2번째 사건 #014 단서 2/4 (증거물 B) | 있음 · 사용 중 |
| /images/questions/question2-3.webp | Stage 1 · 2번째 사건 #014 단서 3/4 (증거물 C) | 있음 · 사용 중 |
| /images/questions/question2-4.webp | Stage 1 · 2번째 사건 #014 단서 4/4 (증거물 D) | 있음 · 사용 중 |
| /images/questions/question3.webp | Stage 1 · 3번째 사건 #021 현장 자료 | 있음 · 사용 중 |
| /images/questions/question4.webp | Stage 2 · 4번째 사건 단서 | 있음 · 사건 미제작 |
| /images/questions/question12-1.webp | Stage 3 · 12번째 사건 #012 단서 1/4 (확보 단서 A) | 있음 · 사용 중 |
| /images/questions/question12-2.webp | Stage 3 · 12번째 사건 #012 단서 2/4 (확보 단서 B) | 있음 · 사용 중 |
| /images/questions/question12-3.webp | Stage 3 · 12번째 사건 #012 단서 3/4 (확보 단서 C) | 있음 · 사용 중 |
| /images/questions/question12-4.webp | Stage 3 · 12번째 사건 #012 단서 4/4 (확보 단서 D) | 있음 · 사용 중 |
| /images/questions/question13.webp | Stage 3 · 13번째 사건 #013 복구된 AI 프로젝트 대시보드 | 있음 · 사용 중 |
| /images/questions/question15-logA.webp | Stage 3 · 15번째 사건 로그 A (무손실 — 평면 텍스트 패널) | 있음 · 사건 미제작 |
| /images/questions/question15-logB.webp | Stage 3 · 15번째 사건 로그 B | 있음 · 사건 미제작 |
| /images/questions/question15-logC.webp | Stage 3 · 15번째 사건 로그 C | 있음 · 사건 미제작 |
| /images/questions/question15-logD.webp | Stage 3 · 15번째 사건 로그 D | 있음 · 사건 미제작 |

> 파일명은 소문자로 통일 — Vercel/Linux 대소문자 구분 대응(§14). 경로 상수는 `src/js/constants/assets.js`의 `ASSETS.questions`가 단일 출처이며, **사건 미제작 파일은 아직 상수에 등록하지 않았다**(사건 데이터를 만들 때 함께 추가한다).
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
| /videos/opening.mp4 | 게임 시작 전 오프닝 | 있음 |
| /videos/ending.mp4 | 게임 종료(엔딩) 영상 | 미정 |

> 엔딩 영상이 없을 경우 `all-members.png` + `boss.png` + `badge-gold.png`로 애니메이션 대체(`docs/game-flow.md §14.3`).

## Audio

### BGM — `/audio/bgm/`

| File | Purpose | Loop | Status |
|---|---|---|---|
| /audio/bgm/opening.mp3 | 오프닝·서약서 서명 음악 | Yes | 있음 |
| /audio/bgm/quiz-pass.mp3 | Stage(Mission) 클리어 | Yes | 있음 |
| /audio/bgm/kill-billian.mp3 | Final Raid·빌런왕 처치 | Yes | 있음 |

### SFX — `/audio/sfx/` (준비)

| File | Purpose | Status |
|---|---|---|
| /audio/sfx/case-success.mp3 | 사건 해결 성공 | 준비 |
| /audio/sfx/case-fail.mp3 | 추가 조사 필요 | 준비 |
| /audio/sfx/item-acquire.mp3 | 아이템 획득 | 준비 |
| /audio/sfx/appointment.mp3 | 감독관 임명 | 준비 |
| /audio/sfx/ceremony.mp3 | 금배지 수여식 | 준비 |

> SFX 파일명은 예시이며, 실제 추가 시 이 표와 `src/js/constants/assets.js`를 함께 갱신한다.

### 사건 단서 오디오(녹취) — `/audio/sfx/questionN/`

듣기 단서. 사건 순번 폴더 아래에 두고, 한 사건에 여러 개면 `-1`~`-4` 접미사를 붙인다.
EvidenceViewer가 네이티브 컨트롤로 재생하고 헤더 소리 설정(볼륨·음소거)을 따른다(`docs/game-flow.md §19.3`).

| File | Purpose | Status |
|---|---|---|
| /audio/sfx/question3/question3-1.mp3 | Stage 1 · 3번째 사건 #021 녹취 A | 있음 · 사용 중 |
| /audio/sfx/question3/question3-2.mp3 | Stage 1 · 3번째 사건 #021 녹취 B | 있음 · 사용 중 |
| /audio/sfx/question3/question3-3.mp3 | Stage 1 · 3번째 사건 #021 녹취 C | 있음 · 사용 중 |
| /audio/sfx/question3/question3-4.mp3 | Stage 1 · 3번째 사건 #021 녹취 D | 있음 · 사용 중 |
| /audio/sfx/question11/question11.mp3 | Stage 3 · 11번째 사건 #011 참가자 증언 녹취 (증언 4명 1파일) | 있음 · 사용 중 |
| /audio/sfx/question14/question14-1.mp3 | Stage 3 · 14번째 사건 #014 이 PM 인터뷰 녹취 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-2.mp3 | Stage 3 · 14번째 사건 #014 최 PM 인터뷰 녹취 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-3.mp3 | Stage 3 · 14번째 사건 #014 한 PM 인터뷰 녹취 | 있음 · 사용 중 |
| /audio/sfx/question14/question14-4.mp3 | Stage 3 · 14번째 사건 #014 박 PM 인터뷰 녹취 | 있음 · 사용 중 |

> 경로 상수는 `ASSETS.questionAudio`(`src/js/constants/assets.js`). 사건 미제작 파일은 아직 상수에 등록하지 않았다.
> 재생 길이 확인: `question11.mp3` 2:01 · `question14-1~4.mp3` 각 10~14초 (브라우저 `loadedmetadata` 기준).
>
> ⚠️ **사건 파일 번호 중복**: Stage 3의 14번째 사건이 Stage 1의 2번째 사건과 같은 `사건 파일 #014`를 쓴다.
> 데이터 id는 `case-014`(Stage 1) / `case-s3-014`(Stage 3)로 분리했지만 **화면에는 둘 다 "사건 파일 #014"로 표시**된다.
> 운영상 혼동이 우려되면 Stage 3쪽 `fileNo`를 다른 번호로 바꾸면 된다(`cases.js`의 `fileNo`만 수정).
