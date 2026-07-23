# PM Protection Bureau — Screen List

> **PMBOK® 8th Edition 기반 PM 역량 검증 크라임씬 게임 화면 정의서**

---

# 1. 문서 목적

이 문서는 PM Protection Bureau 게임에 필요한 전체 화면을 정의한다.

각 화면별로 다음 내용을 정리한다.

- 화면 ID
- 화면명
- 화면 목적
- 주요 사용자
- 진입 조건
- 주요 구성 요소
- 주요 버튼
- 화면 전환
- 데이터 요구사항
- 연출 및 사운드
- 예외 처리
- 구현 우선순위

이 문서는 다음 작업의 기준으로 사용한다.

- 참가자 화면 구현
- 관리자 화면 구현
- 공통 컴포넌트 설계
- 라우팅 구조 설계
- 게임 상태별 접근 제어
- 디자인 시안 제작
- 테스트 시나리오 작성

---

# 2. 화면 설계 원칙

## 2.1 게임 UI 우선

모든 화면은 일반적인 교육 사이트나 설문 페이지가 아니라 다음 분위기를 유지한다.

- 비밀 기관 시스템
- 사건 수사 대시보드
- 미래형 Mission Control
- 게임 HUD
- 크라임씬 조사 화면
- PM 역량 인증 시스템

---

## 2.2 검은색 중심 디자인

배경은 검은색과 짙은 회색 계열을 사용한다.

```text
Primary Background: #08090D
Secondary Background: #11131A
Panel Background: #151822
Border: rgba(255,255,255,0.08)
```

화면 전체를 검은색 계열로 통일하여 획득한 배지와 아이템이 강하게 빛나도록 한다.

---

## 2.3 Stage별 컬러

```text
Stage 1 — Mindset
Purple / Blue

Stage 2 — Performance Domain
Cyan / Electric Blue

Stage 3 — AI Use Case
Green / Neon Green

Final Raid
Red / Crimson

Ending
Gold
```

Stage 컬러는 포인트로만 사용하고 전체 배경은 검은색을 유지한다.

---

## 2.4 공통 레이아웃

주요 게임 화면은 다음 3단 구조를 기본으로 한다.

```text
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├──────────────┬──────────────────────────┬───────────────┤
│ Left Sidebar │ Main Content             │ Right Panel   │
│              │                          │               │
│ Team         │ 사건 / Mission           │ Stage 정보    │
│ Ranking      │ 문제                     │ PMBOK 관점    │
│ Score        │ 영상 / 단서              │ Agent 정보    │
│ Items        │                          │               │
└──────────────┴──────────────────────────┴───────────────┘
```

모바일에서는 오른쪽 패널을 접을 수 있으며, 왼쪽 패널은 하단 메뉴 또는 슬라이드 패널로 전환한다.

---

# 3. 전체 화면 목록

| ID | 화면명 | 사용자 | 핵심 목적 |
|---|---|---|---|
| SCR-001 | Entry Gate | 참가자 | 게임 입장 |
| SCR-002 | Opening Video | 참가자 | 세계관 소개 |
| SCR-003 | Team Selection | 참가자 | 팀 선택 |
| SCR-004 | Oath Agreement | 참가자 | 기밀 유지 서약 |
| SCR-005 | Waiting Room | 참가자 | 게임 시작 대기 |
| SCR-006 | Main Dashboard | 참가자 | 전체 진행 현황 |
| SCR-007 | Stage Briefing | 참가자 | Stage Mission 안내 |
| SCR-008 | Case Investigation | 참가자 | 사건 단서 확인 및 판단 |
| SCR-009 | Answer Confirmation | 참가자 | 답안 제출 확인 |
| SCR-010 | Case Success | 참가자 | 사건 해결 결과 |
| SCR-011 | Additional Investigation | 참가자 | 오답 결과 및 해설 |
| SCR-012 | Stage Result | 참가자 | Stage 점수 확인 |
| SCR-013 | Item Acquisition | 참가자 | 아이템 획득 |
| SCR-014 | Next Stage Decision | 참가자 | 다음 Stage 이동 |
| SCR-015 | Officer Appointment | 참가자 | 사무관 임명 |
| SCR-016 | Emergency Alert | 참가자 | Final Raid 경고 |
| SCR-017 | Final Raid Ready | 참가자 | 레이드 준비 |
| SCR-018 | Final Raid Battle | 참가자 | 빌런왕 공격 |
| SCR-019 | Villain Defeated | 참가자 | 빌런왕 격퇴 |
| SCR-020 | Gold Badge Ceremony | 참가자 | 금배지 수여 |
| SCR-021 | Ending Video | 참가자 | 엔딩 콘텐츠 |
| SCR-022 | Final Ranking | 참가자 | 최종 순위 확인 |
| SCR-023 | Game End | 참가자 | 게임 종료 |
| SCR-101 | Admin Login | 관리자 | 관리자 인증 |
| SCR-102 | Admin Dashboard | 관리자 | 게임 전체 현황 |
| SCR-103 | Game Control | 관리자 | Start, End 제어 |
| SCR-104 | Team Monitor | 관리자 | 팀별 진행 확인 |
| SCR-105 | Ranking Control | 관리자 | 순위 확인 및 공개 |
| SCR-106 | Question List | 관리자 | 문제 목록 관리 |
| SCR-107 | Question Editor | 관리자 | 문제 생성 및 수정 |
| SCR-108 | Asset Preview | 관리자 | 영상·이미지·음원 확인 |
| SCR-109 | Final Raid Control | 관리자 | 레이드 시작 |
| SCR-110 | System Test | 관리자 | 행사 전 기능 점검 |

