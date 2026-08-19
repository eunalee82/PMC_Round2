// SCR-016~019 Final Raid — 긴급 경보 → 레이드 준비 → 20초 전투 → 빌런왕 격퇴.
// 한 화면 컨트롤러 안에서 하위 국면(phase)을 전환한다(case.js와 같은 패턴).
// 설계 원칙(CLAUDE.md §2 §6, docs/game-flow.md §13.5):
//   · 성공 보장 — 클릭 수와 무관하게 20초가 지나면 체력이 0이 되고 반드시 격퇴에 성공한다.
//   · 연출 독립 — 흔들림·데미지 숫자·사운드가 실패하거나 꺼져도 진행은 끝까지 이어진다.
//   · rAF가 멈추는 환경(백그라운드 탭)에서도 setTimeout 안전망이 레이드를 종료시킨다.
//   · prefers-reduced-motion이면 화면 흔들림·파티클을 생략한다.
// 저장 시점(§18): Raid 시작 / Raid 완료(공격 수·누적 데미지) → lib/progress.js recordFinale.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { t } from '../../lib/copy.js'
import { ASSETS } from '../../constants/assets.js'
import { FLOW } from '../../constants/flow.js'
import { STAGE_META } from '../../constants/stages.js'
import { isSoloMode } from '../../lib/mode.js'
import { playerName } from '../../lib/player.js'
import { getFinale, recordFinale } from '../../lib/progress.js'
import { STAGES } from '../../lib/stage-progress.js'
import { createButton } from '../../../components/primitives/button.js'
import { createHomeLink } from '../../../components/shell/home-link.js'

const RAID_MS = 20000 // 레이드 시간 20초 (docs/game-flow.md §13.3)
// 이 횟수를 먼저 채우면 20초 전에 체력이 0이 된다(연타 보상). 못 채워도 20초에 종료된다(성공 보장).
// 운영 결정(2026-08-06): 140 → **10회**. 10번만 치면 바로 격퇴되므로 레이드가 훨씬 짧게 끝난다.
const HIT_TARGET = 10
// 공격 N회마다 장비 스킬 발동 연출 (§13.4 아이템 순서 발동). HIT_TARGET 이 10이 되었으므로
// 14회마다면 스킬이 한 번도 안 나온다 → 3회마다로 낮춰 장비 3종이 3·6·9타에 모두 발동하게 한다.
const SKILL_EVERY = 3
const READY_COUNT = 3 // [레이드 준비 완료] 후 출동 카운트다운
const DMG_MIN = 620
const DMG_MAX = 2400
const FX_MAX_NODES = 14 // 동시에 떠 있는 데미지 숫자 상한 (연타 시 DOM 폭주 방지)
const FINISH_FX_MS = 1000 // 격퇴 연출(폭발/플래시) 후 결과 화면까지

