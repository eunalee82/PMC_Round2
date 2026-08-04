// 관리자 · 팀 현황 — 입장 여부 · 등록 수사관 이메일 · 제출 수 · 점수 · 운영 플래그.
// 서버 뷰 `admin_team_status` 를 읽는다(관리자 로그인 필요 · RLS is_admin()). 5초마다 갱신.
// 이메일은 PII 라 anon 은 절대 볼 수 없고, 이 화면에서만 노출된다(설계 §5 §7).
// mock 모드에서는 서버가 없으므로 DEV '입장 현황' 도구를 쓰라고 안내한다.
import { el } from '../../utils/dom.js'
import { icon } from '../../utils/icons.js'
import { supabase, isServerMode } from '../../lib/supabase.js'
import { createButton } from '../../../components/primitives/button.js'

const REFRESH_MS = 5000

function pad (n) { return String(n).padStart(2, '0') }
function fmtTime (iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function csvCell (v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function createTeamStatusView (props = {}) {
  const { onClose = null } = props

  const summary = el('p', { class: 'ranking__sub' })
  const list = el('div', { class: 'ranklist' })
  const err = el('p', { class: 'auth-error' })
  let timer = null

  const closeBtn = createButton({
    label: '관리자 콘솔로', variant: 'secondary', size: 'md', icon: 'refresh',
    onClick: () => { if (onClose) onClose() }
  })
  const csvBtn = createButton({
    label: 'CSV 복사', variant: 'ghost', size: 'md', icon: 'file',
    onClick: () => copyCsv()
  })

  let rows = []

  function copyCsv () {
    const header = ['team_no', 'team_name', 'is_claimed', 'member1', 'member2', 'member3', 'entered_at', 'submitted', 'score', 'flags']
    const body = rows.map((r, i) => [
      i + 1, r.name, r.is_claimed ? 'Y' : 'N',
      (r.member_emails || [])[0] || '', (r.member_emails || [])[1] || '', (r.member_emails || [])[2] || '',
      r.entered_at || '', r.submitted_count, r.score, (r.flags || []).join(' ')
    ])
    const csv = [header, ...body].map((line) => line.map(csvCell).join(',')).join('\n')
    navigator.clipboard.writeText(csv).then(
      () => { csvBtn.update({ label: '복사됨!' }); setTimeout(() => csvBtn.update({ label: 'CSV 복사' }), 1400) },
      () => console.log('[team-status.csv]\n' + csv)
    )
  }

  // 같은 이메일이 2개 이상 팀에 등록 = 팀 오선택 신호 (시작 전에 운영진이 정정)
  function crossTeamDuplicates (data) {
    const byEmail = new Map()
    for (const r of data) {
      for (const e of r.member_emails || []) {
        if (!e) continue
        if (!byEmail.has(e)) byEmail.set(e, new Set())
        byEmail.get(e).add(r.team_id)
      }
    }
    const dupes = new Set()
    for (const [email, teams] of byEmail) if (teams.size > 1) dupes.add(email)
    return dupes
  }

  function render () {
    const dupes = crossTeamDuplicates(rows)
    const claimed = rows.filter((r) => r.is_claimed).length
    summary.textContent = `입장 ${claimed} / 전체 ${rows.length}팀` +
      (dupes.size ? ` · 중복 이메일 ${dupes.size}건 (팀 오선택 확인 필요)` : '')

    list.replaceChildren(...rows.map((r) => {
      const emails = r.member_emails || []
      const hasDupe = emails.some((e) => dupes.has(e))
      const flags = [...(r.flags || [])]
      if (hasDupe) flags.push('cross-team-duplicate')
      return el('div', { class: ['rankrow', r.is_claimed ? null : 'is-open', flags.length ? 'is-flagged' : null].filter(Boolean).join(' ') }, [
        el('span', { class: 'rankrow__rank mono', text: r.is_claimed ? '●' : '○' }),
        el('span', { class: 'rankrow__team', text: r.name }),
        el('span', { class: 'rankrow__emails mono', text: emails.length ? emails.join('  ·  ') : '미등록' }),
        el('span', { class: 'rankrow__time mono', text: fmtTime(r.entered_at) }),
        el('span', { class: 'rankrow__solved mono', text: String(r.submitted_count ?? 0) }),
        el('span', { class: 'rankrow__score mono', text: String(r.score ?? 0) }),
        el('span', { class: 'rankrow__flags mono', text: flags.join(' ') })
      ])
    }))
  }

  async function load () {
    if (!isServerMode()) {
      err.textContent = 'mock 모드입니다 — 입장 현황은 DEV 메뉴의 [입장 현황]에서 확인하십시오.'
      return
    }
    try {
      const { data, error } = await supabase
        .from('admin_team_status')
        .select('team_id,name,sort_order,is_claimed,member_emails,entered_at,submitted_count,score,flags')
        .order('sort_order')
      if (error) throw error
      rows = data || []
      err.textContent = rows.length ? '' : '조회 결과가 없습니다. 관리자 권한(admins 등록)을 확인하십시오.'
      render()
    } catch (e) {
      err.textContent = '팀 현황을 불러오지 못했습니다. 관리자 권한과 네트워크를 확인하십시오.'
    }
  }

  const head = el('div', { class: 'rankrow rankrow--head' }, [
    el('span', { class: 'rankrow__rank mono caps', text: '입장' }),
    el('span', { class: 'rankrow__team caps', text: '팀' }),
    el('span', { class: 'rankrow__emails caps', text: '등록 수사관' }),
    el('span', { class: 'rankrow__time mono caps', text: '입장시각' }),
    el('span', { class: 'rankrow__solved mono caps', text: '제출' }),
    el('span', { class: 'rankrow__score mono caps', text: '점수' }),
    el('span', { class: 'rankrow__flags caps', text: '플래그' })
  ])

  const node = el('div', { class: 'screen screen--finale screen--ranking' }, [
    el('div', { class: 'finale__inner finale__inner--wide' }, [
      el('div', { class: 'ranking anim-fade' }, [
        el('span', { class: 'finale__eyebrow mono caps', text: 'TEAM STATUS' }),
        el('h1', { class: 'finale__title', text: '팀 현황' }),
        summary,
        err,
        el('div', { class: 'ranking__tablewrap' }, [el('div', { class: 'ranking__table is-teams' }, [head, list])]),
        el('div', { class: 'ranking__actions' }, [csvBtn.el, closeBtn.el])
      ])
    ])
  ])

  load()
  timer = setInterval(load, REFRESH_MS)

  return {
    el: node,
    destroy () { clearInterval(timer); closeBtn.destroy(); csvBtn.destroy(); node.remove() }
  }
}