---

# 4. 참가자 화면 상세 정의

---

# SCR-001. Entry Gate

## 화면명

PM보호국 입구

## 목적

참가자가 게임에 최초 접속했을 때 게임의 정체성과 분위기를 전달하고 입장을 시작한다.

## 진입 조건

- 게임 URL 접속
- 게임 상태가 종료 상태가 아님

## 주요 구성 요소

- LG SW PM Competition 2026 로고
- PM Protection Bureau 로고
- PM보호국 명칭
- 부제
- 행사 또는 Mission 안내
- 게임 입장 버튼
- 음향 설정
- 전체 화면 전환 버튼
- 지원 브라우저 안내

## 메인 문구

```text
PM Protection Bureau

PMBOK® 8th Edition 기반
PM 역량 검증 크라임씬 게임
```

## 버튼

```text
[PM보호국 입장]
[음향 켜기]
[전체 화면]
```

## 화면 전환

```text
입장
→ SCR-002 Opening Video
```

## 연출

- 검은 배경
- 금배지 약한 Glow
- 천천히 움직이는 입자
- 로고 Fade In
- 버튼 Hover 시 빛이 좌우로 이동

## 예외 처리

게임이 종료된 경우:

```text
현재 자격 검증이 종료되었습니다.
```

---

# SCR-002. Opening Video

## 화면명

오프닝 영상

## 목적

PM보호국의 세계관과 플레이어의 역할을 소개한다.

## 주요 구성 요소

- `/videos/opening.mp4`
- 재생·일시정지
- 음소거
- 진행 바
- 건너뛰기
- 전체 화면

## 버튼

```text
[재생]
[건너뛰기]
[음소거]
```

## 화면 전환

```text
영상 종료
→ SCR-003 Team Selection
```

## 연출

- 영상 시작 전 검은 화면
- PM보호국 로고 짧게 표시
- 영상 종료 시 Fade Out

## 예외 처리

영상 재생 실패 시:

```text
오프닝 영상 재생에 실패했습니다.

[다시 재생]
[텍스트 브리핑 보기]
```

---

# SCR-003. Team Selection

## 화면명

신입 수사관 팀 선택

## 목적

참가자가 자신이 소속된 팀을 선택한다.

## 주요 구성 요소

- 팀 선택 카드 또는 드롭다운
- 팀명
- 팀별 식별 색상
- 참가 인원
- 선택 확인 영역
- 사건 접수 버튼

## 기본 문구

```text
수사관 정보를 확인하십시오.

소속 팀을 선택한 후
사건 접수를 시작할 수 있습니다.
```

## 버튼

```text
[사건 접수 시작]
```

## 데이터

- team_id
- team_name
- team_color
- participant_count
- selected_at

## 화면 전환

```text
팀 선택 완료
→ SCR-004 Oath Agreement
```

## 검증

- 팀 미선택 시 진행 불가
- 존재하지 않는 팀 접근 차단
- 팀별 최대 인원 설정 가능
- 선택한 팀은 세션과 서버에 저장

---

# SCR-004. Oath Agreement

## 화면명

PM보호국 기밀 유지 서약

## 목적

참가자가 PM보호국 신입 수사관으로서 Mission 수행 원칙에 동의한다.

## 주요 구성 요소

- `/images/logos/badge-gold.png`
- 서약 제목
- 서약문
- 선택한 팀명
- 이름 또는 서명 입력
- 동의 체크박스
- 서약 완료 버튼

## 배경음악

```text
/audio/bgm/opening.mp3
```

Loop: Yes

## 서약 문구

```text
본인은 PM보호국 신입 수사관으로서
프로젝트의 Value를 최우선으로 판단하며,
왜곡된 실행과 잘못된 의사결정을 발견할 경우
PMBOK® 8th Edition의 원칙에 따라
사건을 공정하게 조사할 것을 서약합니다.
```

## 버튼

