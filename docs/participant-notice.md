# 참가자 안내 메일 (예선 2라운드)

작성 2026-08-06. **실제 구현 동작을 근거로 쓴 초안**이므로, 게임 사양을 바꾸면 여기도 같이 고친다.
근거가 되는 구현 지점을 각 항목에 적어 두었다.

| 안내 내용 | 구현 근거 |
|---|---|
| 음성 단서 7사건 | `src/js/data/cases.js` — #002·#003·#004·#007·#009·#011·#014 |
| 음소거 설정이 게임 내내 유지 | `src/js/lib/audio-settings.js` (localStorage) |
| 전체화면이 아니면 사건이 가려짐 | `src/components/game/capture-guard.js` 전체화면 게이트 |
| 복사·우클릭·캡처 차단, 워터마크 | 같은 파일 |
| 팀당 1기기 · 팀원 3명 이메일 등록 | `CLAUDE.md §10`, `src/js/lib/entries.js` |
| 제한 시간 80분 | `games.duration_minutes` (0010) |
| 제출 후 수정 불가 | `answers` 의 `unique(team_id, case_id)` + 클라이언트 가드 |
| 복수 선택 사건 · 부분 점수 없음 | 사건 #005 (`multi: true, selectCount: 3`) |
| 새로고침하면 복구 | `CLAUDE.md §2`, `resolveStep()` |
| 끊겨도 사건 풀이는 가능, 제출만 실패 | `src/js/screens/gameplay/case.js:220-237` — 실패 시 선택 유지 + 버튼 복구 |
| 끊긴 채 새로고침하면 연결 실패 화면 | `src/main.js:35-45` `showBootError()` |
| 끊긴 동안에도 타이머 진행 | `src/js/lib/game-server.js:168-179` — `ends_at` 는 서버 절대 시각 |
| 연결 표시(`SYNC`/`OFFLINE`) | `src/components/shell/app-header.js:36-42` |
| 원격 팀 화면 공유 가능 (전체화면은 잠금이 아님) | `src/components/game/capture-guard.js:83-88` · `docs/operation-checklist.md §8.9` |
| 다른 팀원이 접속하면 대표 기기가 끊김 | `claim_team`/`verify_and_transfer` (`0001_init.sql:203-206`) |
| 단서 이미지 클릭 확대 | `src/components/game/evidence-viewer.js` |
| 국문/영문 선택 | 입장 화면 · `?lang=en` |

---

## 국문

