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
| /images/characters/boss.png | 국장(사무관 임명·엔딩 메시지) | 있음 |

### 기타 이미지 폴더 (준비)

`/images/badges/`, `/images/icons/`, `/images/ui/`, `/images/questions/` 폴더는 생성되어 있으나 현재 파일은 없다. 아이콘 세트, UI 조각, 사건 단서 이미지 등을 여기에 추가한다.

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
| /audio/sfx/appointment.mp3 | 사무관 임명 | 준비 |
| /audio/sfx/ceremony.mp3 | 금배지 수여식 | 준비 |

> SFX 파일명은 예시이며, 실제 추가 시 이 표와 `src/js/constants/assets.js`를 함께 갱신한다.