```text
[서약 완료]
```

## 데이터

- team_id
- signer_name
- accepted
- pledged_at

## 화면 전환

```text
서약 완료
→ SCR-005 Waiting Room
```

## 연출

- 금배지 Gold Glow
- 서약 완료 시 서명 스캔 효과
- 확인음
- 잠금 해제 애니메이션

---

# SCR-005. Waiting Room

## 화면명

출동 대기실

## 목적

서약을 완료한 참가자가 관리자 Start 명령을 기다린다.

## 주요 구성 요소

- 팀명
- 수사관 등록 상태
- 게임 시작 예정 시각
- 참가 팀 목록
- 현재 접속 상태
- Stage 정보
- 잠금 아이템
- 대기 메시지
- 음향 설정

## 메인 문구

```text
수사관 등록이 완료되었습니다.

PM보호국의 출동 명령을 기다리십시오.
```

## 상태 표시

```text
SYSTEM STATUS: CONNECTED
MISSION STATUS: WAITING
```

## 화면 전환

```text
관리자 Start
→ SCR-007 Stage Briefing
```

## 실시간 처리

- game.status 구독
- 참가 팀 수 실시간 반영
- 연결 상태 표시
- 시작 시 자동 전환

## 연출

- `/images/backgrounds/waiting.png`
- 배경에 천천히 움직이는 Scan Line
- 시작 직전 3초 카운트다운 가능

---

# SCR-006. Main Dashboard

## 화면명

PM보호국 Main Dashboard

## 목적

참가자가 전체 진행 상태, 점수, 순위, 아이템을 확인하는 공통 게임 화면이다.

## 적용 화면

- Stage Briefing
- 사건 조사
- 사건 결과
- Stage 결과
- Final Raid 이전

## Header 구성

- 행사 로고
- PM Protection Bureau 상태
- 알림
- 음향
- 설정
- 전체 남은 시간

## Left Sidebar 구성

### Agent

- 팀명
- 계급
- 총점

### Ranking

- 현재 순위
- 상위 팀
- 팀별 점수

### Stage Score

- Mindset
- Domain
- AI

### Items

- 갑질 미러 방패
- 리소스 무제한 승인서
- 배째 마스터

## Right Panel 구성

- PMBOK 8th Edition 3가지 관점
- 현재 Stage 핵심 개념
- Agent Level
- 진행률
- 도움말

## 반응형

- Desktop: 좌측·중앙·우측 3단
- Tablet: 좌측·중앙 2단, 우측 접기
- Mobile: 중앙 우선, 패널 Drawer 방식

---

# SCR-007. Stage Briefing

## 화면명

Mission Briefing

## 목적

Stage 진입 전 Mission 목표와 검증 내용을 안내한다.

## 공통 구성 요소

- Stage 번호
- Stage 명칭
- Mission 문구
- 검증 영역
- 사건 수
- 획득 가능 아이템
- Mission 시작 버튼

## Stage 1 문구

```text
STAGE 1

MINDSET 인증

2026년에 맞는 PM의 Mindset을 검증하라.
```

## Stage 2 문구

```text
STAGE 2

PERFORMANCE DOMAIN 검증

복잡한 프로젝트 환경에서
올바른 판단과 의사결정 역량을 검증하라.
```

## Stage 3 문구

```text
STAGE 3

AI USE CASE 검증

AI 시대의 PM 판단력을 검증하라.
```

## 버튼

```text
[Mission 시작]
```

## 화면 전환

```text
Mission 시작
→ SCR-008 Case Investigation
```

## 연출

- Stage 컬러 확산
- Mission 번호 확대
- 사건 파일 열림 효과
- 아이템 실루엣 미리 보기

---

# SCR-008. Case Investigation

## 화면명

사건 조사 화면

## 목적

각 문제별 사건 단서를 확인하고 PM 판단을 제출한다.

## 화면 구조

```text
상단
- Stage
- 사건 번호
- 진행률
- 남은 시간
- 점수

중앙 상단
- 사건 제목
- 긴급도
- 사건 개요

중앙
- 영상 / 이미지 / 음성 / 문서 단서

중앙 하단
- 질문
- 선택지
- 판단 제출 버튼

좌측
- 팀, 점수, 순위, 아이템

우측
- PMBOK 핵심 관점
- 현재 사건 키워드
```

## 사건 콘텐츠 유형

```text
video
image
audio
document
conversation
email
chart
table
text
mixed
```

## 주요 요소

- 사건 번호
- 사건 제목
- 사건 브리핑
- 단서 콘텐츠
- 질문
- 객관식 선택지
- 선택 상태
- 판단 제출

## 버튼

```text
[단서 다시 보기]
[판단 제출]
```

## 데이터