> **제목: [PMC 2026 예선 2R] PM보호국 수사 참가 전 필수 확인 사항**
>
> 안녕하십니까. PM보호국입니다.
>
> 예선 2라운드는 **PMBOK® Guide 8판 기반 크라임씬 수사** 방식으로 진행됩니다. 원활한 참가를 위해 아래 사항을 **행사 시작 전에** 반드시 확인해 주십시오.
>
> **1. 소리 설정 — 가장 중요합니다**
> 총 15개 사건 중 **7개 사건이 음성 단서(녹취·인터뷰·브리핑)** 로 제공됩니다. 음성을 듣지 못하면 판단 근거 자체가 없습니다.
> - **이어폰 또는 스피커를 반드시 준비**해 주십시오. 팀원이 함께 들어야 하므로 스피커를 권장합니다.
> - 기기 볼륨과 브라우저 탭 음소거를 미리 확인해 주십시오.
> - 입장 화면에서 음향 사용 여부를 선택하며, 이후 화면 우측 상단에서 볼륨·음소거를 조절할 수 있습니다. **이 설정은 게임 내내 유지**됩니다.
> - 음성 단서는 재생·일시정지·되감기가 가능하여 **여러 번 들을 수 있습니다**. 다만 자막(녹취록)은 제공되지 않으므로 조용한 환경에서 참여해 주십시오.
>
> **2. 전체화면 유지**
> 사건 화면은 **전체화면일 때만 표시**됩니다. 시작 시 나타나는 [전체화면으로 입장] 버튼을 눌러 주시고, 진행 중 전체화면을 벗어나면 화면이 가려지므로 다시 진입해야 합니다.
> - 화면 캡처, 복사, 우클릭, 텍스트 선택은 차단됩니다.
> - 사건 자료 외부 유출 방지를 위해 팀명·시각 워터마크가 표시됩니다.
>
> **3. 기기와 팀 등록 — 팀당 1대**
> - **한 팀은 한 대의 기기로만 참여**합니다. 팀 대표 기기를 미리 정해 주십시오.
> - 입장 시 **팀 선택 + 팀원 3명 전원의 이메일 등록**이 필요합니다. 별도 비밀번호는 없습니다.
> - 등록한 기기가 해당 팀을 점유합니다. 부득이하게 기기를 변경할 경우, **등록된 이메일 중 하나를 입력**하면 인계됩니다.
> - **팀을 잘못 선택하면 시작 후 정정이 어렵습니다.** 소속 팀을 미리 확인해 주십시오.
>
> **4. 제한 시간과 제출**
> - 총 제한 시간은 **80분**이며, 화면 상단에 남은 시간이 표시됩니다.
> - **한 번 제출한 판단은 수정할 수 없습니다.** 제출 전 확인 창이 한 번 더 표시되니 신중히 결정해 주십시오.
> - 일부 사건은 **여러 개를 선택해야 하는 문제**입니다. 지정된 개수를 모두 선택해야 제출할 수 있으며, **부분 점수는 없습니다.**
> - 이전 사건이나 이전 단계로 되돌아갈 수 없습니다.
> - 종료 시각 이후에는 제출이 차단됩니다.
>
> **5. 접속 환경**
> - **Chrome 또는 Edge 최신 버전**을 사용해 주십시오.
> - 오프닝 영상은 YouTube로 재생됩니다.
> - 노트북 기준 화면이 잘리지 않도록 브라우저 확대/축소는 100%로 맞춰 주십시오.
>
> **5-1. 네트워크가 끊겼을 때 — 새로고침이 먼저가 아닙니다**
> - 화면 상단 **남은 시간 옆의 연결 표시**가 평소 `SYSTEM ONLINE`에서 `SYNC` 또는 `OFFLINE`으로 바뀌면 서버 연결이 불안정한 것입니다. **자동으로 재연결을 시도하니 그대로 두십시오.**
> - 이때도 **사건을 읽고 보기를 선택하는 것은 그대로 가능합니다.** 팀 논의를 계속하셔도 됩니다.
> - 제출이 실패하면 안내가 표시됩니다. **선택하신 보기는 그대로 남아 있으니**, 연결이 돌아온 뒤 [판단 제출]을 다시 눌러 주십시오. **다시 고르실 필요 없습니다.**
> - **연결이 끊긴 상태에서는 새로고침하지 마십시오.** 서버 연결 화면에서 멈추게 됩니다.
> - 연결이 정상으로 돌아온 뒤에도 화면이 이상하면 그때 새로고침해 주십시오. **진행 상황은 서버에 저장되어 있어 유실되지 않습니다.**
> - ⚠️ **끊긴 동안에도 남은 시간은 계속 줄어듭니다.** 몇 분 이상 복구되지 않으면 즉시 운영진에게 알려 주십시오.
>
> **6. 진행 방식 참고**
> - 단서 이미지는 클릭하면 **확대**해서 볼 수 있습니다.
> - 사건 자료 일부는 영문으로 제작되어 있습니다. 화면 언어는 입장 시 **국문/영문 중 선택**할 수 있습니다.
> - 감독관의 시작 신호 전까지는 대기 화면이 유지됩니다. **정상 상태이므로 새로고침하지 않아도 됩니다.**
>
> **7. 팀원이 서로 다른 근무지에 있는 경우 — 화면 공유로 참여 가능합니다**
>
> 온라인 회의(Webex, Teams, Zoom 등)로 모여 **한 명이 화면을 공유하고 함께 논의**하는 방식으로 참여하실 수 있습니다. 사용하시는 회의 도구에는 제한이 없습니다.
> 사건 화면이 전체화면으로 진행되지만, 이는 화면을 잠그는 기능이 아니라 전체화면을 벗어나면 내용을 잠시 가리는 방식이므로 **화면 공유를 막지 않습니다.**
>
> 아래 네 가지만 지켜 주십시오.
>
> **① 대표 기기 1대를 정하고, 나머지 팀원은 접속하지 마십시오 — 가장 중요합니다**
> 한 팀은 한 대의 기기로만 참여합니다. 다른 팀원이 각자 기기에서 접속하면 **진행 중이던 대표 기기의 연결이 끊기고 조작이 불가능해집니다.**
> 대표 기기 한 대에서만 팀 등록·조작을 하시고, 나머지 팀원은 **공유된 화면만 보며 논의**해 주십시오.
>
> **② 화면 공유 시 "컴퓨터 소리 포함"을 반드시 켜 주십시오**
> 15개 사건 중 **7개가 음성 단서(녹취·인터뷰·브리핑)** 입니다. 이 옵션을 켜지 않으면 대표 기기에서만 소리가 나고 **나머지 팀원은 녹취를 들을 수 없습니다.**
> - Teams: 화면 공유 창의 **[컴퓨터 소리 포함]** 체크
> - Webex: 공유 시 **[컴퓨터 오디오 공유]** 체크
> - Zoom: **[소리 공유]** 체크
>
> **③ 개별 창이 아니라 "화면 전체(데스크톱)"를 공유해 주십시오**
> 화면 공유를 누르면 무엇을 공유할지 고르는 화면이 나옵니다. 여기서 **"Chrome" 같은 개별 창(Window)을 선택하지 마시고, 모니터 화면 전체를 선택**해 주십시오.
> 창 단위로 공유하면 전체화면으로 전환되는 순간 **상대방 화면이 검게 보이거나 멈출 수 있습니다.**
>
> **④ 순서: 화면 공유를 먼저 시작한 뒤, 전체화면으로 입장하십시오**
> 반대 순서로 하시면 회의 도구를 조작하기 위해 전체화면을 벗어나야 합니다.
> 진행 중 전체화면이 해제되면 [전체화면으로 돌아가기]를 한 번 누르시면 되며, **진행 상황은 서버에 저장되어 유실되지 않습니다.**
>
> 참고 · 공유 화면에 **팀명과 시각 워터마크**가 함께 표시됩니다. 자료 유출 방지를 위한 것으로 정상 동작이니 참고해 주십시오.
> 참고 · 원격 참여는 인터넷 회선이 여러 개 관여합니다. 연결이 끊긴 경우 **5-1 항목**을 따라 주시고, 끊긴 팀원이 관전자라면 게임 진행에는 영향이 없습니다.
>
> 준비되셨다면 수사관 여러분의 활약을 기대하겠습니다.
>
> PM보호국