const reduceMotion = () => typeof window !== 'undefined' &&
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function createRaidScreen (ctx) {
  const teamId = ctx.session.teamId
  const teamName = playerName(ctx.session) // 행사 = 팀명, 연습 = 서약 서명

  const prevStage = document.documentElement.dataset.stage
  document.documentElement.dataset.stage = 'raid' // Final Raid = Red 국면 (§21)

  const host = el('div', { class: 'finale__inner' })
  // 국면(경보 → 준비 → 전투 → 격퇴)이 host 안에서 통째로 교체되므로 [처음으로]는 host 밖에 둔다.
  const homeLink = isSoloMode() ? createHomeLink({ onHome: () => ctx.goHome() }) : null
  const node = el('div', { class: 'screen screen--finale screen--raid' }, [homeLink ? homeLink.el : null, host])

  // ── 수명 관리 — 하위 국면의 컴포넌트/타이머는 국면 전환 때 반드시 정리한다 (CLAUDE.md §9) ──
  let viewParts = []
  let nextParts = []
  const trackView = (c) => { nextParts.push(c); return c }
  const clearView = () => { viewParts.forEach((p) => p && p.destroy && p.destroy()); viewParts = [] }
  const timers = new Set()
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id); return id }
  const clearTimers = () => { timers.forEach((id) => clearTimeout(id)); timers.clear() }
  let rafId = null
  const stopRaf = () => { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null } }

  function mountPhase (content) {
    clearView()
    viewParts = nextParts
    nextParts = []
    host.replaceChildren(content)
    host.scrollTop = 0
    if (ctx.scrollToTop) ctx.scrollToTop() // 국면 전환 시 맨 위에서 시작
  }

  const equipment = STAGES.map((s) => ({
    icon: STAGE_META[s].item.icon,
    name: t(STAGE_META[s].item.nameKey),
    effect: t(STAGE_META[s].item.effectKey)
  }))

  // ── SCR-016 긴급 경보 ──
  function showAlert () {
    const confirmBtn = trackView(createButton({
      label: t('alert.confirm'), variant: 'danger', size: 'lg', icon: 'alert', block: true,
      onClick: () => showReady()
    }))
    const row = (k, v, tone) => el('div', { class: 'alert__row' }, [
      el('span', { class: 'alert__row-key mono caps', text: k }),
      el('span', { class: tone ? `alert__row-val mono ${tone}` : 'alert__row-val mono', text: v })
    ])
    mountPhase(el('div', { class: 'alert anim-fade' }, [
      el('div', { class: 'alert__glitch', 'aria-hidden': 'true' }),
      el('div', { class: 'alert__tag mono caps' }, [icon('alert', { size: 16 }), el('span', { text: t('alert.tag') })]),
      el('h1', { class: 'alert__title', text: t('alert.title') }),
      el('img', { class: 'alert__villain', src: ASSETS.characters.billian, alt: t('raid.villain') }),
      el('div', { class: 'alert__rows' }, [
        row(t('alert.locationKey'), t('alert.locationVal')),
        row(t('alert.dangerKey'), t('alert.dangerVal'), 'is-danger'),
        row(t('alert.survivalKey'), t('alert.survivalVal'), 'is-danger')
      ]),
      el('p', { class: 'alert__sub', text: t('alert.sub') }),
      confirmBtn.el
    ]))
  }

  // ── SCR-017 레이드 준비 ──
  function showReady () {
    const countEl = el('div', { class: 'ready__count mono', hidden: true })
    const startBtn = trackView(createButton({
      label: t('raid.start'), variant: 'danger', size: 'lg', icon: 'crosshair', block: true,
      onClick: () => {
        startBtn.update({ disabled: true })
        countEl.hidden = false
        let n = READY_COUNT
        countEl.textContent = String(n)
        const tick = () => {
          n -= 1
          if (n <= 0) { countEl.textContent = t('raid.countdownLabel'); showBattle(); return }
          countEl.textContent = String(n)
          later(tick, 700)
        }
        later(tick, 700)
      }
    }))
    const rule = (text) => el('li', { class: 'ready__rule', text })
    mountPhase(el('div', { class: 'ready anim-fade' }, [
      el('span', { class: 'finale__eyebrow mono caps', text: t('raid.readyEyebrow') }),
      el('h1', { class: 'finale__title', text: t('raid.readyTitle') }),
      el('p', { class: 'ready__msg', text: t('raid.readyMsg') }),
      el('div', { class: 'ready__equip' }, [
        el('span', { class: 'finale__label mono caps', text: t('raid.equipped') }),
        el('div', { class: 'ready__items' }, equipment.map((it, i) => el('div', {
          class: 'ready__item',
          // 자동 장착 연출 — 세 장비가 순서대로 켜진다 (§12 세 개 아이템 자동 장착)
          style: { animationDelay: `${i * 220}ms` }
        }, [
          el('span', { class: 'ready__item-icon' }, [icon(it.icon, { size: 22 })]),
          el('span', { class: 'ready__item-name', text: it.name }),
          el('span', { class: 'ready__item-effect', text: it.effect })
        ])))
      ]),
      el('div', { class: 'ready__rules' }, [
        el('span', { class: 'finale__label mono caps', text: t('raid.rulesLabel') }),
        el('ul', { class: 'ready__rulelist' }, [rule(t('raid.rule1')), rule(t('raid.rule2')), rule(t('raid.rule3'))])
      ]),
      countEl,
      startBtn.el
    ]))
  }

  // ── SCR-018 전투 ──
  function showBattle () {
    const soft = reduceMotion()
    let hits = 0
    let damage = 0
    let finished = false
    const startedAt = Date.now()
    recordFinale(teamId, { raidStartedAt: startedAt }) // 저장 시점: Raid 시작

    const timeEl = el('span', { class: 'raid__stat-val mono', text: String(Math.round(RAID_MS / 1000)) })
    const hitsEl = el('span', { class: 'raid__stat-val mono', text: '0' })
    const hpFill = el('div', { class: 'raid__hp-fill', style: { width: '100%' } })
    const hpVal = el('span', { class: 'raid__hp-val mono', text: '100%' })
    const progFill = el('div', { class: 'raid__prog-fill', style: { width: '0%' } })
    const fxLayer = el('div', { class: 'raid__fx', 'aria-hidden': 'true' })
    const skillEl = el('div', { class: 'raid__skill', hidden: true })

    const villainImg = el('img', { class: 'raid__villain-img', src: ASSETS.characters.billian, alt: t('raid.villain') })
    const villainBtn = el('button', {
      class: 'raid__villain', type: 'button', 'aria-label': `${t('raid.villain')} ${t('raid.attack')}`
    }, [villainImg, fxLayer, skillEl])

    const stage = el('div', { class: 'raid__stage' }, [villainBtn])

    const stat = (label, valueEl) => el('div', { class: 'raid__stat' }, [
      el('span', { class: 'raid__stat-key mono caps', text: label }),
      valueEl
    ])

    const attackBtn = trackView(createButton({
      label: t('raid.attack'), variant: 'danger', size: 'lg', icon: 'zap', block: true
    }))

    // 데미지 숫자 — 상한을 넘기면 새로 만들지 않는다(연타 시 DOM 폭주 방지). 애니메이션 끝나면 제거.
    function spawnDamage (value) {
      if (soft || fxLayer.childElementCount >= FX_MAX_NODES) return
      const nodeFx = el('span', {
        class: 'raid__dmg mono',
        text: `-${value.toLocaleString()}`,
        style: { left: `${18 + Math.random() * 64}%`, top: `${24 + Math.random() * 40}%` }
      })
      fxLayer.append(nodeFx)
      const remove = () => nodeFx.remove()
      nodeFx.addEventListener('animationend', remove)
      later(remove, 1200) // 애니메이션이 실행되지 않는 환경 대비
    }

    // 타격 효과음 — 연타(초당 여러 번)에 겹쳐 울리는 게 자연스럽지만, 무제한으로 Audio 를 만들면
    // 저사양 기기에서 프레임이 튄다. 최소 간격을 두어 초당 ~16회로 제한한다.
    // 음소거·볼륨은 AudioManager.playSfx 가 세션 설정을 존중한다. 실패는 조용히 무시된다(CLAUDE.md §13).
    const HIT_SFX_MIN_MS = 60
    let lastHitSfxAt = 0
    // 첫 클릭 전에 파일을 받아 둔다 — 3KB 짜리라도 클릭 순간에 받으면 제스처 창을 놓쳐 첫 타격이 무음이 된다.
    try { new Audio(ASSETS.sfx.raidHit).load() } catch { /* 미지원 환경 — 무시 */ }
    function playHit () {
      if (!ctx || !ctx.audio) return
      // 자동재생 정책: 제스처 없이 들어온 화면(DEV 점프·새로고침 복구)에서는 AudioManager 가 잠겨 있어
      // BGM·효과음이 모두 무음이 된다. 공격 클릭 자체가 제스처이므로 이때 잠금을 푼다(멱등).
      // 이게 없으면 "오프닝(YouTube)은 들리는데 레이드만 무음"이 된다 — 오프닝은 AudioManager를 안 쓴다.
      if (!ctx.audio.unlocked) ctx.audio.unlock()
      const now = Date.now()
      if (now - lastHitSfxAt < HIT_SFX_MIN_MS) return
      lastHitSfxAt = now
      ctx.audio.playSfx(ASSETS.sfx.raidHit, { volume: 0.8 })
    }

    function fireSkill () {
      const it = equipment[Math.floor(hits / SKILL_EVERY - 1) % equipment.length] || equipment[0]
      skillEl.hidden = false
      skillEl.replaceChildren(
        el('span', { class: 'raid__skill-name', text: it.name }),
        el('span', { class: 'raid__skill-tag mono caps', text: t('raid.skillFired') })
      )
      skillEl.classList.remove('is-on')
      // 애니메이션 재시작 — 강제 리플로우 없이 다음 프레임에 클래스를 다시 붙인다.
      requestAnimationFrame(() => skillEl.classList.add('is-on'))
      later(() => { skillEl.classList.remove('is-on'); skillEl.hidden = true }, 900)
    }

    function attack () {
      if (finished) return
      hits += 1
      const dmg = Math.round(DMG_MIN + Math.random() * (DMG_MAX - DMG_MIN))
      damage += dmg
      hitsEl.textContent = String(hits)
      spawnDamage(dmg)
      playHit()
      if (!soft) {
        villainImg.classList.remove('is-hit')
        requestAnimationFrame(() => villainImg.classList.add('is-hit'))
        stage.classList.add('is-shake')
        later(() => stage.classList.remove('is-shake'), 120)
      }
      if (hits % SKILL_EVERY === 0) fireSkill()
    }

    // pointerdown + 키보드만 듣는다 — click까지 듣으면 한 번의 조작이 두 번 집계된다.
    function bindAttack (target) {
      target.addEventListener('pointerdown', attack)
      target.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        attack()
      })
    }
    bindAttack(villainBtn)
    bindAttack(attackBtn.el)

    function render () {
      const elapsed = Date.now() - startedAt
      const byTime = Math.min(1, elapsed / RAID_MS)
      const byHits = Math.min(1, hits / HIT_TARGET)
      const progress = Math.max(byTime, byHits) // 성공 보장: 시간만으로도 100%에 도달한다
      const hp = Math.max(0, Math.round((1 - progress) * 100))
      hpFill.style.width = `${hp}%`
      hpVal.textContent = `${hp}%`
      progFill.style.width = `${Math.round(progress * 100)}%`
      timeEl.textContent = String(Math.max(0, Math.ceil((RAID_MS - elapsed) / 1000)))
      if (progress >= 1) { finish(); return }
      rafId = requestAnimationFrame(render)
    }

    function finish () {
      if (finished) return
      finished = true
      stopRaf()
      hpFill.style.width = '0%'
      hpVal.textContent = '0%'
      progFill.style.width = '100%'
      timeEl.textContent = '0'
      attackBtn.update({ disabled: true })
      recordFinale(teamId, { raidEndedAt: Date.now(), raidHits: hits, raidDamage: damage }) // 저장 시점: Raid 완료
      if (!soft) {
        stage.classList.add('is-finish')
        node.classList.add('is-flash')
      }
      later(() => showDefeated({ hits, damage }), soft ? 200 : FINISH_FX_MS)
    }

    mountPhase(el('div', { class: 'raid anim-fade' }, [
      el('div', { class: 'raid__top' }, [
        el('span', { class: 'raid__team', text: teamName }),
        el('div', { class: 'raid__stats' }, [stat(t('raid.time'), timeEl), stat(t('raid.hits'), hitsEl)])
      ]),
      el('div', { class: 'raid__hp' }, [
        el('div', { class: 'raid__hp-head' }, [
          el('span', { class: 'raid__hp-key mono caps', text: t('raid.hp') }),
          hpVal
        ]),
        el('div', { class: 'raid__hp-track' }, [hpFill])
      ]),
      el('span', { class: 'raid__villain-name mono caps', text: `${t('raid.villain')} · ${t('raid.villainSub')}` }),
      stage,
      el('div', { class: 'raid__prog' }, [
        el('span', { class: 'raid__prog-key mono caps', text: t('raid.progress') }),
        el('div', { class: 'raid__prog-track' }, [progFill])
      ]),
      el('div', { class: 'raid__items' }, equipment.map((it) => el('span', { class: 'raid__item', title: it.effect }, [
        icon(it.icon, { size: 16 }),
        el('span', { text: it.name })
      ]))),
      el('p', { class: 'raid__hint', text: t('raid.attackHint') }),
      attackBtn.el
    ]))

    // 안전망 — rAF가 멈추는 환경(백그라운드 탭 등)에서도 레이드는 반드시 끝난다.
    later(finish, RAID_MS + 600)
    rafId = requestAnimationFrame(render)
  }

  // ── SCR-019 빌런왕 격퇴 ──
  function showDefeated (result) {
    node.classList.remove('is-flash')
    const finale = getFinale(teamId)
    const hits = (result && result.hits) || finale.raidHits || 0
    const damage = (result && result.damage) || finale.raidDamage || 0
    const contribution = Math.min(100, Math.round((hits / HIT_TARGET) * 100))

    // 임명과 같은 이유로 저장 완료를 기다린 뒤 넘어간다 — raidEndedAt 이 아직 없으면 가드가
    // 금배지 진입을 막고 이 화면에 머문다(서버 모드에서 record_milestone 이 비동기다).
    const nextBtn = trackView(createButton({
      label: t('defeat.next'), variant: 'gold', size: 'lg', icon: 'award', block: true,
      onClick: async () => {
        nextBtn.update({ loading: true, disabled: true })
        try { await recordFinale(teamId, { raidEndedAt: Date.now(), raidHits: hits, raidDamage: damage }) } catch { /* 아래에서 다룬다 */ }
        nextBtn.update({ loading: false, disabled: false })
        ctx.goTo(FLOW.ENDING)
      }
    }))
    const stat = (k, v) => el('div', { class: 'defeat__stat' }, [
      el('span', { class: 'defeat__stat-val mono', text: v }),
      el('span', { class: 'defeat__stat-key caps', text: k })
    ])
    mountPhase(el('div', { class: 'defeat anim-fade' }, [
      el('span', { class: 'defeat__tag mono caps', text: t('defeat.tag') }),
      el('h1', { class: 'defeat__title', text: t('defeat.title') }),
      el('img', { class: 'defeat__img', src: ASSETS.characters.billianDead, alt: t('defeat.title') }),
      el('p', { class: 'defeat__sub', text: t('defeat.sub') }),
      el('div', { class: 'defeat__stats' }, [
        stat(t('defeat.damage'), damage.toLocaleString()),
        stat(t('defeat.hits'), String(hits)),
        stat(t('defeat.contribution'), `${contribution}%`)
      ]),
      nextBtn.el
    ]))
  }

  // 재진입 판정 — 이미 격퇴를 마친 팀이 새로고침하면 결과 화면으로 복구한다 (CLAUDE.md §2).
  if (getFinale(teamId).raidEndedAt) showDefeated(null)
  else showAlert()

  return {
    el: node,
    mounted () { if (ctx.audio) { ctx.audio.stopSfx(); ctx.audio.playBgm(ASSETS.bgm.killBillian) } }, // §22 Final Raid BGM
    destroy () {
      if (prevStage) document.documentElement.dataset.stage = prevStage
      else delete document.documentElement.dataset.stage
      stopRaf()
      clearTimers()
      clearView()
      if (homeLink) homeLink.destroy()
    }
  }
}