- question_id
- stage_id
- question_order
- title
- briefing
- clue_type
- clue_url
- question_text
- choices
- selected_choice
- score
- submitted_at

## 화면 전환

```text
판단 제출
→ SCR-009 Answer Confirmation
```

## 검증

- 선택지 미선택 시 제출 불가
- 종료 시간 이후 제출 불가
- 중복 제출 불가
- 이미 제출한 문제 재제출 불가

---

# SCR-009. Answer Confirmation

## 화면명

판단 제출 확인

## 목적

실수로 답안을 제출하는 것을 방지한다.

## 주요 구성 요소

- 선택한 답안
- 제출 후 수정 불가 안내
- 취소
- 최종 제출

## 안내 문구

```text
선택한 판단을 제출하시겠습니까?

제출 후에는 수정할 수 없습니다.
```

## 버튼

```text
[다시 검토]
[최종 제출]
```

## 화면 전환

```text
정답
→ SCR-010 Case Success

오답
→ SCR-011 Additional Investigation
```

---

# SCR-010. Case Success

## 화면명

사건 해결 성공

## 목적

정답 결과와 핵심 학습 내용을 전달한다.

## 주요 구성 요소

- 사건 해결 성공 문구
- 획득 점수
- 정답 선택지
- 핵심 판단 근거
- PMBOK 관점
- 다음 사건 버튼

## 문구

```text
CASE RESOLVED

사건 해결 성공
```

## 버튼

```text
[사건 분석 보고서]
[다음 사건 조사]
```

## 연출

- Blue 또는 Stage 컬러 Glow
- 성공 파티클
- 점수 Count Up
- 성공 효과음

## 화면 전환

```text
다음 사건 존재
→ SCR-008 Case Investigation

Stage 마지막 사건
→ SCR-012 Stage Result
```

---

# SCR-011. Additional Investigation

## 화면명

추가 조사 필요

## 목적

오답을 알리고 올바른 PM 판단 방향을 제공한다.

## 주요 구성 요소

- 추가 조사 필요 문구
- 선택한 답안
- 정답 또는 판단 방향
- 사건 분석
- PMBOK 핵심 개념
- 다음 사건 버튼

## 문구

```text
ADDITIONAL INVESTIGATION REQUIRED

단서가 부족합니다.
사건 분석 보고서를 확인하십시오.
```

## 버튼

```text
[사건 분석 보고서]
[다음 사건 조사]
```

## 연출

- 짧은 Red 경고
- 과도한 실패 연출 금지
- 감점 또는 획득 점수 표시

## 화면 전환

```text
다음 사건 존재
→ SCR-008 Case Investigation

Stage 마지막 사건
→ SCR-012 Stage Result
```

---

# SCR-012. Stage Result

## 화면명

Stage 결과 보고서

## 목적

Stage 완료 결과를 정리하고 아이템 획득 화면으로 연결한다.

## 주요 구성 요소

- Stage 완료 문구
- 총 사건 수
- 해결 사건 수
- Stage 점수
- 정답률
- 핵심 역량 요약
- 통과 여부
- 보상 확인 버튼

## 문구

```text
MISSION COMPLETE

Stage 검증이 완료되었습니다.
```

## 버튼

```text
[보상 확인]
```

## 화면 전환

```text
보상 확인
→ SCR-013 Item Acquisition
```

---

# SCR-013. Item Acquisition

## 화면명

아이템 획득

## 목적

Stage 완료 보상으로 획득한 아이템을 강조한다.

## Stage 1 아이템

```text
Rare Item

갑질 미러 방패
```

에셋 예시:

```text
/images/backgrounds/one-pass.jpg
```

## Stage 2 아이템

```text
Legend Item

리소스 무제한 승인서
```

에셋 예시:

```text
/images/backgrounds/one-pass.jpg
```

## Stage 3 아이템

```text
Legend Skill

배째 마스터
```

에셋 예시:

```text
/images/backgrounds/all-pass.png
```

## 주요 구성 요소

- 희귀도
- 아이템명
- 아이템 이미지
- 설명
- 최종 레이드 사용 안내
- 다음 버튼

## 버튼

```text
[아이템 장착]
```

## 연출

- 검은 화면
- 실루엣 등장
- Glow 증가
- 아이템 회전 또는 확대
- 획득 효과음
- 좌측 아이템 슬롯 활성화

## 화면 전환

```text
아이템 장착
→ SCR-014 Next Stage Decision
```

---

# SCR-014. Next Stage Decision

## 화면명

다음 Stage 진행 확인

## 목적

Stage 완료 후 다음 Mission을 자연스럽게 연결한다.

## 문구

Stage 1:

```text
갑질 미러 방패를 획득했습니다.

Stage 2를 진행하시겠습니까?
```

Stage 2:

```text
리소스 무제한 승인서를 획득했습니다.

Stage 3를 진행하시겠습니까?
```

