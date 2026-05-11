/**
 * 任务与日历相关逻辑统一按 Asia/Shanghai（中国大陆，无夏令时）。
 * 任务 API 的日期为日历日 YYYY-MM-DD，与浏览器本地时区无关。
 */

const CN = { timeZone: 'Asia/Shanghai' }

/** @param {Date} d @returns {string} YYYY-MM-DD */
export function formatYmdChina(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', { ...CN, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export function chinaTodayYmd() {
  return formatYmdChina(new Date())
}

/** 将 YYYY-MM-DD 解析为该日 00:00 的中国大陆时刻（UTC+8） */
export function parseYmdChina(ymd) {
  const s = String(ymd).trim()
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return new Date(NaN)
  return new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00+08:00`)
}

/** 同一中国大陆日历日的 00:00（UTC+8） */
export function startOfDayChina(d) {
  return parseYmdChina(formatYmdChina(d))
}

export function addDaysChina(d, n) {
  const t = startOfDayChina(d).getTime() + Number(n) * 86400000
  return parseYmdChina(formatYmdChina(new Date(t)))
}

/** ISO 周：周一=0 … 周日=6（按上海日历） */
export function chinaIsoWeekdayMon0(d) {
  const w = new Intl.DateTimeFormat('en', { ...CN, weekday: 'long' }).format(d)
  const idx = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(w)
  return idx >= 0 ? idx : 0
}

/** 周日=0 … 周六=6（月历网格用） */
export function chinaGetDaySun0(d) {
  const w = new Intl.DateTimeFormat('en', { ...CN, weekday: 'long' }).format(d)
  const map = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
  return map[w] ?? 0
}

const ZH_WDAY = ['日', '一', '二', '三', '四', '五', '六']

/** 周几（上海日历），用于月视图表头 */
export function chinaWeekdayZhShort(d) {
  return ZH_WDAY[chinaGetDaySun0(d)] ?? ''
}

export function startOfWeekMondayChina(d) {
  const cur = startOfDayChina(d)
  const wd = chinaIsoWeekdayMon0(cur)
  return addDaysChina(cur, -wd)
}

export function startOfMonthChina(d) {
  const ymd = formatYmdChina(d)
  return parseYmdChina(`${ymd.slice(0, 7)}-01`)
}

export function endOfMonthChina(d) {
  const ymd = formatYmdChina(d)
  const y = Number(ymd.slice(0, 4))
  const mo = Number(ymd.slice(5, 7))
  if (mo === 12) return parseYmdChina(`${y}-12-31`)
  const nm = String(mo + 1).padStart(2, '0')
  const yy = String(y).padStart(4, '0')
  return addDaysChina(parseYmdChina(`${yy}-${nm}-01`), -1)
}

export function dayOffsetFromChina(a, b) {
  return Math.round((startOfDayChina(b).getTime() - startOfDayChina(a).getTime()) / 86400000)
}

/** MM/dd（按上海日历） */
export function formatMdSlashChina(d) {
  const parts = new Intl.DateTimeFormat('en-US', { ...CN, month: '2-digit', day: '2-digit' }).formatToParts(d)
  let month = ''
  let day = ''
  for (const p of parts) {
    if (p.type === 'month') month = p.value.padStart(2, '0')
    if (p.type === 'day') day = p.value.padStart(2, '0')
  }
  return `${month}/${day}`
}

/** 如 2026年5月 */
export function formatYearMonthTitleChina(d) {
  const parts = new Intl.DateTimeFormat('zh-CN', { ...CN, year: 'numeric', month: 'numeric' }).formatToParts(d)
  let y = ''
  let mo = ''
  for (const p of parts) {
    if (p.type === 'year') y = p.value
    if (p.type === 'month') mo = p.value
  }
  return `${y}年${mo}月`
}

/** 当前上海日历月的第一天 00:00+8 */
export function chinaTodayFirstOfMonthDate() {
  return startOfMonthChina(parseYmdChina(chinaTodayYmd()))
}

/**
 * @param {string} ymdFirstOfMonth YYYY-MM-01
 * @param {number} delta 月偏移
 */
export function shiftMonthYmd(ymdFirstOfMonth, delta) {
  const [y0, mo0] = ymdFirstOfMonth.split('-').map(Number)
  let idx = y0 * 12 + (mo0 - 1) + delta
  const y = Math.floor(idx / 12)
  const mo = (idx % 12) + 1
  return `${y}-${String(mo).padStart(2, '0')}-01`
}
