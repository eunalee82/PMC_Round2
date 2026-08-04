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
  'opening.soundOn': '소리 켜기',
  'opening.soundOff': '음소거',

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
  'item.stage1.congrats': '축하합니다. 프로젝트 중 발생하는 무분별한 내·외부 고객 요구에 대응할 수 있는 ‘갑질 미러 방패’를 획득했습니다.',
  'item.stage1.effect': '빌런의 공격 반사',
  'item.stage2.rarity': 'EPIC ITEM',
  'item.stage2.name': '리소스 무제한 승인서',
  'item.stage2.desc': '필요한 자원을 제약 없이 투입할 수 있도록 승인된 문서. Final Raid에서 궁극기를 사용할 수 있게 한다.',
  'item.stage2.congrats': '축하합니다. 성과 영역을 통합 관리해 필요한 자원을 확보하는 ‘리소스 무제한 승인서’를 획득했습니다.',
  'item.stage2.effect': '궁극기 사용 가능',
  'item.stage3.rarity': 'LEGENDARY ITEM',
  'item.stage3.name': 'AI Judgment Core',
  'item.stage3.desc': 'AI의 출력을 비판적으로 검증하는 판단 코어. AI가 만들어내는 환상을 간파하고 빌런왕의 최종 패턴을 무력화한다.',
  'item.stage3.congrats': '축하합니다. AI 시대의 판단력을 증명하는 ‘AI Judgment Core’를 획득했습니다.',
  'item.stage3.effect': 'AI 환상 간파 · 빌런왕 최종 패턴 무력화',
  'item.effectLabel': '효과',
  'item.appoint': '감독관 임명으로',

  // 캡처 가드 (게임플레이 오버레이)
  'guard.gateTitle': '전체화면에서 사건을 조사합니다',
  'guard.gateMsg': '캡처 방지를 위해 전체화면으로 진행됩니다. 전체화면을 벗어나면 사건 내용이 가려집니다.',
  'guard.gateEnter': '전체화면으로 조사 시작',
  'guard.gateReturn': '전체화면으로 돌아가기',
  'guard.captureWarn': '화면 캡처가 감지되었습니다 — 캡처·유출은 실격 사유입니다.',

  // EvidenceViewer / 사이드바 / 소리
  'evidence.zoom': '확대',
  'evidence.close': '닫기',
  'evidence.recording': '녹취',
  'evidence.loadFail': '단서 이미지를 불러오지 못했습니다.',
  'agent.rankRookie': '신입 수사관',
  'sidebar.points': '점',
  'audio.control': '소리 조절',
  'audio.mute': '음소거',
  'audio.unmute': '음소거 해제',
  'audio.volume': '볼륨',
  'entry.sound': '음향',
  'entry.muted': '음소거',
  'entry.fullscreen': '전체 화면'
}

// 영문(en) — ko와 같은 키. 비어 있는 키는 lib/copy.js가 자동으로 ko로 폴백한다.
const OATH_TEXT_EN = `As a rookie agent of the PM Protection Bureau,
I place the project's Value above all in my judgment,
and upon finding distorted execution or a wrong decision,
I pledge to investigate the case fairly
in accordance with the principles of PMBOK® 8th Edition.`