Stage 3:

```text
모든 자격 검증을 완료했습니다.

사무관 임명 절차를 진행합니다.
```

## 버튼

```text
[다음 Stage 진행]
[잠시 대기]
```

## 화면 전환

```text
Stage 1 완료
→ SCR-007 Stage 2 Briefing

Stage 2 완료
→ SCR-007 Stage 3 Briefing

Stage 3 완료
→ SCR-015 Officer Appointment
```

---

# SCR-015. Officer Appointment

## 화면명

PM보호국 사무관 임명

## 목적

모든 Stage를 통과한 참가자를 정식 사무관으로 임명한다.

## 주요 구성 요소

- `/images/characters/boss.png`
- 국장 메시지
- 팀명
- Stage 완료 내역
- 획득 아이템 3개
- 검은 배지 또는 임시 배지
- 임명 수락 버튼

## 국장 메시지

```text
수사관 여러분,

모든 자격 검증 Mission을 통과했습니다.

지금부터 여러분을
PM보호국 정식 사무관으로 임명합니다.
```

## 버튼

```text
[임명 수락]
```

## 화면 전환

```text
임명 수락
→ SCR-016 Emergency Alert
```

## 연출

- 국장 이미지 등장
- 배지 실루엣 활성화
- 계급 변화
- 짧은 임명 사운드

---

# SCR-016. Emergency Alert

## 화면명

PM보호국 긴급 경보

## 목적

사무관 임명 직후 빌런왕 출현을 알리고 Final Raid로 전환한다.

## 주요 구성 요소

- 붉은 시스템 경고
- 빌런왕 출현 정보
- 위치
- 위험도
- 생존율
- 경고음
- 화면 노이즈

## 문구

```text
[PM보호국 긴급 알림]

빌런왕이 출현했습니다.

위치: Final Release Gate
위험도: FINAL
생존율: 20%
```

## 버튼

```text
[긴급 상황 확인]
```

## 화면 전환

```text
확인
→ SCR-017 Final Raid Ready
```

## 연출

- 화면 Glitch
- Red Flash
- 경고음
- 시스템 패널 붕괴 효과
- `/images/characters/billian.png` 실루엣

---

# SCR-017. Final Raid Ready

## 화면명

Final Raid 준비

## 목적

획득한 아이템을 확인하고 레이드 시작을 준비한다.

## 주요 구성 요소

- 빌런왕 정보
- 획득 아이템 3개
- 자동 장착 연출
- Raid 규칙
- 20초 안내
- 준비 완료 버튼
- 시작 대기 상태

## 아이템

```text
갑질 미러 방패
리소스 무제한 승인서
배째 마스터
```

## 문구

```text
모든 장비가 활성화되었습니다.

20초 동안 빌런왕을 공격하십시오.
```

## 버튼

```text
[레이드 준비 완료]
```

## 화면 전환

```text
관리자 Final Raid Start
또는 자동 카운트다운
→ SCR-018 Final Raid Battle
```

---

# SCR-018. Final Raid Battle

## 화면명

빌런왕 레이드

## 목적

20초 동안 빌런왕을 반복 클릭하거나 터치해 격퇴한다.

## 주요 구성 요소

- `/images/characters/billian.png`
- 빌런왕 체력바
- 남은 시간
- 공격 버튼 또는 캐릭터 클릭 영역
- 데미지 숫자
- 공격 횟수
- 아이템 스킬 발동
- 팀 Raid 기여도

## 배경음악

```text
/audio/bgm/kill-billian.mp3
```

## 인터랙션

```text
Click / Touch
→ 공격
→ 피격 효과
→ 체력 감소
→ 아이템 효과
```

## 아이템 효과

### 갑질 미러 방패

빌런의 공격을 반사한다.

### 리소스 무제한 승인서

대규모 지원 공격을 발동한다.

### 배째 마스터

강력한 최종 스킬을 발동한다.

## 종료 조건

- 20초 종료
- 체력 0
- 관리자 강제 종료

## 화면 전환

```text
Raid 성공
→ SCR-019 Villain Defeated
```

---

# SCR-019. Villain Defeated

## 화면명

빌런왕 격퇴

## 목적

Final Raid 성공을 강렬하게 연출한다.

## 주요 구성 요소

- 빌런왕 사망 또는 무력화 이미지
- 최종 데미지
- 공격 횟수
- 팀 기여도
- Mission Complete 문구

## 문구

```text
FINAL MISSION COMPLETE

빌런왕 격퇴 성공
```

## 버튼

```text
[최종 임명 절차]
```

## 연출

- 체력 0
- 화면 흔들림
- 폭발 또는 입자 분해
- 흰색 Flash
- 검은 화면 전환

## 화면 전환

