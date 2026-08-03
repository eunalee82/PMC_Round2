// Email normalization + soft validation for team entry (SCR-003).
// One device types all three teammates' addresses, so pasted/auto-completed values arrive
// with stray spaces, capitals and full-width @. We clean the value in place so the operator
// SEES the corrected address, and we only BLOCK on empty/duplicate — anything else is a
// yellow warning that still lets the team in (운영 원칙: 입력을 막지 않는다).
// see docs/screen-list.md SCR-003.

const HANGUL = /[ㄱ-ㅎㅏ-ㅣ가-힣]/
const LOCAL_OK = /^[a-z0-9._%+-]+$/

export function normalizeEmail (raw) {
  return String(raw ?? '')
    .replace(/\s+/g, '') // 붙여넣기·자동완성으로 끼는 공백 (운영 측이 지적한 띄어쓰기 이슈)
    .replace(/＠/g, '@') // 전각 @
    .replace(/[.,;]+$/, '')
    .toLowerCase()
}

// 형식 의심 — 차단이 아니라 경고. 빈 문자열은 blocking 쪽에서 따로 다룬다.
export function isSuspect (email) {
  if (!email) return false
  const parts = email.split('@')
  if (parts.length !== 2) return true
  const [local, domain] = parts
  if (!local || !domain) return true
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) return true
  if (HANGUL.test(email)) return true
  return !LOCAL_OK.test(local)
}

// list: 원본 입력값 배열 → { emails, blocking, duplicates, suspects }
// blocking: 'empty' | 'duplicate' | null  (null이어야 입장 가능)
export function checkEmails (list) {
  const emails = list.map(normalizeEmail)
  const seen = new Map()
  const duplicates = []

  emails.forEach((email) => {
    if (!email) return
    const count = (seen.get(email) || 0) + 1
    seen.set(email, count)
    if (count === 2) duplicates.push(email)
  })

  const suspects = emails.reduce((acc, email, i) => (isSuspect(email) ? [...acc, i] : acc), [])
  const blocking = emails.some((e) => !e) ? 'empty' : (duplicates.length ? 'duplicate' : null)

  return { emails, blocking, duplicates, suspects }
}

// 재입장 모달에서 "누가 등록했는지"만 알려주고 주소 전체는 노출하지 않는다.
export function maskEmail (email) {
  const value = normalizeEmail(email)
  if (!value) return ''
  const at = value.indexOf('@')
  if (at < 1) return value.slice(0, 2) + '***'
  return value.slice(0, Math.min(2, at)) + '***' + value.slice(at)
}
