// CaptureGuard — 게임플레이 화면의 캡처 '억제' 장치 (원천 차단은 웹에서 불가, README 참고).
//  1) 워터마크: 팀명·시각을 화면 전체에 반투명 타일 → 유출 스크린샷 추적
//  2) 전체화면 게이트: 전체화면일 때만 사건이 보이고, 벗어나면 다시 가림 → 캡처 도구/alt-tab 억제
//  3) 복사·우클릭·드래그·선택 차단 → 텍스트/이미지 반출 억제
//  4) PrintScreen 감지 → 경고 배너 + 클립보드 비우기 시도 (Win+Shift+S·폰 촬영은 못 잡음)
// createCaptureGuard(props) -> { destroy }  (CLAUDE.md §9). body에 오버레이를 붙이고 destroy에서 모두 정리.
import { el } from '../../js/utils/dom.js'
import { icon } from '../../js/utils/icons.js'
import { t } from '../../js/lib/copy.js'
import { createButton } from '../primitives/button.js'

function pad (n) { return String(n).padStart(2, '0') }
function nowHHMM () { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }

export function createCaptureGuard ({ label = '' } = {}) {
  const cleanups = []
  const on = (target, ev, fn, opts) => {
    target.addEventListener(ev, fn, opts)
    cleanups.push(() => target.removeEventListener(ev, fn, opts))
  }

  // 1) 워터마크 (팀명 · 시각) — 유출 추적용, 화면 전체 타일
  const stamp = `${label || 'PMB'} · ${nowHHMM()}`
  const wmInner = el('div', { class: 'wm-overlay__inner' })
  for (let i = 0; i < 140; i++) wmInner.append(el('span', { class: 'wm-overlay__cell', text: stamp })) // textContent — 안전
  const wm = el('div', { class: 'wm-overlay', 'aria-hidden': 'true' }, [wmInner])
  document.body.append(wm)
  cleanups.push(() => wm.remove())

  // 2) 복사/우클릭/선택/드래그 차단
  const block = (e) => e.preventDefault()
  on(document, 'contextmenu', block)
  on(document, 'copy', block)
  on(document, 'cut', block)
  on(document, 'dragstart', block)
  on(document, 'selectstart', block)

  // 3) PrintScreen 감지 → 경고 + 클립보드 비우기 시도
  let toastTimer = null
  function warn (msg) {
    const toast = el('div', { class: 'cap-toast' }, [icon('alert', { size: 16 }), el('span', { text: msg })])
    document.body.append(toast)
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => toast.remove(), 2600)
    cleanups.push(() => { clearTimeout(toastTimer); toast.remove() })
  }
  on(document, 'keyup', (e) => {
    if (e.key !== 'PrintScreen') return
    warn(t('guard.captureWarn'))
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText('').catch(() => {})
    } catch { /* 권한/포커스 없음 — 무시 */ }
  })

  // 4) 전체화면 게이트 — 전체화면일 때만 사건이 보인다.
  const FS_SUPPORTED = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)
  const enterBtn = createButton({ label: t('guard.gateEnter'), variant: 'primary', size: 'lg', icon: 'maximize', onClick: enterFs })
  const gate = el('div', { class: 'fs-gate' }, [
    el('div', { class: 'fs-gate__panel' }, [
      icon('maximize', { size: 30 }),
      el('h2', { class: 'fs-gate__title', text: t('guard.gateTitle') }),
      el('p', { class: 'fs-gate__msg', text: t('guard.gateMsg') }),
      enterBtn.el
    ])
  ])
  document.body.append(gate)
  cleanups.push(() => { enterBtn.destroy(); gate.remove() })

  function hideGate () { gate.classList.add('is-hidden') }
  function showGate () { gate.classList.remove('is-hidden') }

  function enterFs () {
    const root = document.documentElement
    const req = root.requestFullscreen || root.webkitRequestFullscreen
    if (!req) { hideGate(); return } // 미지원 브라우저 → 게이트만 해제하고 진행 (잠금 방지)
    try {
      const p = req.call(root)
      if (p && typeof p.then === 'function') p.then(hideGate).catch(hideGate)
      else hideGate()
    } catch { hideGate() }
  }

  if (FS_SUPPORTED) {
    on(document, 'fullscreenchange', () => {
      if (document.fullscreenElement) hideGate()
      else { showGate(); enterBtn.update({ label: t('guard.gateReturn') }) }
    })
  }
  showGate() // 초기: 게이트 표시 — 사용자의 버튼 클릭(제스처)으로 전체화면 진입

  return {
    destroy () { cleanups.forEach((fn) => fn()) }
  }
}