```text
확인
→ SCR-020 Gold Badge Ceremony
```

---

# SCR-020. Gold Badge Ceremony

## 화면명

금배지 수여식

## 목적

최종 보상인 PM보호국 금배지를 수여한다.

## 주요 에셋

```text
/images/logos/badge-gold.png
```

## 주요 구성 요소

- 금배지
- 팀명
- 정식 사무관 임명 문구
- 국장 축하 메시지
- 인증 완료 상태

## 문구

```text
MISSION COMPLETE

PM Protection Bureau

공식 사무관 임명 완료
```

## 버튼

```text
[엔딩 보기]
```

## 연출

- 완전한 검은 배경
- 금배지만 강한 Glow
- Light Sweep
- 입자 효과
- 배지 회전
- Gold 사운드

## 화면 전환

```text
엔딩 보기
→ SCR-021 Ending Video
```

---

# SCR-021. Ending Video

## 화면명

엔딩 영상

## 목적

게임의 결말과 참가자의 임무 완료를 축하한다.

## 기본 에셋

```text
/videos/ending.mp4
```

현재 상태:

```text
미정
```

## 대체 콘텐츠

엔딩 영상이 없을 경우 다음 에셋으로 애니메이션을 구성한다.

```text
/images/characters/all-members.png
/images/characters/boss.png
/images/logos/badge-gold.png
```

## 버튼

```text
[건너뛰기]
[최종 결과 확인]
```

## 화면 전환

```text
영상 종료
→ SCR-022 Final Ranking
```

---

# SCR-022. Final Ranking

## 화면명

최종 랭킹

## 목적

팀별 최종 점수와 순위를 공개한다.

## 주요 구성 요소

- 1위 팀 강조
- 전체 팀 순위
- 총점
- Stage별 점수
- 정답 수
- 완료 시간
- Final Raid 공격 횟수
- 획득 아이템

## 순위 컬러

```text
1위: Gold
2위: Silver
3위: Bronze
기타: Dark Gray
```

## 버튼

```text
[내 결과 보기]
[게임 종료]
```

## 화면 전환

```text
게임 종료
→ SCR-023 Game End
```

---

# SCR-023. Game End

## 화면명

게임 종료

## 목적

게임이 완전히 종료되었음을 안내한다.

## 주요 구성 요소

- PM보호국 금배지
- 팀명
- 최종 계급
- 총점
- 최종 순위
- 감사 메시지
- 행사 안내

## 문구

```text
수고하셨습니다.

여러분은 프로젝트의 Value를 지켜냈습니다.

PM보호국 정식 사무관 임명을 축하합니다.
```

## 버튼

```text
[최종 결과 다시 보기]
```

---

# 5. 관리자 화면 상세 정의

---

# SCR-101. Admin Login

## 목적

관리자 권한을 확인한다.

## 주요 구성 요소

- 관리자 이메일
- 비밀번호
- 로그인 버튼
- 오류 메시지

## 버튼

```text
[관리자 로그인]
```

## 화면 전환

```text
로그인 성공
→ SCR-102 Admin Dashboard
```

---

# SCR-102. Admin Dashboard

## 목적

행사 운영에 필요한 전체 상태를 한눈에 확인한다.

## 주요 구성 요소

- 게임 상태
- 현재 시각
- 시작 예정 시각
- 종료 예정 시각
- 참가 팀 수
- 서약 완료 팀 수
- Stage별 진행 팀 수
- 완료 팀 수
- 연결 상태
- 실시간 알림

## 카드

```text
참가 현황
서약 현황
Stage 진행률
현재 1위
시스템 상태
```

---

# SCR-103. Game Control

## 목적

게임 상태를 직접 제어한다.

## 주요 기능

- 입장 개방
- 입장 마감
- 게임 Start
- 게임 End
- 일시 정지
- 재개
- 종료 시간 변경
- 전체 화면 공지

## 버튼

```text
[입장 개방]
[게임 시작]
[게임 종료]
[일시 정지]
[게임 재개]
```

## 주의

게임 Start와 End는 확인 모달을 반드시 표시한다.

---

# SCR-104. Team Monitor

## 목적

팀별 진행 상태와 연결 상태를 확인한다.

## 표시 항목

- 팀명
- 참가 인원
- 서약 상태
- 현재 Stage
- 현재 사건
- 총점
- 마지막 활동 시각
- 연결 상태
- 완료 여부

## 기능

- 팀 상세 보기
- 진행 단계 복구
- 연결 오류 확인
- 점수 재계산
- 특정 팀 화면 이동

---

# SCR-105. Ranking Control

## 목적

실시간 랭킹을 확인하고 공개 여부를 제어한다.

## 주요 기능

- 랭킹 공개
- 랭킹 숨김
- Stage별 순위
- 최종 순위
- 점수 재계산
- CSV 다운로드