---

## English

> **Subject: [PMC 2026 Preliminary Round 2] Required Checklist Before You Join the Investigation**
>
> Dear Agents,
>
> Preliminary Round 2 runs as a **crime-scene investigation based on the PMBOK® Guide 8th Edition**. Please review the following **before the event begins** so nothing gets in the way of your investigation.
>
> **1. Sound setup — the most important item**
> **7 of the 15 cases rely on audio evidence** (recordings, interviews, briefings). Without audio you have no basis for judgment.
> - **Bring earphones or a speaker.** A speaker is recommended, since your whole team needs to listen together.
> - Check your device volume and make sure the browser tab is not muted.
> - You will choose whether to enable sound on the entry screen, and can adjust volume or mute from the top right of the screen afterwards. **This setting is kept for the whole game.**
> - Audio evidence can be played, paused and replayed, so you **may listen as many times as you need**. Note that no transcript is provided, so please join from a quiet environment.
>
> **2. Stay in full screen**
> Case screens are **only visible in full screen**. Press [Enter Full Screen] when it appears; if you leave full screen during play, the screen will be covered and you must re-enter.
> - Screen capture, copying, right-click and text selection are blocked.
> - A watermark with your team name and the time is displayed to prevent case material from leaking.
>
> **3. Devices and team registration — one device per team**
> - **Each team plays on exactly one device.** Please decide your team's device in advance.
> - To enter, **select your team and register the email addresses of all three members**. There is no separate password.
> - The device you register holds your team. If you must switch devices, **enter one of the registered email addresses** to hand over.
> - **Selecting the wrong team is difficult to correct once the game starts.** Please confirm your team beforehand.
>
> **4. Time limit and submissions**
> - The total time limit is **80 minutes**, with the remaining time shown at the top of the screen.
> - **A submitted judgment cannot be changed.** A confirmation dialog appears before submission, so please decide carefully.
> - Some cases require you to **select more than one option**. You must select exactly the number specified, and **there is no partial credit**.
> - You cannot go back to a previous case or a previous stage.
> - Submissions are blocked after the end time.
>
> **5. Access environment**
> - Please use the **latest version of Chrome or Edge**.
> - The opening video plays via YouTube.
> - Set browser zoom to 100% so that content is not cut off on a laptop screen.
>
> **5-1. If your network drops — do not refresh first**
> - If the connection indicator **next to the remaining time at the top of the screen** changes from `SYSTEM ONLINE` to `SYNC` or `OFFLINE`, your connection is unstable. **Leave it alone — it reconnects automatically.**
> - You can still **read the case and select your answer** during this time. Feel free to keep discussing.
> - If a submission fails, a notice appears. **Your selection is preserved** — once the connection returns, just press [Submit Judgment] again. **You do not need to re-select.**
> - **Do not refresh while disconnected.** You will be stuck on the server connection screen.
> - If the screen still looks wrong after the connection recovers, refresh then. **Your progress is saved on the server and will not be lost.**
> - ⚠️ **The remaining time keeps counting down while you are disconnected.** If it does not recover within a few minutes, notify the staff immediately.
>
> **6. How it plays**
> - Click a piece of evidence to **enlarge** it.
> - Some case material is provided in English. You can choose **Korean or English** for the interface when you enter.
> - The waiting screen stays until the auditor starts the game. **This is normal — you do not need to refresh.**
>
> **7. If your teammates work at different sites — screen sharing is supported**
>
> You may join by meeting online (Webex, Teams, Zoom, etc.) with **one member sharing their screen while the team discusses together**. Any meeting tool is fine.
> Case screens run in full screen, but this does not lock your screen — it simply hides the case content if you leave full screen, so it **does not block screen sharing.**
>
> Please observe the following four points.
>
> **① Designate one device, and have everyone else stay off the site — this matters most**
> Each team plays on exactly one device. If another member connects from their own device, **the device already in play loses its connection and can no longer be operated.**
> Register and play from a single device, and have the other members **watch the shared screen and discuss.**
>
> **② Turn on "include computer sound" when you share**
> **7 of the 15 cases rely on audio evidence** (recordings, interviews, briefings). Without this option, only the sharing device has sound and **the rest of the team cannot hear the evidence.**
> - Teams: check **[Include computer sound]**
> - Webex: check **[Share computer audio]**
> - Zoom: check **[Share sound]**
>
> **③ Share your whole screen (desktop), not a single window**
> When you start sharing you will be asked what to share. **Do not pick an individual window such as "Chrome" — pick the entire monitor.**
> Window-level sharing can turn the viewers' screen black or freeze it the moment the browser goes full screen.
>
> **④ Order: start sharing first, then enter full screen**
> Doing it the other way round forces you to leave full screen to operate the meeting tool.
> If full screen is released during play, just press [Return to Full Screen] once. **Your progress is saved on the server and will not be lost.**
>
> Note · A watermark with your team name and the time appears on the shared screen. This is intended to prevent case material from leaking and is normal.
> Note · Remote play involves several internet connections. If you get disconnected, follow item **5-1**. If the member who dropped is only watching, gameplay is unaffected.
>
> We look forward to seeing you in action, Agents.
>
> PM Protection Bureau
