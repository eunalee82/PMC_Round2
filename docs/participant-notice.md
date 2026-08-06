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
> - 네트워크가 일시적으로 끊겨도 **새로고침하면 마지막 진행 지점부터 복구**됩니다. 당황하지 마시고 새로고침해 주십시오.
>
> **6. 진행 방식 참고**
> - 단서 이미지는 클릭하면 **확대**해서 볼 수 있습니다.
> - 사건 자료 일부는 영문으로 제작되어 있습니다. 화면 언어는 입장 시 **국문/영문 중 선택**할 수 있습니다.
> - 감독관의 시작 신호 전까지는 대기 화면이 유지됩니다. **정상 상태이므로 새로고침하지 않아도 됩니다.**
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
> - If your network drops briefly, **refreshing restores your last saved progress.** Don't panic — just refresh.
>
> **6. How it plays**
> - Click a piece of evidence to **enlarge** it.
> - Some case material is provided in English. You can choose **Korean or English** for the interface when you enter.
> - The waiting screen stays until the auditor starts the game. **This is normal — you do not need to refresh.**
>
> We look forward to seeing you in action, Agents.
>
> PM Protection Bureau
