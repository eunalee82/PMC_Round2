// UI copy registry — 로케일별 문자열(키 기반). 화면은 lib/copy.js `t(key)` / `copyEl(...)`로 렌더.
// 구조: COPY[locale][key]. en에 없는 키는 자동으로 ko로 폴백된다(lib/copy.js).
// ▶ 영문 지원: 아래 en 객체에 ko와 '같은 키'로 영문 값을 채우면 en 로케일에서 사용된다.
//   지금은 콘텐츠 미제작 단계라 en은 비어 있고 전부 ko로 폴백된다. DEV 편집은 현재 로케일에만 적용.
// Keep keys stable; edit values freely.

const OATH_TEXT_KO = `본인은 PM보호국 신입 수사관으로서
프로젝트의 Value를 최우선으로 판단하며,
왜곡된 실행과 잘못된 의사결정을 발견할 경우
PMBOK® 8th Edition의 원칙에 따라
사건을 공정하게 조사할 것을 서약합니다.`

const KO = {
  // SCR-001 Entry
  'entry.brandline': 'LG SW PM COMPETITION 2026',
  'entry.eyebrow': 'PROJECT MANAGEMENT PROTECTION BUREAU',
  'entry.title': 'PM보호국',
  'entry.subtitle': 'PMBOK® 8th Edition 기반 PM 역량 검증 크라임씬 게임',
  'entry.alert': '긴급 사건 접수 — 감독관 자격 시험 15문항',
  'entry.enter': 'PM보호국 입장',
  'entry.foot': 'PMB-OS · CLASSIFIED',

  // SCR-002 Opening
  'opening.skip': '건너뛰기',
  'opening.briefingStamp': 'PMB 브리핑',
  'opening.briefing1': '현대의 프로젝트는 기술이 아니라 잘못된 판단으로 실패한다.',
  'opening.briefing2': '그 실패를 만드는 존재를 PM보호국은 "빌런"이라 부른다.',
  'opening.briefing3': '신입 수사관이여, 15개의 사건을 해결하고 프로젝트의 가치를 지켜라.',
  'opening.fallbackRetry': '다시 재생',
  'opening.fallbackProceed': '팀 선택으로',

  // SCR-003 Team Selection
  'team.step': 'STEP 01 · 신입 수사관 등록',
  'team.title': '소속 팀을 선택하십시오',
  'team.lead': '소속 팀을 선택하고 수사관 3명을 등록하면 사건 접수를 시작할 수 있습니다.',
  'team.start': '사건 접수 시작',

  // SCR-003 · 수사관 등록 모달
  'team.register.hint': '팀원 3명의 이메일 주소를 모두 입력하십시오. 등록된 이메일은 재접속 시 팀 확인에 사용됩니다.',
  'team.register.submit': '입장',
  'team.register.cancel': '취소',
  'team.register.errEmpty': '수사관 3명의 이메일을 모두 입력해야 입장할 수 있습니다.',
  'team.register.errDuplicate': '같은 이메일이 중복 입력되었습니다. 팀원 3명은 서로 달라야 합니다.',
  'team.register.warnSuspect': '이메일 형식을 확인하십시오. 이대로도 입장은 되지만 운영진 확인 대상으로 표시됩니다.',
  'team.registered': '등록된 수사관',
  'team.registeredEdit': '수정',

  // SCR-003 · 이미 입장한 팀 (재입장)
  'team.claimed.title': '이미 입장한 팀입니다',
  'team.claimed.hint': '우리 팀이 맞다면 등록된 수사관 이메일 중 하나를 입력하십시오.',
  'team.claimed.placeholder': '등록된 수사관 이메일',
  'team.claimed.submit': '이어서 입장',
  'team.claimed.cancel': '다른 팀 선택',
  'team.claimed.err': '등록되지 않은 이메일입니다. 팀을 다시 확인하십시오.',
  'team.released.title': '입장이 해제되었습니다',
  'team.released.msg': '운영진이 팀 입장을 해제했거나 다른 기기가 이 팀을 이어받았습니다. 소속 팀을 다시 선택하십시오.',
  'team.released.confirm': '확인',

  // SCR-004 Oath
  'oath.step': 'STEP 02 · 기밀 유지 서약',
  'oath.title': 'PM보호국 기밀 유지 서약',
  'oath.text': OATH_TEXT_KO,
  'oath.agents': '등록 수사관',
  'oath.fieldLabel': '서명',
  'oath.agree': '위 서약 내용에 동의하며, 수사관으로서 성실히 임무를 수행하겠습니다.',
  'oath.submit': '서약 완료',

  // SCR-005 Waiting Room
  'waiting.eyebrow': '출동 대기실 · WAITING ROOM',
  'waiting.title': '수사관 등록이 완료되었습니다',
  'waiting.msg': 'PM보호국의 출동 명령을 기다리십시오.',
  'waiting.startTime': '관리자 시작 대기',
  'waiting.mission1': 'Stage 1 · Mindset',
  'waiting.mission2': 'Stage 2 · Performance Domain',
  'waiting.mission3': 'Stage 3 · AI Use Case',
  'waiting.pulse': '출동 명령 수신 대기 중…',

  // 게임플레이 · 사건(Case) 공통 라벨 (CLAUDE.md §15 게임 용어).
  // 사건 본문(제목/개요/보기/해설)은 데이터에 있다 → src/js/data/cases.js
  'case.fileLabel': '사건 파일',
  'case.briefLabel': '사건 개요',
  'case.evidenceLabel': '현장 단서',
  'case.selectHint': '단서 하나를 선택한 뒤 판단을 제출하십시오.',
  'case.submit': '판단 제출',
  'case.resolved': 'CASE RESOLVED',
  'case.resolvedKo': '사건 해결',
  'case.incorrect': 'ADDITIONAL INVESTIGATION REQUIRED',
  'case.incorrectKo': '추가 조사 필요',
  'case.analysisTitle': '사건 분석 보고서',
  'case.next': '다음 사건 조사',
  'case.nextLast': 'Stage 결과 보기',
  'case.noAnalysis': '분석 보고서가 아직 준비되지 않았습니다.',

  // SCR-007 Stage Briefing
  'briefing.label': 'MISSION BRIEFING',
  'briefing.domain': '검증 영역',
  'briefing.cases': '사건 수',
  'briefing.reward': '획득 가능 아이템',
  'briefing.start': 'Mission 시작',
  'briefing.pending': '사건 준비 중',
  'briefing.stage1.name': 'MINDSET 인증',
  'briefing.stage1.mission': '2026년에 맞는 PM의 Mindset을 검증하라.',
  'briefing.stage2.name': 'PERFORMANCE DOMAIN 검증',
  'briefing.stage2.mission': '복잡한 프로젝트 환경에서 올바른 판단과 의사결정 역량을 검증하라.',
  'briefing.stage3.name': 'AI USE CASE 검증',
  'briefing.stage3.mission': 'AI 시대의 PM 판단력을 검증하라.',

  // SCR-009 Answer Confirmation (제출 확인)
  'confirm.title': '선택한 판단을 제출하시겠습니까?',
  'confirm.msg': '제출 후에는 수정할 수 없습니다.',
  'confirm.cancel': '다시 검토',
  'confirm.submit': '최종 제출',

  // SCR-012 Stage Result
  'result.title': 'MISSION COMPLETE',
  'result.sub': 'Stage 검증이 완료되었습니다.',
  'result.solved': '해결 사건',
  'result.score': 'Stage 점수',
  'result.rate': '정답률',
  'result.reward': '보상 확인',

  // SCR-013 Item Acquisition
  'item.acquire': '아이템 획득',
  'item.equip': '아이템 장착',
  'item.next': 'Stage 2 진행',
  'item.stage1.rarity': 'RARE ITEM',
  'item.stage1.name': '갑질 미러 방패',
  'item.stage1.desc': '무분별한 내·외부 고객 요구를 올바른 Change Control로 반사하는 방패. Final Raid에서 빌런의 공격을 반사한다.',
  'item.stage1.congrats': '축하합니다. 프로젝트 중 발생하는 무분별한 내·외부 고객 요구에 대응할 수 있는 ‘갑질 미러 방패’를 획득했습니다.'
}

// 영문(en) — TODO(i18n): ko와 같은 키로 영문 값을 채우면 en 로케일에서 사용된다.
// 비어 있는 키는 lib/copy.js가 자동으로 ko로 폴백한다.
const EN = {
  // 'entry.title': 'PM Protection Bureau',
  // 'entry.enter': 'Enter the Bureau',
  // ...
}

export const COPY = { ko: KO, en: EN }
