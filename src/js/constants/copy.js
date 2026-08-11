// UI copy registry — 로케일별 문자열(키 기반). 화면은 lib/copy.js `t(key)` / `copyEl(...)`로 렌더.
// 구조: COPY[locale][key]. en에 없는 키는 자동으로 ko로 폴백된다(lib/copy.js).
// ▶ 영문 지원: 아래 en 객체에 ko와 '같은 키'로 영문 값을 채우면 en 로케일에서 사용된다.
//   지금은 콘텐츠 미제작 단계라 en은 비어 있고 전부 ko로 폴백된다. DEV 편집은 현재 로케일에만 적용.
// Keep keys stable; edit values freely.

const OATH_TEXT_KO = `본인은 PM보호국 신입 감독관으로서
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
  // 첫 화면(SCR-001)이 언어 선택 지점이라, 팀을 점유하기 전까지는 되돌아올 길을 남겨 둔다
  // (운영 요청 2026-08-10 — 언어를 잘못 고른 팀이 처음으로 못 돌아가던 문제).
  'common.backToStart': '첫 화면으로 돌아가기',

  // SCR-002 Opening
  'opening.skip': '건너뛰기',
  // Edge에서 영상이 재생되는 동안 아래쪽 진행 버튼을 못 찾는 팀이 있어 상단에 길을 적어 둔다
  // (운영 요청 2026-08-10).
  'opening.guide': '영상 시청이 끝나면 화면 아래쪽 [팀 선택으로] 버튼을 눌러 다음 단계로 이동하십시오.',
  'opening.briefingStamp': 'PMB 브리핑',
  'opening.briefing1': '현대의 프로젝트는 기술이 아니라 잘못된 판단으로 실패한다.',
  'opening.briefing2': '그 실패를 만드는 존재를 PM보호국은 "빌런"이라 부른다.',
  'opening.briefing3': '신입 감독관이여, 15개의 사건을 해결하고 프로젝트의 가치를 지켜라.',
  'opening.fallbackRetry': '다시 재생',
  'opening.fallbackProceed': '팀 선택으로',
  'opening.soundOn': '소리 켜기',
  'opening.soundOff': '음소거',

  // SCR-003 Team Selection
  'team.step': 'STEP 01 · 신입 감독관 등록',
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
  // 팀 오선택 되돌리기(운영 요청 2026-08-10) — 점유를 풀어 다른 팀을 고를 수 있게 한다.
  'team.cancel': '팀 선택 취소',
  'team.cancel.title': '팀 선택을 취소하시겠습니까?',
  'team.cancel.msg': '이 팀의 입장이 해제되고 등록한 수사관 3명의 이메일도 지워집니다. 다른 팀을 다시 선택해 등록해야 합니다.',
  'team.cancel.confirm': '선택 취소',
  'team.cancel.keep': '그대로 두기',
  'team.cancel.err': '입장 해제에 실패했습니다. 네트워크를 확인한 뒤 다시 시도하거나 운영진에게 알려 주십시오.',

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
  'oath.agree': '위 서약 내용에 동의하며, 감독관으로서 성실히 임무를 수행하겠습니다.',
  'oath.submit': '서약 완료',
  'oath.back': '팀 선택으로 돌아가기',
  // 관리자 게임 종료 시 참가자 안내 팝업 → 마지막 화면(종료 안내)으로 이동
  'gameEnded.title': '게임이 종료되었습니다',
  'gameEnded.msg': '감독관이 게임을 종료했습니다. 마지막 화면으로 이동합니다.',
  'gameEnded.confirm': '마지막 화면으로',
  // 제한 시간 종료(타임오버) — 관리자 종료와 같은 처리지만 원인이 달라 문구를 분리한다
  // (운영 요청 2026-08-10).
  'timeUp.title': '예선 2라운드가 종료되었습니다',
  'timeUp.msg': '제한 시간이 모두 지났습니다. [확인]을 누르면 마지막 화면으로 이동합니다.',
  'timeUp.confirm': '확인',

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
  // 복수 정답 사건(사건 #005) — {n}은 골라야 하는 개수로 치환된다.
  'case.selectHintMulti': '증거물 {n}개를 선택한 뒤 판단을 제출하십시오.',
  'case.submit': '판단 제출',
  'case.submitted': '판단 제출 완료', // 제출 후 비활성 상태 라벨
  'case.resolved': 'CASE RESOLVED',
  'case.resolvedKo': '사건 해결',
  'case.incorrect': 'ADDITIONAL INVESTIGATION REQUIRED',
  'case.incorrectKo': '추가 조사 필요',
  'case.analysisTitle': '사건 분석 보고서',
  'case.next': '다음 사건 조사',
  'case.nextLast': 'Stage 결과 보기',
  'case.noAnalysis': '분석 보고서가 아직 준비되지 않았습니다.',
  // 사건 본문을 서버에서 받아오는 동안/실패 시 (보안: 본문은 번들에 없다)
  'case.loading': '사건 파일을 여는 중…',
  'case.loadFail': '사건 파일을 불러오지 못했습니다. 잠시 후 다시 시도하십시오.',
  'case.retry': '다시 시도',
  // 제출 실패 안내 (서버 판정 — docs/supabase-minimum-design.md §9.1)
  'submitFail.already_submitted': '이미 제출된 사건입니다',
  'submitFail.game_ended': '게임이 종료되어 제출할 수 없습니다',
  'submitFail.game_not_started': '아직 게임이 시작되지 않았습니다',
  'submitFail.not_owner': '팀 인증이 만료되었습니다',
  'submitFail.unknown_case': '사건 정보를 찾을 수 없습니다',
  'submitFail.error': '제출에 실패했습니다',
  'submitFail.hint': '네트워크를 확인한 뒤 다시 시도하거나, 운영진 안내를 기다려 주십시오.',

  // 임시(Mock) 사건 표시 — 데이터에 placeholder: true 인 사건에만 붙는다 (Stage 2 콘텐츠 확정 시 자동 소멸).
  'case.temp': '임시 데이터',
  'case.tempHint': '확정 전 임시 사건입니다. 최종 콘텐츠로 교체될 예정입니다.',

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
  'item.nextStage3': 'Stage 3 진행',
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
  // Stage 3 보상은 아이템이 아니라 스킬이다 — docs/game-flow.md §10.3 / screen-list.md SCR-013.
  'item.stage3.rarity': 'LEGEND SKILL',
  'item.stage3.name': '배째 마스터',
  'item.stage3.desc': 'AI의 출력을 비판적으로 검증하고 불필요한 요구를 과감하게 되돌려보내는 최고 수준의 PM 스킬. Final Raid에서 빌런왕에게 최종 강력 스킬로 발동한다.',
  'item.stage3.congrats': '축하합니다. 프로젝트 중 발생하는 불필요한 요구에 과감하게 대응할 수 있는 최고 수준의 PM 스킬 ‘배째 마스터’를 획득했습니다.',
  'item.stage3.effect': '최종 강력 스킬 발동',
  'item.effectLabel': '효과',
  'item.appoint': '감독관 임명으로',

  // SCR-015 Officer Appointment (감독관 임명)
  'appoint.eyebrow': 'PM보호국 인사명령 · APPOINTMENT',
  'appoint.title': 'PM보호국 감독관 임명',
  'appoint.bossLabel': 'PM보호국 국장',
  'appoint.message': '감독관 여러분,\n\n모든 자격 검증 Mission을 통과했습니다.\n\n지금부터 여러분을\nPM보호국 정식 감독관으로 임명합니다.',
  'appoint.stagesLabel': '자격 검증 결과',
  'appoint.itemsLabel': '확보 장비',
  'appoint.rankFrom': '신입 감독관',
  'appoint.rankTo': '정식 감독관',
  'appoint.badgeCaption': '임시 배지 — 금배지는 최종 임무 완수 후 수여됩니다.',
  'appoint.accept': '임명 수락',

  // SCR-016 Emergency Alert (긴급 경보)
  'alert.tag': 'PM보호국 긴급 알림',
  'alert.title': '빌런왕이 출현했습니다',
  'alert.sub': '모든 패널이 비상 모드로 전환되었습니다. 획득한 장비가 자동 장착됩니다.',
  'alert.locationKey': '위치',
  'alert.locationVal': 'Final Release Gate',
  'alert.dangerKey': '위험도',
  'alert.dangerVal': 'FINAL',
  'alert.survivalKey': '생존율',
  'alert.survivalVal': '20%',
  'alert.confirm': '긴급 상황 확인',

  // SCR-017 Final Raid Ready (레이드 준비)
  'raid.readyEyebrow': 'FINAL RAID · 출동 준비',
  'raid.readyTitle': '모든 장비가 활성화되었습니다',
  'raid.readyMsg': '20초 동안 빌런왕을 공격하십시오.',
  'raid.rulesLabel': '레이드 규칙',
  'raid.rule1': '빌런왕을 반복해서 클릭하거나 터치하면 공격이 발동됩니다.',
  'raid.rule2': '획득한 세 장비가 공격 중 순서대로 자동 발동됩니다.',
  'raid.rule3': '제한 시간 20초가 지나면 최종 공격으로 빌런왕이 격퇴됩니다.',
  'raid.equipped': '장착 장비',
  'raid.start': '레이드 준비 완료',
  'raid.countdownLabel': '출동까지',

  // SCR-018 Final Raid Battle (빌런왕 레이드)
  'raid.villain': '빌런왕',
  'raid.villainSub': 'FINAL RELEASE GATE · BOSS',
  'raid.hp': '빌런왕 체력',
  'raid.time': '남은 시간',
  'raid.hits': '누적 공격',
  'raid.progress': '레이드 진행률',
  'raid.attack': '공격',
  'raid.attackHint': '빌런왕을 연타하십시오',
  'raid.skillFired': '발동',

  // SCR-019 Villain Defeated (빌런왕 격퇴)
  'defeat.tag': 'FINAL MISSION COMPLETE',
  'defeat.title': '빌런왕 격퇴 성공',
  'defeat.sub': '프로젝트의 가치를 위협하던 최종 빌런이 무력화되었습니다.',
  'defeat.damage': '누적 데미지',
  'defeat.hits': '총 공격 횟수',
  'defeat.contribution': '팀 기여도',
  'defeat.next': '최종 임명 절차',

  // SCR-020 Gold Badge Ceremony (금배지 수여식)
  'badge.tag': 'MISSION COMPLETE',
  'badge.bureau': 'PM Protection Bureau',
  'badge.appointed': '공식 감독관 임명 완료',
  'badge.rank': '정식 감독관',
  // 참가자 흐름의 마지막 버튼 — 여기서 예선 2라운드를 마친다(최종 결과 발표는 감독관 몫).
  'badge.finish': '예선 2라운드 끝내기',

  // ※ 국장 최종 메시지(ending.bossLabel/bossMessage)는 2026-08-10 운영 결정으로 종료 안내 화면에서
  //    제거했다 — 마지막 화면은 본선 안내와 감사 인사만 남긴다(연출보다 안내가 먼저 읽혀야 한다).

  // SCR-022 Final Ranking — 관리자 콘솔(?admin) 전용 발표 화면
  'rank.eyebrow': 'FINAL RANKING',
  'rank.title': '최종 랭킹',
  'rank.sub': '전체 팀의 Investigation Score와 최종 순위입니다.',
  'rank.colRank': '순위',
  'rank.colTeam': '팀',
  'rank.colScore': '총점',
  'rank.colStages': 'STAGE 1 · 2 · 3',
  'rank.colSolved': '해결',
  'rank.colTime': '완료',
  'rank.colRaid': 'RAID',
  'rank.itemsLabel': '획득 장비',
  'rank.empty': '아직 집계된 팀이 없습니다.',

  // SCR-023 종료 안내 — 순위는 감독관이 발표하므로 참가자 화면에는 표시하지 않는다.
  // 본문은 2026-08-10 운영 확정 문구다(본선 진출은 예선 1라운드 점수와 합산 발표).
  'end.tag': 'ROUND 2 COMPLETE',
  'end.title': '예선 2라운드를 마쳤습니다',
  'end.msg': '예선 2라운드가 성공적으로 마무리되었습니다.\n\n본선 진출 결과는 예선 1라운드 점수와 함께 종합 평가하여 발표할 예정입니다.\n\n열정적으로 참여해 주신 모든 참가자 여러분께 진심으로 감사드립니다.',
  'end.rankLabel': '최종 계급',
  'end.scoreLabel': 'Investigation Score',
  // 브라우저 종료 — 스크립트로 열지 않은 탭은 window.close()가 무시되므로 안내 문구를 함께 둔다.
  'end.close': '브라우저 종료하기',
  'end.closeHint': '창이 자동으로 닫히지 않으면 이 탭을 직접 닫아 주십시오. (Ctrl+W)',

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
  'agent.rankRookie': '신입 감독관',
  'sidebar.points': '점',
  'audio.control': '소리 조절',
  'audio.mute': '음소거',
  'audio.unmute': '음소거 해제',
  'audio.volume': '볼륨',
  'entry.sound': '음향',
  'entry.muted': '음소거',
  'entry.fullscreen': '전체 화면',
  // 음향 점검(SCR-001) — 사건 단서에 녹취가 있어, 입장 전에 소리를 확인할 유일한 지점이다.
  'entry.soundTest': '음향 점검',
  'entry.soundTest.play': '테스트 음악 재생',
  'entry.soundTest.stop': '재생 중지',
  'entry.soundTest.hint': '사건 단서에 녹취 음성이 있습니다. 입장 전에 소리가 들리는지 확인하십시오.',
  'entry.soundTest.playing': '재생 중 — 소리가 들리십니까? 막대는 움직이는데 소리가 없다면 기기 볼륨과 브라우저 탭 음소거를 확인하십시오.',
  'entry.soundTest.fail': '음향을 재생할 수 없습니다. 브라우저 설정에서 이 사이트의 소리 권한을 확인하십시오.'
}

// 영문(en) — ko와 같은 키. 비어 있는 키는 lib/copy.js가 자동으로 ko로 폴백한다.
const OATH_TEXT_EN = `As a rookie supervisor of the PM Protection Bureau,
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
  'common.backToStart': 'Back to First Screen',

  // SCR-002 Opening
  'opening.skip': 'Skip',
  'opening.guide': 'When the video ends, press [To team selection] at the bottom of the screen to continue.',
  'opening.briefingStamp': 'PMB BRIEFING',
  'opening.briefing1': 'Modern projects fail not from technology, but from wrong judgment.',
  'opening.briefing2': 'The Bureau calls the force behind that failure the "Villain".',
  'opening.briefing3': 'Rookie supervisor, resolve the 15 cases and protect the value of the project.',
  'opening.fallbackRetry': 'Replay',
  'opening.fallbackProceed': 'To team selection',
  'opening.soundOn': 'Sound on',
  'opening.soundOff': 'Mute',

  // SCR-003 Team Selection
  'team.step': 'STEP 01 · Rookie Supervisor Registration',
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
  'team.cancel': 'Cancel team selection',
  'team.cancel.title': 'Cancel your team selection?',
  'team.cancel.msg': 'This team\'s entry will be released and the three registered agent emails will be cleared. You will need to select and register a team again.',
  'team.cancel.confirm': 'Cancel Selection',
  'team.cancel.keep': 'Keep It',
  'team.cancel.err': 'Could not release the entry. Check your network and try again, or notify the staff.',

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
  'oath.agree': 'I agree to the oath above and will faithfully carry out my duty as a supervisor.',
  'oath.submit': 'Complete Oath',
  'oath.back': 'Back to Team Selection',
  'gameEnded.title': 'The Game Has Ended',
  'gameEnded.msg': 'The supervisor has ended the game. Moving to the final screen.',
  'gameEnded.confirm': 'Go to Final Screen',
  'timeUp.title': 'The Round 2 qualifier has ended',
  'timeUp.msg': 'Time is up. Press [OK] to move to the final screen.',
  'timeUp.confirm': 'OK',

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
  'case.selectHintMulti': 'Select {n} pieces of evidence, then submit your judgment.',
  'case.submit': 'Submit Judgment',
  'case.submitted': 'Judgment Submitted',
  'case.resolved': 'CASE RESOLVED',
  'case.resolvedKo': 'Case Resolved',
  'case.incorrect': 'ADDITIONAL INVESTIGATION REQUIRED',
  'case.incorrectKo': 'Additional Investigation Required',
  'case.analysisTitle': 'Case Analysis Report',
  'case.next': 'Investigate Next Case',
  'case.nextLast': 'View Stage Result',
  'case.noAnalysis': 'The analysis report is not ready yet.',
  'case.loading': 'Opening the case file…',
  'case.loadFail': 'Could not load the case file. Please try again in a moment.',
  'case.retry': 'Try again',
  'submitFail.already_submitted': 'This case was already submitted',
  'submitFail.game_ended': 'The game has ended — submissions are closed',
  'submitFail.game_not_started': 'The game has not started yet',
  'submitFail.not_owner': 'Your team session has expired',
  'submitFail.unknown_case': 'Case information not found',
  'submitFail.error': 'Submission failed',
  'submitFail.hint': 'Check your network and try again, or wait for the staff announcement.',

  'case.temp': 'TEMP DATA',
  'case.tempHint': 'A temporary case pending confirmation. It will be replaced with final content.',

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
  'item.nextStage3': 'Proceed to Stage 3',
  // 아이템 영문명은 로마자 표기(Gapjil/Baejjae)를 쓰지 않는다 — 영문 참가자에게 뜻이 전달되지 않아
  // 의미를 옮긴 표현으로 교체했다(운영 결정 2026-08-10). 갑질 = 우월적 지위 남용 → overreach.
  'item.stage1.rarity': 'RARE ITEM',
  'item.stage1.name': 'Overreach Mirror Shield',
  'item.stage1.desc': 'A shield that reflects overreaching internal/external client demands through proper Change Control. It reflects the Villain\'s attacks in the Final Raid.',
  'item.stage1.congrats': 'Congratulations. You have acquired the "Overreach Mirror Shield", which lets you counter the overreaching internal and external client demands that arise during a project.',
  'item.stage1.effect': 'Reflects the Villain\'s attacks',
  'item.stage2.rarity': 'EPIC ITEM',
  'item.stage2.name': 'Unlimited Resource Approval',
  'item.stage2.desc': 'A document approving the resources you need without constraint. It unlocks your ultimate move in the Final Raid.',
  'item.stage2.congrats': 'Congratulations. You have acquired the "Unlimited Resource Approval", earned by managing the performance domains as one.',
  'item.stage2.effect': 'Ultimate move unlocked',
  // Stage 3's reward is a skill, not an item — docs/game-flow.md §10.3 / screen-list.md SCR-013.
  'item.stage3.rarity': 'LEGEND SKILL',
  // 배째(배 째라) = 부당한 요구를 단호히 거절하고 버티는 태도 → 영어 관용 표현 'the hard no'.
  'item.stage3.name': 'Master of the Hard No',
  'item.stage3.desc': 'The top-tier PM skill: verify AI output critically and turn down unnecessary demands without flinching. It fires as the final power skill against the Villain King in the Final Raid.',
  'item.stage3.congrats': 'Congratulations. You have acquired "Master of the Hard No", the top-tier PM skill for standing firm against the unnecessary demands that arise during a project.',
  'item.stage3.effect': 'Fires the final power skill',
  'item.effectLabel': 'EFFECT',
  'item.appoint': 'To the appointment',

  // SCR-015 Officer Appointment
  'appoint.eyebrow': 'BUREAU ORDER · APPOINTMENT',
  'appoint.title': 'Bureau Supervisor Appointment',
  'appoint.bossLabel': 'Director, PM Protection Bureau',
  'appoint.message': 'Supervisors,\n\nYou have passed every qualification Mission.\n\nFrom this moment you are appointed\nofficial Supervisors of the PM Protection Bureau.',
  'appoint.stagesLabel': 'Qualification Results',
  'appoint.itemsLabel': 'Secured Equipment',
  'appoint.rankFrom': 'Rookie Supervisor',
  'appoint.rankTo': 'Official Supervisor',
  'appoint.badgeCaption': 'Provisional badge — the gold badge is awarded after the final mission.',
  'appoint.accept': 'Accept Appointment',

  // SCR-016 Emergency Alert
  'alert.tag': 'BUREAU EMERGENCY ALERT',
  'alert.title': 'The Villain King has appeared',
  'alert.sub': 'All panels have switched to emergency mode. Your equipment is being auto-equipped.',
  'alert.locationKey': 'Location',
  'alert.locationVal': 'Final Release Gate',
  'alert.dangerKey': 'Threat',
  'alert.dangerVal': 'FINAL',
  'alert.survivalKey': 'Survival',
  'alert.survivalVal': '20%',
  'alert.confirm': 'Acknowledge Emergency',

  // SCR-017 Final Raid Ready
  'raid.readyEyebrow': 'FINAL RAID · DEPLOYMENT',
  'raid.readyTitle': 'All equipment is active',
  'raid.readyMsg': 'Attack the Villain King for 20 seconds.',
  'raid.rulesLabel': 'Raid Rules',
  'raid.rule1': 'Click or tap the Villain King repeatedly to attack.',
  'raid.rule2': 'Your three pieces of equipment fire automatically, in order, as you attack.',
  'raid.rule3': 'When the 20-second limit ends, a final strike defeats the Villain King.',
  'raid.equipped': 'Equipped',
  'raid.start': 'Raid Ready',
  'raid.countdownLabel': 'Deploying in',

  // SCR-018 Final Raid Battle
  'raid.villain': 'Villain King',
  'raid.villainSub': 'FINAL RELEASE GATE · BOSS',
  'raid.hp': 'Villain King HP',
  'raid.time': 'Time Left',
  'raid.hits': 'Attacks',
  'raid.progress': 'Raid Progress',
  'raid.attack': 'ATTACK',
  'raid.attackHint': 'Hit the Villain King rapidly',
  'raid.skillFired': 'FIRED',

  // SCR-019 Villain Defeated
  'defeat.tag': 'FINAL MISSION COMPLETE',
  'defeat.title': 'The Villain King is defeated',
  'defeat.sub': 'The final villain threatening the project\'s value has been neutralized.',
  'defeat.damage': 'Total Damage',
  'defeat.hits': 'Total Attacks',
  'defeat.contribution': 'Team Contribution',
  'defeat.next': 'Final Appointment',

  // SCR-020 Gold Badge Ceremony
  'badge.tag': 'MISSION COMPLETE',
  'badge.bureau': 'PM Protection Bureau',
  'badge.appointed': 'Official Supervisor appointment complete',
  'badge.rank': 'Official Supervisor',
  'badge.finish': 'Finish Round 2 Qualifier',

  // ※ The Director's final message was removed from the closing screen (2026-08-10 ops decision).

  // SCR-022 Final Ranking — admin console only
  'rank.eyebrow': 'FINAL RANKING',
  'rank.title': 'Final Ranking',
  'rank.sub': 'Investigation Score and final standing for every team.',
  'rank.colRank': 'Rank',
  'rank.colTeam': 'Team',
  'rank.colScore': 'Score',
  'rank.colStages': 'STAGE 1 · 2 · 3',
  'rank.colSolved': 'Solved',
  'rank.colTime': 'Finished',
  'rank.colRaid': 'RAID',
  'rank.itemsLabel': 'Equipment',
  'rank.empty': 'No teams have been scored yet.',

  // SCR-023 Closing notice — the standing is announced by the supervisor, so it is not shown here.
  'end.tag': 'ROUND 2 COMPLETE',
  'end.title': 'Round 2 qualifier complete',
  'end.msg': 'The Round 2 qualifier has been completed successfully.\n\nThe finals lineup will be announced after a combined evaluation with your Round 1 qualifier score.\n\nOur sincere thanks to every participant for taking part with such enthusiasm.',
  'end.rankLabel': 'Final Rank',
  'end.scoreLabel': 'Investigation Score',
  'end.close': 'Close browser',
  'end.closeHint': 'If the window does not close by itself, please close this tab directly. (Ctrl+W)',

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
  'agent.rankRookie': 'Rookie Supervisor',
  'sidebar.points': 'pts',
  'audio.control': 'Sound',
  'audio.mute': 'Mute',
  'audio.unmute': 'Unmute',
  'audio.volume': 'Volume',
  'entry.sound': 'Sound',
  'entry.muted': 'Muted',
  'entry.fullscreen': 'Full Screen',
  'entry.soundTest': 'Sound Check',
  'entry.soundTest.play': 'Play test audio',
  'entry.soundTest.stop': 'Stop',
  'entry.soundTest.hint': 'Some case evidence is audio. Confirm you can hear sound before entering.',
  'entry.soundTest.playing': 'Playing — can you hear it? If the bars move but there is no sound, check your device volume and whether the browser tab is muted.',
  'entry.soundTest.fail': 'Audio could not be played. Check this site\'s sound permission in your browser settings.'
}

export const COPY = { ko: KO, en: EN }
