// Stage 메타 — 브리핑 문구/테마/검증 영역 + 완료 보상(SCR-013) 메타. CLAUDE.md §6의 constants/stages.js.
// 게임플레이(case.js)·감독관 임명(SCR-015)·Final Raid(SCR-017/018)·최종 랭킹(SCR-022)이 모두 이 표를 읽는다.
// 문자열은 직접 넣지 않고 copy 키(...Key)만 둔다 — 화면이 t(key)로 로케일에 맞게 출력한다(§15).
// 보상 3종은 docs/game-flow.md §8.4 / §9.3 / §10.3, 화면 사양은 screen-list.md SCR-013.
//   Stage 1 Rare Item   갑질 미러 방패        → Final Raid: 빌런 공격 반사
//   Stage 2 Epic Item   리소스 무제한 승인서   → Final Raid: 대규모 지원 공격(궁극기)
//   Stage 3 Legend Skill 배째 마스터           → Final Raid: 최종 강력 스킬
import { ASSETS } from './assets.js'

export const STAGE_META = {
  1: {
    theme: '1', label: 'MISSION 01 · MINDSET', domain: 'Mindset',
    nameKey: 'briefing.stage1.name', missionKey: 'briefing.stage1.mission',
    item: {
      icon: 'shield', bg: ASSETS.backgrounds.onePass,
      rarityKey: 'item.stage1.rarity', nameKey: 'item.stage1.name', descKey: 'item.stage1.desc',
      congratsKey: 'item.stage1.congrats', effectKey: 'item.stage1.effect', nextKey: 'item.next'
    }
  },
  2: {
    theme: '2', label: 'MISSION 02 · PERFORMANCE DOMAIN', domain: 'Performance Domain',
    nameKey: 'briefing.stage2.name', missionKey: 'briefing.stage2.mission',
    item: {
      icon: 'file', bg: ASSETS.backgrounds.onePass,
      rarityKey: 'item.stage2.rarity', nameKey: 'item.stage2.name', descKey: 'item.stage2.desc',
      congratsKey: 'item.stage2.congrats', effectKey: 'item.stage2.effect', nextKey: 'item.nextStage3'
    }
  },
  3: {
    // Stage 3 보상은 아이템이 아니라 스킬(배째 마스터)이라 번개 아이콘을 쓴다.
    theme: '3', label: 'MISSION 03 · AI USE CASE', domain: 'AI Use Case',
    nameKey: 'briefing.stage3.name', missionKey: 'briefing.stage3.mission',
    item: {
      icon: 'zap', bg: ASSETS.backgrounds.allPass,
      rarityKey: 'item.stage3.rarity', nameKey: 'item.stage3.name', descKey: 'item.stage3.desc',
      congratsKey: 'item.stage3.congrats', effectKey: 'item.stage3.effect', nextKey: 'item.appoint'
    }
  }
}

// 좌측 사이드바 EVIDENCE 슬롯 / 랭킹 장비 아이콘 (미획득은 lock 아이콘).
export const STAGE_ITEM_ICONS = { 1: 'shield', 2: 'file', 3: 'zap' }

// 사이드바 Stage Score 행 키 — left-sidebar.js의 STAGE_ICONS와 짝을 이룬다.
export const STAGE_SCORE_KEYS = { 1: 'mindset', 2: 'domain', 3: 'ai' }