const EN = {
  // SCR-001 Entry
  'entry.brandline': 'LG SW PM COMPETITION 2026',
  'entry.eyebrow': 'PROJECT MANAGEMENT PROTECTION BUREAU',
  'entry.title': 'PM Protection Bureau',
  'entry.subtitle': 'A PMBOK® 8th Edition crime-scene game that verifies PM competency',
  'entry.alert': 'URGENT CASE INTAKE — Supervisor Qualification Exam · 15 cases',
  'entry.enter': 'Enter the Bureau',
  'entry.foot': 'PMB-OS · CLASSIFIED',

  // SCR-002 Opening
  'opening.skip': 'Skip',
  'opening.briefingStamp': 'PMB BRIEFING',
  'opening.briefing1': 'Modern projects fail not from technology, but from wrong judgment.',
  'opening.briefing2': 'The Bureau calls the force behind that failure the "Villain".',
  'opening.briefing3': 'Rookie agent, resolve the 15 cases and protect the value of the project.',
  'opening.fallbackRetry': 'Replay',
  'opening.fallbackProceed': 'To team selection',
  'opening.soundOn': 'Sound on',
  'opening.soundOff': 'Mute',

  // SCR-003 Team Selection
  'team.step': 'STEP 01 · Agent Registration',
  'team.title': 'Select your team',
  'team.lead': 'Select your team and register 3 agents to begin case intake.',
  'team.start': 'Begin Case Intake',

  'team.register.hint': 'Enter all three teammates\' email addresses. Registered emails verify your team on reconnect.',
  'team.register.submit': 'Enter',
  'team.register.cancel': 'Cancel',
  'team.register.errEmpty': 'All three agent emails are required to enter.',
  'team.register.errDuplicate': 'Duplicate email entered. The three teammates must be different.',
  'team.register.warnSuspect': 'Please check the email format. You can still enter, but it will be flagged for staff review.',
  'team.registered': 'Registered Agents',
  'team.registeredEdit': 'Edit',

  'team.claimed.title': 'This team is already taken',
  'team.claimed.hint': 'If this is your team, enter one of the registered agent emails.',
  'team.claimed.placeholder': 'Registered agent email',
  'team.claimed.submit': 'Continue Entry',
  'team.claimed.cancel': 'Choose Another Team',
  'team.claimed.err': 'Unregistered email. Please check your team again.',
  'team.released.title': 'Entry Released',
  'team.released.msg': 'Staff released this team\'s entry, or another device took it over. Please select your team again.',
  'team.released.confirm': 'OK',

  // SCR-004 Oath
  'oath.step': 'STEP 02 · Confidentiality Oath',
  'oath.title': 'PM Protection Bureau · Confidentiality Oath',
  'oath.text': OATH_TEXT_EN,
  'oath.agents': 'Registered Agents',
  'oath.fieldLabel': 'Signature',
  'oath.agree': 'I agree to the oath above and will faithfully carry out my duty as an agent.',
  'oath.submit': 'Complete Oath',

  // SCR-005 Waiting Room
  'waiting.eyebrow': 'WAITING ROOM',
  'waiting.title': 'Agent registration complete',
  'waiting.msg': 'Await the Bureau\'s deployment order.',
  'waiting.startTime': 'Awaiting admin start',
  'waiting.mission1': 'Stage 1 · Mindset',
  'waiting.mission2': 'Stage 2 · Performance Domain',
  'waiting.mission3': 'Stage 3 · AI Use Case',
  'waiting.pulse': 'Awaiting deployment order…',

  // Gameplay · Case
  'case.fileLabel': 'CASE FILE',
  'case.briefLabel': 'CASE BRIEF',
  'case.evidenceLabel': 'Evidence',
  'case.selectHint': 'Select one clue, then submit your judgment.',
  'case.submit': 'Submit Judgment',
  'case.resolved': 'CASE RESOLVED',
  'case.resolvedKo': 'Case Resolved',
  'case.incorrect': 'ADDITIONAL INVESTIGATION REQUIRED',
  'case.incorrectKo': 'Additional Investigation Required',
  'case.analysisTitle': 'Case Analysis Report',
  'case.next': 'Investigate Next Case',
  'case.nextLast': 'View Stage Result',
  'case.noAnalysis': 'The analysis report is not ready yet.',

  // SCR-007 Stage Briefing
  'briefing.label': 'MISSION BRIEFING',
  'briefing.domain': 'Domain',
  'briefing.cases': 'Cases',
  'briefing.reward': 'Reward Item',
  'briefing.start': 'Start Mission',
  'briefing.pending': 'Cases Coming Soon',
  'briefing.stage1.name': 'MINDSET Certification',
  'briefing.stage1.mission': 'Verify the PM Mindset fit for 2026.',
  'briefing.stage2.name': 'PERFORMANCE DOMAIN Verification',
  'briefing.stage2.mission': 'Verify sound judgment and decision-making in complex project environments.',
  'briefing.stage3.name': 'AI USE CASE Verification',
  'briefing.stage3.mission': 'Verify PM judgment in the age of AI.',

  // SCR-009 Answer Confirmation
  'confirm.title': 'Submit your selected judgment?',
  'confirm.msg': 'You cannot change it after submitting.',
  'confirm.cancel': 'Review Again',
  'confirm.submit': 'Final Submit',

  // SCR-012 Stage Result
  'result.title': 'MISSION COMPLETE',
  'result.sub': 'Stage verification complete.',
  'result.solved': 'Cases Solved',
  'result.score': 'Stage Score',
  'result.rate': 'Accuracy',
  'result.reward': 'Claim Reward',

  // SCR-013 Item Acquisition
  'item.acquire': 'Item Acquired',
  'item.equip': 'Equip Item',
  'item.next': 'Proceed to Stage 2',
  'item.stage1.rarity': 'RARE ITEM',
  'item.stage1.name': 'Gapjil Mirror Shield',
  'item.stage1.desc': 'A shield that reflects unreasonable internal/external client demands through proper Change Control. It reflects the Villain\'s attacks in the Final Raid.',
  'item.stage1.congrats': 'Congratulations. You have acquired the "Gapjil Mirror Shield", which lets you counter the unreasonable internal and external client demands that arise during a project.',
  'item.stage1.effect': 'Reflects the Villain\'s attacks',
  'item.stage2.rarity': 'EPIC ITEM',
  'item.stage2.name': 'Unlimited Resource Approval',
  'item.stage2.desc': 'A document approving the resources you need without constraint. It unlocks your ultimate move in the Final Raid.',
  'item.stage2.congrats': 'Congratulations. You have acquired the "Unlimited Resource Approval", earned by managing the performance domains as one.',
  'item.stage2.effect': 'Ultimate move unlocked',
  'item.stage3.rarity': 'LEGENDARY ITEM',
  'item.stage3.name': 'AI Judgment Core',
  'item.stage3.desc': 'A judgment core that critically verifies AI output. It sees through the illusions the AI creates and neutralizes the Villain King\'s final pattern.',
  'item.stage3.congrats': 'Congratulations. You have acquired the "AI Judgment Core", proof of judgment in the age of AI.',
  'item.stage3.effect': 'Sees through AI illusions · neutralizes the Villain King\'s final pattern',
  'item.effectLabel': 'EFFECT',
  'item.appoint': 'To the appointment',

  // Capture guard
  'guard.gateTitle': 'Investigate cases in full screen',
  'guard.gateMsg': 'The case runs in full screen to prevent capture. If you leave full screen, the case content is hidden.',
  'guard.gateEnter': 'Start Investigation in Full Screen',
  'guard.gateReturn': 'Return to Full Screen',
  'guard.captureWarn': 'Screen capture detected — capturing or leaking is grounds for disqualification.',

  // EvidenceViewer / Sidebar / Audio
  'evidence.zoom': 'Zoom',
  'evidence.close': 'Close',
  'evidence.recording': 'Recording',
  'evidence.loadFail': 'Failed to load the clue image.',
  'agent.rankRookie': 'Rookie Agent',
  'sidebar.points': 'pts',
  'audio.control': 'Sound',
  'audio.mute': 'Mute',
  'audio.unmute': 'Unmute',
  'audio.volume': 'Volume',
  'entry.sound': 'Sound',
  'entry.muted': 'Muted',
  'entry.fullscreen': 'Full Screen'
}

export const COPY = { ko: KO, en: EN }
