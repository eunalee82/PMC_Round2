// Runtime asset paths — single source of truth (CLAUDE.md §14, docs/assets-list.md).
// public/ is served at the web root, so these are absolute URLs (never imported).
// Filenames are kebab-case; deployment target (Vercel/Linux) is case-sensitive.

export const ASSETS = {
  backgrounds: {
    opening: '/images/backgrounds/opening.png',
    waiting: '/images/backgrounds/waiting.png',
    allPass: '/images/backgrounds/all-pass.png',
    onePass: '/images/backgrounds/one-pass.jpg',
    logo: '/images/backgrounds/logo.png',
    questionBg: '/images/backgrounds/question-bg.png'
  },
  logos: {
    badgeBlack: '/images/logos/badge-black.png',
    badgeGold: '/images/logos/badge-gold.png'
  },
  characters: {
    allMembers: '/images/characters/all-members.png',
    billian: '/images/characters/billian.png',
    billianDead: '/images/characters/billian-dead.png',
    boss: '/images/characters/boss.png'
  },
  videos: {
    opening: '/videos/opening.mp4', // 로컬 원본(미사용 — 오프닝은 YouTube 임베드로 대체)
    ending: '/videos/ending.mp4',
    openingEmbedId: 'Hm13qr-_0yI' // YouTube 영상 ID (SCR-002 오프닝 임베드)
  },
  bgm: {
    opening: '/audio/bgm/opening.mp3',
    quizPass: '/audio/bgm/quiz-pass.mp3',
    killBillian: '/audio/bgm/kill-billian.mp3'
  },
  // 사건 단서 이미지 — WebP(q90). 원본 PNG는 장당 2MB급이라 32팀 동시 접속에 부담이어서 교체했다
  // (CLAUDE.md §12). 파일명은 소문자 — Vercel/Linux는 대소문자 구분(§14).
  questions: {
    q1: '/images/questions/question1.webp',
    q2_1: '/images/questions/question2-1.webp',
    q2_2: '/images/questions/question2-2.webp',
    q2_3: '/images/questions/question2-3.webp',
    q2_4: '/images/questions/question2-4.webp',
    q3: '/images/questions/question3.webp'
  },
  // 사건 단서 오디오(녹취) — #021(Accountability/Empowered Mindset) · #011(AI Adoption)
  questionAudio: {
    q3_1: '/audio/sfx/question3/question3-1.mp3',
    q3_2: '/audio/sfx/question3/question3-2.mp3',
    q3_3: '/audio/sfx/question3/question3-3.mp3',
    q3_4: '/audio/sfx/question3/question3-4.mp3',
    q11: '/audio/sfx/question11/question11.mp3'
  }
}
