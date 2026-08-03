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
    opening: '/videos/opening.mp4',
    ending: '/videos/ending.mp4'
  },
  bgm: {
    opening: '/audio/bgm/opening.mp3',
    quizPass: '/audio/bgm/quiz-pass.mp3',
    killBillian: '/audio/bgm/kill-billian.mp3'
  },
  // 사건 단서 이미지 (파일명은 소문자 .png — Vercel/Linux는 대소문자 구분, CLAUDE.md §14).
  questions: {
    q1: '/images/questions/question1.png',
    q2_1: '/images/questions/question2-1.png',
    q2_2: '/images/questions/question2-2.png',
    q2_3: '/images/questions/question2-3.png',
    q2_4: '/images/questions/question2-4.png',
    q3: '/images/questions/question3.png'
  }
}
