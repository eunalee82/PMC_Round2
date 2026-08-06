// Runtime asset paths — single source of truth (CLAUDE.md §14, docs/assets-list.md).
// public/ is served at the web root, so these are absolute URLs (never imported).
// Filenames are kebab-case; deployment target (Vercel/Linux) is case-sensitive.

export const ASSETS = {
  // 배경·캐릭터·로고는 2026-08-06에 PNG → WebP(q90)로 교체했다 — 합계 33MB → 9.5MB(-72%).
  // 알파가 있는 로고(logo·badge-gold)는 투명도를 유지한 채 변환했다. 원본 PNG 는 img/orig/ 보관.
  backgrounds: {
    opening: '/images/backgrounds/opening.webp',
    waiting: '/images/backgrounds/waiting.webp',
    allPass: '/images/backgrounds/all-pass.webp',
    onePass: '/images/backgrounds/one-pass.webp',
    logo: '/images/backgrounds/logo.webp',
    questionBg: '/images/backgrounds/question-bg.webp'
  },
  logos: {
    badgeBlack: '/images/logos/badge-black.webp',
    badgeGold: '/images/logos/badge-gold.webp'
  },
  characters: {
    allMembers: '/images/characters/all-members.webp',
    billian: '/images/characters/billian.webp',
    billianDead: '/images/characters/billian-dead.webp',
    boss: '/images/characters/boss.webp'
  },
  videos: {
    // 로컬 오프닝 영상 — 현재 재생 경로는 YouTube 임베드다(아래 openingEmbedId). 이 파일은 쓰지 않지만
    // **행사장에서 YouTube 가 차단될 때의 대체 후보**로 남겨 둔다(지금은 대체 배선이 없다 — opening.js 는
    // 임베드 실패 시 [건너뛰기]/[팀 선택으로] 버튼으로 진행만 보장한다).
    opening: '/videos/opening.mp4',
    // ending.mp4 는 제작되지 않았고, 참가자 흐름에 엔딩 영상 화면도 없다(docs/handoff.md §5).
    // 없는 파일을 상수에 두지 않는다(CLAUDE.md §16.1) → 옛 ending·endingAvailable 키는 제거했다.
    openingEmbedId: 'OTnd68QC0_8' // YouTube 영상 ID (SCR-002 오프닝 임베드) — 2026-08-06 재교체
  },
  bgm: {
    opening: '/audio/bgm/opening.mp3',
    quizPass: '/audio/bgm/quiz-pass.mp3',
    killBillian: '/audio/bgm/kill-billian.mp3'
  },
  // 게임 효과음(사건 단서가 아닌 연출용). 단발 재생은 AudioManager.playSfx 가 담당한다.
  sfx: {
    // Final Raid 타격음 — 3KB·200ms. 외부 에셋이 없어 합성해 만들었다(저역 thump + 노이즈 버스트).
    raidHit: '/audio/sfx/raid/raid-hit.mp3'
  },
  // 사건 단서 이미지 — WebP(q90). 원본 PNG는 장당 2MB급이라 32팀 동시 접속에 부담이어서 교체했다
  // (CLAUDE.md §12). 파일명은 소문자 — Vercel/Linux는 대소문자 구분(§14).
  questions: {
    q1: '/images/questions/question1.webp',
    // 사건 #002 현장 이미지(확정 2026-08-06) — 영문판 1종으로 운영한다. 같은 장면의 국문판
    // question3.webp 는 워터마크가 박힌 초안이고 해상도도 낮아 쓰지 않는다(사건 #001과 같은 운영 결정).
    q2: '/images/questions/question2.webp',
    // 사건 #003 길동 책임 다이어리 A~D. 국문·영문 이미지가 따로 있는 유일한 사건이라 en 별도 키를 둔다
    // (2026-08-06 파일 리네임으로 question2-* → question3-* 가 되어 키·파일명이 사건 번호와 맞아졌다).
    q3_1: '/images/questions/question3-1.webp',
    q3_2: '/images/questions/question3-2.webp',
    q3_3: '/images/questions/question3-3.webp',
    q3_4: '/images/questions/question3-4.webp',
    q3_1_en: '/images/questions/question3-1_en.webp',
    q3_2_en: '/images/questions/question3-2_en.webp',
    q3_3_en: '/images/questions/question3-3_en.webp',
    q3_4_en: '/images/questions/question3-4_en.webp',
    // ── Stage 2 (확정 2026-08-06) ──
    // 사건 #005 증거물 A~E — 평면 텍스트 패널이라 무손실 WebP. 영문판 1종으로 운영한다.
    q5_1: '/images/questions/question5-1.webp',
    q5_2: '/images/questions/question5-2.webp',
    q5_3: '/images/questions/question5-3.webp',
    q5_4: '/images/questions/question5-4.webp',
    q5_5: '/images/questions/question5-5.webp',
    // 사건 #006 Schedule Health Board — 질감 있는 일러스트라 손실 q90.
    q6: '/images/questions/question6.webp',
    // 사건 #008 수기 메모 5장 — 사진이라 손실 q90.
    q8_1: '/images/questions/question8-1.webp',
    q8_2: '/images/questions/question8-2.webp',
    q8_3: '/images/questions/question8-3.webp',
    q8_4: '/images/questions/question8-4.webp',
    q8_5: '/images/questions/question8-5.webp',
    // 사건 #010 회고 보고서 — 국문·영문 별도. 평면 인포그래픽이라 텍스트 선명도 위해 q96.
    q10: '/images/questions/question10.webp',
    q10_en: '/images/questions/question10_en.webp',
    // 사건 #012 — 화면 캡처형이라 무손실 WebP (docs/assets-list.md 인코딩 규칙).
    // 영문판 도착(2026-08-06) → en.evidence 가 _en 을 가리킨다.
    q12_1: '/images/questions/question12-1.webp',
    q12_2: '/images/questions/question12-2.webp',
    q12_3: '/images/questions/question12-3.webp',
    q12_4: '/images/questions/question12-4.webp',
    q12_1_en: '/images/questions/question12-1_en.webp',
    q12_2_en: '/images/questions/question12-2_en.webp',
    q12_3_en: '/images/questions/question12-3_en.webp',
    q12_4_en: '/images/questions/question12-4_en.webp',
    // 사건 #013 대시보드는 **국문·영문 공용**이다(운영 결정 2026-08-06) — 별도 _en 을 두지 않는다.
    q13: '/images/questions/question13.webp',
    // 사건 #015 복구 로그 — 평면 텍스트 패널이라 무손실 WebP (docs/assets-list.md 인코딩 규칙).
    // 영문판 도착(2026-08-06) → en.evidence 가 _en 을 가리킨다.
    q15_a: '/images/questions/question15-log-a.webp',
    q15_b: '/images/questions/question15-log-b.webp',
    q15_c: '/images/questions/question15-log-c.webp',
    q15_d: '/images/questions/question15-log-d.webp',
    q15_a_en: '/images/questions/question15-log-a_en.webp',
    q15_b_en: '/images/questions/question15-log-b_en.webp',
    q15_c_en: '/images/questions/question15-log-c_en.webp',
    q15_d_en: '/images/questions/question15-log-d_en.webp'
  },
  // 사건 단서 오디오(녹취) — #002(Accountability/Empowered Mindset) · #011(AI Adoption) · #014(Risk)
  questionAudio: {
    // 사건 #002 녹취 A~D(확정 2026-08-06). 옛 question3/question3-1~4.mp3 를 대체한다 —
    // 녹취 순서가 바뀌었으므로 정답 인덱스도 함께 바뀌었다(dev/solutions.js 'case-002').
    // 영문 음성 도착(2026-08-06) → en.evidence 가 _en 을 가리킨다.
    q2_1: '/audio/sfx/question2/question2-1.mp3',
    q2_2: '/audio/sfx/question2/question2-2.mp3',
    q2_3: '/audio/sfx/question2/question2-3.mp3',
    q2_4: '/audio/sfx/question2/question2-4.mp3',
    q2_1_en: '/audio/sfx/question2/question2-1_en.mp3',
    q2_2_en: '/audio/sfx/question2/question2-2_en.mp3',
    q2_3_en: '/audio/sfx/question2/question2-3_en.mp3',
    q2_4_en: '/audio/sfx/question2/question2-4_en.mp3',
    // 사건 #003 감독관 브리핑 음성(2026-08-06 도착) — 국문·영문 각 1개.
    // 사건 개요가 "음성을 듣고 …"로 지시하는데 그동안 음원이 없어 판단 근거가 비어 있었다.
    q3: '/audio/sfx/question3/question3.mp3',
    q3_en: '/audio/sfx/question3/question3_en.mp3',
    // ── Stage 2 (확정 2026-08-06) — 국문·영문 음성이 모두 있다 ──
    // 사건 #004 관계자 인터뷰 — 인터뷰 1~4가 **한 파일에 이어져 있다**(사건 #011과 같은 형태).
    // 인터뷰별로 따로 재생하게 하려면 question4-1~4.mp3 로 분할된 파일이 필요하다.
    q4: '/audio/sfx/question4/question4.mp3',
    q4_en: '/audio/sfx/question4/question4_en.mp3',
    // 사건 #007 PM 후보 A~D 답변
    q7_1: '/audio/sfx/question7/question7-1.mp3',
    q7_2: '/audio/sfx/question7/question7-2.mp3',
    q7_3: '/audio/sfx/question7/question7-3.mp3',
    q7_4: '/audio/sfx/question7/question7-4.mp3',
    q7_1_en: '/audio/sfx/question7/question7-1_en.mp3',
    q7_2_en: '/audio/sfx/question7/question7-2_en.mp3',
    q7_3_en: '/audio/sfx/question7/question7-3_en.mp3',
    q7_4_en: '/audio/sfx/question7/question7-4_en.mp3',
    // 사건 #009 관계자 인터뷰 A~D
    q9_1: '/audio/sfx/question9/question9-1.mp3',
    q9_2: '/audio/sfx/question9/question9-2.mp3',
    q9_3: '/audio/sfx/question9/question9-3.mp3',
    q9_4: '/audio/sfx/question9/question9-4.mp3',
    q9_1_en: '/audio/sfx/question9/question9-1_en.mp3',
    q9_2_en: '/audio/sfx/question9/question9-2_en.mp3',
    q9_3_en: '/audio/sfx/question9/question9-3_en.mp3',
    q9_4_en: '/audio/sfx/question9/question9-4_en.mp3',
    // 사건 #011 참가자 증언 — 증언 4명이 **한 파일**에 이어져 있다. 영문판은 4개 WAV 로 도착해
    // 같은 형태로 병합했다(증언 사이 0.8초 공백 + 64kbps 모노 MP3). 원본 WAV 는 img/audio-src/ 보관.
    q11: '/audio/sfx/question11/question11.mp3',
    q11_en: '/audio/sfx/question11/question11_en.mp3',
    // 사건 #014 후보 PM 인터뷰 A~D. 영문 음성 도착(2026-08-06) — 원본이 WAV(개당 0.7~1.2MB)로 와서
    // 국문과 같은 규격의 MP3(64kbps 모노)로 변환했다. 원본 WAV 는 img/audio-src/ 에 보관(서빙 제외).
    q14_1: '/audio/sfx/question14/question14-1.mp3',
    q14_2: '/audio/sfx/question14/question14-2.mp3',
    q14_3: '/audio/sfx/question14/question14-3.mp3',
    q14_4: '/audio/sfx/question14/question14-4.mp3',
    q14_1_en: '/audio/sfx/question14/question14-1_en.mp3',
    q14_2_en: '/audio/sfx/question14/question14-2_en.mp3',
    q14_3_en: '/audio/sfx/question14/question14-3_en.mp3',
    q14_4_en: '/audio/sfx/question14/question14-4_en.mp3'
  }
}
