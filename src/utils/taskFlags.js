/**
 * 与后端 `serialize_task` 的 isLongTerm / is_long_term 对齐（兼容历史或代理层字段）。
 */
export function isLongTermFlag(t) {
  if (!t || typeof t !== 'object') return false
  const v = t.isLongTerm ?? t.is_long_term ?? t.isLongterm
  if (v === true || v === 1) return true
  if (v === false || v === 0 || v == null || v === '') return false
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    return s === '1' || s === 'true' || s === 'yes'
  }
  return Boolean(v)
}

export function normalizeTaskRow(t) {
  if (!t || typeof t !== 'object') return t
  return { ...t, isLongTerm: isLongTermFlag(t) }
}