## 표시 항목

- 순위
- 팀명
- 총점
- Stage 점수
- 정답 수
- 완료 시간

---

# SCR-106. Question List

## 목적

전체 문제 목록을 관리한다.

## 주요 구성 요소

- Stage 필터
- 문제 번호
- 제목
- 콘텐츠 유형
- 점수
- 활성 상태
- 수정
- 삭제
- 순서 변경

## 버튼

```text
[새 사건 등록]
[순서 저장]
```

---

# SCR-107. Question Editor

## 목적

문제를 생성하거나 수정한다.

## 입력 항목

- Stage
- 사건 번호
- 사건 제목
- 사건 브리핑
- 단서 유형
- 단서 파일 경로
- 질문
- 선택지
- 정답
- 해설
- PMBOK 핵심 개념
- 점수
- 활성화 여부

## 지원 콘텐츠

```text
video
image
audio
document
text
mixed
```

## 버튼

```text
[미리 보기]
[임시 저장]
[저장]
```

---

# SCR-108. Asset Preview

## 목적

영상, 이미지, 음원 파일이 정상적으로 재생되는지 확인한다.

## 주요 기능

- 이미지 미리 보기
- 영상 재생
- 음원 재생
- 파일 경로 확인
- 누락 파일 확인
- 로딩 속도 확인

## 표시 항목

- 파일명
- 경로
- 유형
- 용량
- 상태
- 사용 화면

---

# SCR-109. Final Raid Control

## 목적

Final Raid 시작 시점과 종료를 제어한다.

## 주요 기능

- 준비 완료 팀 확인
- Raid 카운트다운 시작
- Raid 시작
- Raid 종료
- 체력 강제 조정
- 빌런왕 격퇴 연출 실행
- 금배지 수여 화면 전환

## 버튼

```text
[카운트다운]
[Final Raid 시작]
[강제 격퇴]
[엔딩 전환]
```

---

# SCR-110. System Test

## 목적

행사 전에 전체 시스템을 점검한다.

## 점검 항목

- Opening 영상
- BGM
- 효과음
- 이미지 경로
- Supabase 연결
- 실시간 상태
- 답안 제출
- 점수 계산
- 랭킹
- 관리자 Start
- 관리자 End
- Final Raid
- 엔딩
- 모바일 화면
- 전체 화면 모드

## 버튼

```text
[전체 자동 점검]
[사운드 테스트]
[영상 테스트]
[데이터베이스 테스트]
[테스트 데이터 초기화]
```

---

# 6. 공통 모달 목록

| ID | 모달명 | 용도 |
|---|---|---|
| MOD-001 | Answer Submit Confirm | 답안 제출 확인 |
| MOD-002 | Audio Permission | 음향 재생 권한 요청 |
| MOD-003 | Network Error | 네트워크 오류 |
| MOD-004 | Time Expired | 게임 시간 종료 |
| MOD-005 | Stage Locked | 잠긴 Stage 접근 |
| MOD-006 | Item Detail | 아이템 설명 |
| MOD-007 | PMBOK Explanation | 문제 해설 |
| MOD-008 | Game Start Confirm | 관리자 게임 시작 확인 |
| MOD-009 | Game End Confirm | 관리자 게임 종료 확인 |
| MOD-010 | Reconnect | 재접속 처리 |
| MOD-011 | Fullscreen Guide | 전체 화면 안내 |
| MOD-012 | Exit Warning | 페이지 이탈 경고 |

---

# 7. 공통 컴포넌트 목록

## Navigation

- AppHeader
- LeftSidebar
- RightInfoPanel
- MobileBottomNavigation
- ConnectionIndicator

## Game Components

- StageProgress
- MissionCard
- CaseCard
- QuestionChoice
- EvidenceViewer
- VideoEvidence
- AudioEvidence
- ImageEvidence
- DocumentEvidence
- ScoreCounter
- RankingList
- Timer
- ProgressBar

## Item Components

- ItemSlot
- ItemCard
- ItemGlow
- ItemUnlockAnimation
- BadgeDisplay

## Feedback Components

- SuccessPanel
- FailurePanel
- ExplanationPanel
- Toast
- Alert
- ConfirmModal
- LoadingOverlay

## Final Raid Components

- VillainCharacter
- HealthBar
- AttackButton
- DamageNumber
- SkillButton
- RaidTimer
- ScreenShake
- HitEffect

## Admin Components

- AdminHeader
- StatusCard
- TeamStatusTable
- QuestionTable
- QuestionForm
- GameControlPanel
- SystemLog

---

# 8. 라우팅 구조 제안

```text
/
├── /entry
├── /opening
├── /team
├── /oath
├── /waiting
├── /game
│   ├── /stage/1
│   ├── /stage/1/case/:questionId
│   ├── /stage/1/result
│   ├── /stage/2
│   ├── /stage/2/case/:questionId
│   ├── /stage/2/result
│   ├── /stage/3
│   ├── /stage/3/case/:questionId
│   └── /stage/3/result
├── /appointment
├── /alert
├── /raid
├── /ceremony
├── /ending
├── /ranking
├── /complete
└── /admin
    ├── /login
    ├── /dashboard
    ├── /control
    ├── /teams
    ├── /ranking
    ├── /questions
    ├── /questions/new
    ├── /questions/:questionId
    ├── /assets
    ├── /raid
    └── /test
```

실제 URL 접근 시 서버의 게임 상태와 팀 진행 상태를 확인하여 허용된 화면으로 이동시킨다.

---

# 9. 화면 접근 권한

| 화면 | 미등록 | 팀 선택 | 서약 완료 | 게임 시작 | Stage 완료 | 관리자 |
|---|---:|---:|---:|---:|---:|---:|
| Entry | O | O | O | O | O | X |
| Opening | O | O | O | O | O | X |
| Team Selection | O | O | X | X | X | X |
| Oath | X | O | O | X | X | X |
| Waiting Room | X | X | O | O | X | X |
| Stage 1 | X | X | O | O | O | X |
| Stage 2 | X | X | X | 조건부 | O | X |
| Stage 3 | X | X | X | 조건부 | O | X |
| Final Raid | X | X | X | 조건부 | O | X |
| Ranking | X | X | X | 조건부 | O | O |
| Admin | X | X | X | X | X | O |

---

# 10. 화면 구현 우선순위

## Priority 1 — 핵심 참가자 흐름

- SCR-001 Entry Gate
- SCR-002 Opening Video
- SCR-003 Team Selection
- SCR-004 Oath Agreement
- SCR-005 Waiting Room
- SCR-007 Stage Briefing
- SCR-008 Case Investigation
- SCR-009 Answer Confirmation
- SCR-010 Case Success
- SCR-011 Additional Investigation
- SCR-012 Stage Result
- SCR-013 Item Acquisition

## Priority 2 — 게임 완료 흐름

- SCR-014 Next Stage Decision
- SCR-015 Officer Appointment
- SCR-016 Emergency Alert
- SCR-017 Final Raid Ready
- SCR-018 Final Raid Battle
- SCR-019 Villain Defeated
- SCR-020 Gold Badge Ceremony
- SCR-021 Ending Video
- SCR-022 Final Ranking
- SCR-023 Game End

## Priority 3 — 관리자

- SCR-101 Admin Login
- SCR-102 Admin Dashboard
- SCR-103 Game Control
- SCR-104 Team Monitor
- SCR-105 Ranking Control

## Priority 4 — 콘텐츠 운영

- SCR-106 Question List
- SCR-107 Question Editor
- SCR-108 Asset Preview
- SCR-109 Final Raid Control
- SCR-110 System Test

---

# 11. 1차 MVP 범위

1차 MVP에는 다음 화면만 우선 구현한다.

```text
Entry Gate
Opening Video
Team Selection
Oath Agreement
Waiting Room
Stage Briefing
Case Investigation
Case Result
Stage Result
Item Acquisition
Officer Appointment
Final Raid
Gold Badge Ceremony
Final Ranking
Admin Login
Admin Dashboard
Game Control
```

다음 기능은 2차 이후 구현할 수 있다.

- 문제 순서 Drag & Drop
- 정교한 에셋 관리
- 상세 통계
- CSV 다운로드
- 고급 애니메이션
- 팀별 Raid 기여도 분석
- 사용자별 개별 계정
- 다중 게임 관리

---

# 12. 화면 완료 기준

각 화면은 다음 조건을 만족해야 완료된 것으로 본다.

- 검은색 기반 디자인 시스템을 따른다.
- 데스크톱 1920×1080에서 정상 표시된다.
- 노트북 1366×768에서 주요 콘텐츠가 잘리지 않는다.
- 태블릿에서 조작 가능하다.
- 모바일에서 최소한의 게임 진행이 가능하다.
- 버튼 Hover, Focus, Disabled 상태가 구현되어 있다.
- 키보드 접근이 가능하다.
- 이미지와 영상에 대체 콘텐츠가 있다.
- 로딩 상태가 존재한다.
- 오류 상태가 존재한다.
- 서버 저장 중 중복 제출을 방지한다.
- 새로고침 후 올바른 화면으로 복구된다.
- 현재 게임 상태에 맞지 않는 직접 URL 접근을 차단한다.
- 음소거 설정이 화면 전환 후에도 유지된다.
- Stage별 색상은 포인트로만 사용된다.
- 획득한 배지와 아이템에는 Glow 효과가 적용된다.