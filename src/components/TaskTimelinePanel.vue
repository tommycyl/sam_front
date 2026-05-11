<template>
  <!-- 任务时间表：周为连续条带；月为一页一月 + 日内分列，横滑无吸附，同一时段可纵向堆叠多条 -->
  <section class="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-surface-variant px-4 py-3">
      <span
        v-if="scheduleHeadingTrimmed"
        class="min-w-0 flex-1 text-base font-black leading-snug text-primary"
      >{{ scheduleHeadingTrimmed }}</span>
      <span v-else class="min-w-0 flex-1 text-xs text-on-surface-variant">
        鼠标拖拽或滚轮可横向移动；周为连续多周一条泳道；月视图一页一个月，横向自由滚动换月（无吸附）
      </span>
      <div class="flex shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-container-lowest">
        <button
          v-for="r in ['周', '月']"
          :key="r"
          type="button"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            range === r
              ? 'bg-surface-container-high text-on-surface'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          "
          @click="range = r"
        >
          {{ r }}
        </button>
      </div>
    </div>

    <div class="flex min-h-0 flex-1">
      <div class="flex w-14 shrink-0 flex-col border-r border-surface-variant bg-surface-container-low/50">
        <div
          class="flex h-10 shrink-0 items-center justify-center border-b border-surface-variant px-1 text-center text-[10px] font-medium leading-tight text-on-surface-variant"
        >
          时间轴
        </div>
        <div class="min-h-[80px] flex-1"></div>
      </div>
      <div
        ref="timelineScrollRef"
        class="timeline-snap-scroll timeline-snap-scroll--mouse flex min-w-0 flex-1 overflow-x-auto overscroll-x-contain"
        :class="{ 'timeline-snap-scroll--continuous': range === '周' || range === '月' }"
        @pointerdown="onTimelinePointerDown"
        @pointermove="onTimelinePointerMove"
        @pointerup="onTimelinePointerUp"
        @pointercancel="onTimelinePointerUp"
      >
        <!-- 周：表头每周一格，泳道一条横跨多周（任务不重复） -->
        <div
          v-if="range === '周' && timelineWeekStrip"
          class="timeline-week-strip flex shrink-0 flex-col"
          :style="{ width: timelineWeekStrip.totalWidthPx + 'px' }"
        >
          <div class="flex h-11 shrink-0 border-b border-surface-variant bg-surface-container-low/40">
            <div
              v-for="col in timelineWeekStrip.weekHeaders"
              :key="col.snapKey"
              class="flex shrink-0 items-center justify-center border-r border-surface-variant px-2 text-center text-xs last:border-r-0"
              :style="{ width: col.widthPx + 'px' }"
              :class="
                col.containsToday
                  ? 'bg-secondary/10 font-semibold text-secondary'
                  : 'font-medium text-on-surface'
              "
            >
              {{ col.titleLabel }}
            </div>
          </div>
          <div
            class="relative border-b border-surface-variant bg-surface-container-lowest/40"
            :style="{
              height: timelineWeekStrip.swimlaneHeightPx + 'px',
              backgroundImage: 'linear-gradient(to right, #e0e3e5 1px, transparent 1px)',
              backgroundSize: WEEK_COLUMN_WIDTH_PX + 'px 100%',
            }"
          >
            <div
              v-if="timelineWeekStrip.todayLinePct !== null"
              class="pointer-events-none absolute bottom-0 top-0 z-[8] w-px bg-secondary"
              :style="{ left: timelineWeekStrip.todayLinePct + '%', transform: 'translateX(-50%)' }"
            >
              <span
                class="absolute -top-0.5 left-1/2 z-[9] -translate-x-1/2 whitespace-nowrap rounded bg-secondary px-1 py-0.5 text-[10px] text-white"
              >今</span>
            </div>
            <div
              v-for="item in timelineWeekStrip.laidOut"
              :key="item.key"
              class="timeline-task-card absolute z-10 box-border rounded-lg border-2 px-2 py-1.5 text-left shadow-sm"
              :class="[
                item.task.barClass,
                item.task.status === 'delayed' ? 'ring-1 ring-error/40' : '',
              ]"
              :style="{
                left: `calc(${item.leftPct}% + 2px)`,
                width: `calc(${item.widthPct}% - 4px)`,
                top: item.topPx + 'px',
                minHeight: taskCardMinHeightPx + 'px',
                ...timelineIncompleteBorderStyle(item.task),
              }"
            >
              <div class="flex items-start gap-1.5">
                <span class="mt-0.5 h-2 w-2 shrink-0 rounded-full" :class="item.task.dotColor"></span>
                <div class="min-w-0 flex-1">
                  <div
                    class="text-xs font-bold leading-snug text-current break-words"
                    :class="item.task.status === 'delayed' ? 'text-error' : ''"
                  >
                    {{ item.task.title }}
                  </div>
                  <div class="mt-1 text-[11px] leading-snug text-on-surface-variant break-words">
                    {{ formatMdSlashFromYmd(item.task.startDate) }} ~ {{ formatMdSlashFromYmd(item.task.endDate) }}
                  </div>
                  <div class="mt-0.5 text-[11px] leading-snug text-on-surface-variant break-words">
                    <template v-if="subtitleKind === 'teacher'">任务老师：{{ item.task.teacher || '—' }}</template>
                    <template v-else>学生：{{ item.task.student || '—' }}</template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 月：一页一个月（占满可视宽度），月内按日分列放大 -->
        <template v-else-if="range === '月'">
          <div
            v-for="(period, pi) in timelineMonthPages"
            :key="period.snapKey"
            class="timeline-month-page flex w-full min-w-full shrink-0 flex-col border-r border-surface-variant last:border-r-0"
          >
            <div
              class="border-b border-surface-variant bg-surface-container-low/40 py-2 text-center text-sm font-semibold text-on-surface"
            >
              {{ period.titleLabel }}
            </div>
            <div
              class="flex min-h-14 shrink-0 border-b border-surface-variant bg-surface-container-low/50 py-1 text-[11px] font-medium text-on-surface-variant"
            >
              <div
                v-for="(c, ci) in period.columns"
                :key="ci"
                class="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-r border-surface-variant px-0.5 text-center leading-none last:border-r-0"
                :class="c.isToday ? 'bg-secondary/15 text-secondary font-semibold' : ''"
              >
                <span class="whitespace-nowrap">{{ c.datePart }}</span>
                <span class="whitespace-nowrap">{{ c.weekdayPart }}</span>
              </div>
            </div>
            <div
              class="relative border-b border-surface-variant bg-surface-container-lowest/40"
              :style="{
                height: period.swimlaneHeightPx + 'px',
                backgroundImage: 'linear-gradient(to right, #e0e3e5 1px, transparent 1px)',
                backgroundSize: `calc(100% / ${period.days}) 100%`,
              }"
            >
              <div
                v-if="period.todayLinePct !== null"
                class="pointer-events-none absolute bottom-0 top-0 z-[8] w-px bg-secondary"
                :style="{ left: period.todayLinePct + '%', transform: 'translateX(-50%)' }"
              >
                <span
                  class="absolute -top-0.5 left-1/2 z-[9] -translate-x-1/2 whitespace-nowrap rounded bg-secondary px-1 py-0.5 text-[10px] text-white"
                >今</span>
              </div>
              <div
                v-for="item in period.laidOut"
                :key="item.key + '-' + pi"
                class="timeline-task-card absolute z-10 box-border rounded-lg border-2 px-2 py-1.5 text-left shadow-sm"
                :class="[
                  item.task.barClass,
                  item.task.status === 'delayed' ? 'ring-1 ring-error/40' : '',
                ]"
                :style="{
                  left: `calc(${item.leftPct}% + 2px)`,
                  width: `calc(${item.widthPct}% - 4px)`,
                  top: item.topPx + 'px',
                  minHeight: taskCardMinHeightPx + 'px',
                  ...timelineIncompleteBorderStyle(item.task),
                }"
              >
                <div class="flex items-start gap-1.5">
                  <span class="mt-0.5 h-2 w-2 shrink-0 rounded-full" :class="item.task.dotColor"></span>
                  <div class="min-w-0 flex-1">
                    <div
                      class="text-xs font-bold leading-snug text-current break-words"
                      :class="item.task.status === 'delayed' ? 'text-error' : ''"
                    >
                      {{ item.task.title }}
                    </div>
                    <div class="mt-1 text-[11px] leading-snug text-on-surface-variant break-words">
                      {{ formatMdSlashFromYmd(item.task.startDate) }} ~ {{ formatMdSlashFromYmd(item.task.endDate) }}
                    </div>
                    <div class="mt-0.5 text-[11px] leading-snug text-on-surface-variant break-words">
                      <template v-if="subtitleKind === 'teacher'">任务老师：{{ item.task.teacher || '—' }}</template>
                      <template v-else>学生：{{ item.task.student || '—' }}</template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  addDaysChina,
  chinaTodayYmd,
  chinaWeekdayZhShort,
  dayOffsetFromChina,
  endOfMonthChina,
  formatMdSlashChina,
  formatYearMonthTitleChina,
  formatYmdChina,
  parseYmdChina,
  startOfMonthChina,
  startOfWeekMondayChina,
} from '@/utils/chinaTime'

const props = defineProps({
  /** 与学生详情任务结构一致；教师视图需带 `student` 姓名 */
  tasks: { type: Array, required: true },
  /** `teacher`：第三行显示任务老师；`student`：第三行显示学生 */
  subtitleKind: { type: String, default: 'teacher', validator: (v) => v === 'teacher' || v === 'student' },
  /** 显示在「时间轴」列下方，例如「张三 时间表」；空则不展示 */
  scheduleHeading: { type: String, default: '' },
  /** 每次进入详情等场景递增，用于将横向滚动重新对齐到「今天」在视口中间 */
  recenterAt: { type: Number, default: 0 },
})

const scheduleHeadingTrimmed = computed(() => String(props.scheduleHeading || '').trim())

const range = defineModel('range', { type: String, default: '周' })

const TASK_TRACK_ROW_PX = 80
const TASK_SWIMLANE_PAD_PX = 10
const taskCardMinHeightPx = 72
const WEEK_COLUMN_WIDTH_PX = 200
/** 时间轴左右可继续延伸：靠近边缘时追加的日历长度 */
const WEEK_PAD_INITIAL_DAYS = 56
const MONTH_PAD_INITIAL_DAYS = 120
const WEEK_SCROLL_EXTEND_DAYS = 56
const MONTH_SCROLL_EXTEND_DAYS = 120
const SCROLL_EXTEND_EDGE_PX = 280

const timelineScrollRef = ref(null)
/** 相对任务最早日在左侧多铺的日历天数（可随滚动增大） */
const weekExtraDaysBefore = ref(WEEK_PAD_INITIAL_DAYS)
const weekExtraDaysAfter = ref(WEEK_PAD_INITIAL_DAYS)
const monthExtraDaysBefore = ref(MONTH_PAD_INITIAL_DAYS)
const monthExtraDaysAfter = ref(MONTH_PAD_INITIAL_DAYS)

let timelineScrollRaf = 0

/** 未开始任务：进入页面时按「距开始日远近」算出的深浅，之后保持不变（再次进入详情会清空重算） */
const frozenPendingStartCloseness = new Map()

function clearFrozenPendingColors() {
  frozenPendingStartCloseness.clear()
}

function taskClosenessKey(task) {
  if (task?.id != null && task.id !== '') return `id:${task.id}`
  return `t:${String(task?.title || '')}|${String(task?.startDate || '')}`
}

function computePendingStartCloseness(task) {
  if (task?.status !== 'pending' || !task?.startDate) return 0
  const today = parseYmdChina(chinaTodayYmd())
  const start = parseYmdChina(task.startDate)
  const daysUntil = dayOffsetFromChina(today, start)
  if (daysUntil > 21) return 0
  if (daysUntil <= 0) return 1
  return 1 - daysUntil / 21
}

function getFrozenPendingStartCloseness(task) {
  if (task?.status !== 'pending' || !task?.startDate) return null
  const k = taskClosenessKey(task)
  if (frozenPendingStartCloseness.has(k)) return frozenPendingStartCloseness.get(k)
  const c = computePendingStartCloseness(task)
  frozenPendingStartCloseness.set(k, c)
  return c
}

const timelineDrag = {
  active: false,
  pointerId: null,
  startX: 0,
  startScrollLeft: 0,
}

function onTimelinePointerDown(e) {
  if (e.button !== 0) return
  if (e.target.closest('button, a, input, select, textarea, label')) return
  const el = timelineScrollRef.value
  if (!el) return
  timelineDrag.active = true
  timelineDrag.pointerId = e.pointerId
  timelineDrag.startX = e.clientX
  timelineDrag.startScrollLeft = el.scrollLeft
  try {
    el.setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
  el.classList.add('is-timeline-dragging')
}

function onTimelinePointerMove(e) {
  if (!timelineDrag.active || e.pointerId !== timelineDrag.pointerId) return
  const el = timelineScrollRef.value
  if (!el) return
  el.scrollLeft = timelineDrag.startScrollLeft - (e.clientX - timelineDrag.startX)
  e.preventDefault()
}

function onTimelinePointerUp(e) {
  if (!timelineDrag.active || e.pointerId !== timelineDrag.pointerId) return
  const el = timelineScrollRef.value
  const pid = e.pointerId
  timelineDrag.active = false
  timelineDrag.pointerId = null
  if (el) {
    try {
      el.releasePointerCapture(pid)
    } catch {
      /* ignore */
    }
    el.classList.remove('is-timeline-dragging')
  }
}

function onTimelineWheel(e) {
  if (e.shiftKey) return
  const el = timelineScrollRef.value
  if (!el) return
  if (el.scrollWidth <= el.clientWidth + 1) {
    onTimelineScrollExtend()
    return
  }
  const dx = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (dx === 0) return
  el.scrollLeft += dx
  e.preventDefault()
}

function resetTimelineScrollPaddings() {
  weekExtraDaysBefore.value = WEEK_PAD_INITIAL_DAYS
  weekExtraDaysAfter.value = WEEK_PAD_INITIAL_DAYS
  monthExtraDaysBefore.value = MONTH_PAD_INITIAL_DAYS
  monthExtraDaysAfter.value = MONTH_PAD_INITIAL_DAYS
}

function onTimelineScrollExtend() {
  const el = timelineScrollRef.value
  if (!el) return

  if (range.value === '周') {
    if (!timelineWeekStrip.value) return
    if (el.scrollWidth <= el.clientWidth + 2) {
      weekExtraDaysBefore.value += WEEK_SCROLL_EXTEND_DAYS
      weekExtraDaysAfter.value += WEEK_SCROLL_EXTEND_DAYS
      return
    }
    if (el.scrollLeft < SCROLL_EXTEND_EDGE_PX) {
      const prevW = el.scrollWidth
      const prevL = el.scrollLeft
      weekExtraDaysBefore.value += WEEK_SCROLL_EXTEND_DAYS
      nextTick(() => {
        const el2 = timelineScrollRef.value
        if (!el2) return
        el2.scrollLeft = prevL + (el2.scrollWidth - prevW)
      })
      return
    }
    if (el.scrollLeft + el.clientWidth > el.scrollWidth - SCROLL_EXTEND_EDGE_PX) {
      weekExtraDaysAfter.value += WEEK_SCROLL_EXTEND_DAYS
    }
    return
  }

  if (range.value === '月') {
    if (!timelineMonthPages.value.length) return
    if (el.scrollWidth <= el.clientWidth + 2) {
      monthExtraDaysBefore.value += MONTH_SCROLL_EXTEND_DAYS
      monthExtraDaysAfter.value += MONTH_SCROLL_EXTEND_DAYS
      return
    }
    if (el.scrollLeft < SCROLL_EXTEND_EDGE_PX) {
      const prevW = el.scrollWidth
      const prevL = el.scrollLeft
      monthExtraDaysBefore.value += MONTH_SCROLL_EXTEND_DAYS
      nextTick(() => {
        const el2 = timelineScrollRef.value
        if (!el2) return
        el2.scrollLeft = prevL + (el2.scrollWidth - prevW)
      })
      return
    }
    if (el.scrollLeft + el.clientWidth > el.scrollWidth - SCROLL_EXTEND_EDGE_PX) {
      monthExtraDaysAfter.value += MONTH_SCROLL_EXTEND_DAYS
    }
  }
}

function onTimelineScroll() {
  if (timelineScrollRaf) return
  timelineScrollRaf = requestAnimationFrame(() => {
    timelineScrollRaf = 0
    onTimelineScrollExtend()
  })
}

/** 内容比视口窄时多铺几段，否则无法触发横向滚动与边缘扩展 */
async function ensureTimelineHorizontallyScrollable() {
  for (let i = 0; i < 10; i++) {
    await nextTick()
    const el = timelineScrollRef.value
    if (!el) return
    if (el.scrollWidth > el.clientWidth + 2) return
    if (range.value === '周') {
      weekExtraDaysBefore.value += WEEK_SCROLL_EXTEND_DAYS
      weekExtraDaysAfter.value += WEEK_SCROLL_EXTEND_DAYS
    } else if (range.value === '月') {
      monthExtraDaysBefore.value += MONTH_SCROLL_EXTEND_DAYS
      monthExtraDaysAfter.value += MONTH_SCROLL_EXTEND_DAYS
    } else {
      return
    }
  }
}

function formatMdSlashFromYmd(ymd) {
  const p = String(ymd).split('-')
  if (p.length !== 3) return ymd
  return `${p[1].padStart(2, '0')}/${p[2].padStart(2, '0')}`
}

function daysInPeriodInclusive(periodStart, periodEnd) {
  return Math.max(1, dayOffsetFromChina(periodStart, periodEnd) + 1)
}

function layoutTracksForItems(items, totalDays) {
  items.sort((a, b) => a.ns - b.ns || a.ne - b.ne)
  const trackEnds = []
  const laidOut = []
  for (const it of items) {
    let track = -1
    for (let i = 0; i < trackEnds.length; i++) {
      if (it.ns > trackEnds[i]) {
        track = i
        trackEnds[i] = it.ne
        break
      }
    }
    if (track === -1) {
      track = trackEnds.length
      trackEnds.push(it.ne)
    }
    const widthDays = it.ne - it.ns + 1
    const leftPct = (it.ns / totalDays) * 100
    const widthPct = Math.max((widthDays / totalDays) * 100, 1.2)
    laidOut.push({
      ...it,
      track,
      leftPct,
      widthPct,
      topPx: track * TASK_TRACK_ROW_PX + TASK_SWIMLANE_PAD_PX,
    })
  }
  const trackCount = Math.max(1, trackEnds.length)
  return { laidOut, trackCount }
}

function buildLaidOutForPeriod(periodStart, periodEnd, taskArray) {
  const totalDays = daysInPeriodInclusive(periodStart, periodEnd)
  const items = []
  taskArray.forEach((task, i) => {
    const ts = parseYmdChina(task.startDate)
    const te = parseYmdChina(task.endDate)
    const clipS = ts < periodStart ? periodStart : ts
    const clipE = te > periodEnd ? periodEnd : te
    if (clipE < periodStart || clipS > periodEnd) return
    const ns = dayOffsetFromChina(periodStart, clipS)
    const ne = dayOffsetFromChina(periodStart, clipE)
    items.push({ task, key: `${task.title}-${i}`, ns, ne: Math.max(ns, ne) })
  })
  return layoutTracksForItems(items, totalDays)
}

function buildLaidOutForMonthPageMerged(mStart, mEnd, taskArray) {
  const { laidOut } = buildLaidOutForPeriod(mStart, mEnd, taskArray)
  const days = daysInPeriodInclusive(mStart, mEnd)
  const merged = laidOut
    .filter((it) => parseYmdChina(it.task.startDate) >= mStart)
    .map((it) => {
      const te = parseYmdChina(it.task.endDate)
      if (te <= mEnd) return it
      const neFull = dayOffsetFromChina(mStart, te)
      const widthPct = Math.max(((neFull - it.ns + 1) / days) * 100, 1.2)
      return { ...it, widthPct }
    })
  const maxTrack = merged.reduce((acc, it) => Math.max(acc, it.track), -1)
  const trackCount = Math.max(1, maxTrack + 1)
  return { laidOut: merged, trackCount }
}

const taskDateBounds = computed(() => {
  let min = null
  let max = null
  for (const t of props.tasks) {
    const a = parseYmdChina(t.startDate)
    const b = parseYmdChina(t.endDate)
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) continue
    if (!min || a < min) min = a
    if (!max || b > max) max = b
  }
  const today = parseYmdChina(chinaTodayYmd())
  if (!min || !max) return { min: today, max: today }
  return { min, max }
})

const timelineWeekStrip = computed(() => {
  const { min, max } = taskDateBounds.value
  if (!min || !max) return null

  const today = parseYmdChina(chinaTodayYmd())
  const rangeMin = addDaysChina(min, -weekExtraDaysBefore.value)
  const rangeMax = addDaysChina(max, weekExtraDaysAfter.value)

  const weekHeaders = []
  let wStart = startOfWeekMondayChina(rangeMin)
  const limit = startOfWeekMondayChina(rangeMax)
  while (wStart <= limit) {
    const wEnd = addDaysChina(wStart, 6)
    weekHeaders.push({
      snapKey: `w-${formatYmdChina(wStart)}`,
      start: wStart,
      end: wEnd,
      widthPx: WEEK_COLUMN_WIDTH_PX,
      titleLabel: `${formatMdSlashChina(wStart)} — ${formatMdSlashChina(wEnd)}`,
      containsToday: today >= wStart && today <= wEnd,
    })
    wStart = addDaysChina(wStart, 7)
  }
  if (weekHeaders.length === 0) return null

  const stripStart = weekHeaders[0].start
  const stripEnd = weekHeaders[weekHeaders.length - 1].end
  const totalDays = daysInPeriodInclusive(stripStart, stripEnd)
  const totalWidthPx = weekHeaders.length * WEEK_COLUMN_WIDTH_PX
  const { laidOut, trackCount } = buildLaidOutForPeriod(stripStart, stripEnd, props.tasks)
  let todayLinePct = null
  if (today >= stripStart && today <= stripEnd) {
    todayLinePct = (dayOffsetFromChina(stripStart, today) / totalDays) * 100
  }
  return {
    weekHeaders,
    stripStart,
    stripEnd,
    totalDays,
    totalWidthPx,
    laidOut,
    swimlaneHeightPx: Math.max(120, trackCount * TASK_TRACK_ROW_PX + TASK_SWIMLANE_PAD_PX * 2),
    todayLinePct,
  }
})

const timelineMonthPages = computed(() => {
  const { min, max } = taskDateBounds.value
  if (!min || !max) return []

  const today = parseYmdChina(chinaTodayYmd())
  const rangeMin = addDaysChina(min, -monthExtraDaysBefore.value)
  const rangeMax = addDaysChina(max, monthExtraDaysAfter.value)

  const list = []
  let mStart = startOfMonthChina(rangeMin)
  const endLimit = startOfMonthChina(rangeMax)
  while (mStart <= endLimit) {
    const mEnd = endOfMonthChina(mStart)
    const days = daysInPeriodInclusive(mStart, mEnd)
    const columns = []
    for (let i = 0; i < days; i++) {
      const d = addDaysChina(mStart, i)
      columns.push({
        datePart: formatMdSlashChina(d),
        weekdayPart: chinaWeekdayZhShort(d),
        isToday: formatYmdChina(d) === chinaTodayYmd(),
      })
    }
    const { laidOut, trackCount } = buildLaidOutForMonthPageMerged(mStart, mEnd, props.tasks)
    let todayLinePct = null
    if (today >= mStart && today <= mEnd) {
      todayLinePct = (dayOffsetFromChina(mStart, today) / days) * 100
    }
    list.push({
      snapKey: `m-${formatYmdChina(mStart).slice(0, 7)}`,
      start: mStart,
      end: mEnd,
      days,
      titleLabel: formatYearMonthTitleChina(mStart),
      columns,
      todayLinePct,
      laidOut,
      swimlaneHeightPx: Math.max(160, trackCount * TASK_TRACK_ROW_PX + TASK_SWIMLANE_PAD_PX * 2),
    })
    mStart = addDaysChina(endOfMonthChina(mStart), 1)
  }
  return list
})

function lerp(a, b, t) {
  return a + (b - a) * t
}

/** 未开始：边框 + 背景随「距开始日远近」同向渐变（颜色在首次展示时冻结） */
function timelineIncompleteBorderStyle(task) {
  if (task.status !== 'pending') return {}
  const c = getFrozenPendingStartCloseness(task)
  if (c == null) return {}
  const t = Math.min(1, Math.max(0, c))
  // 边框：越远越淡、越近越深
  const sat = Math.round(lerp(14, 96, t))
  const light = Math.round(lerp(94, 20, t))
  // 背景：同色相、略低饱和度、整体更亮，保证正文可读；近开始日蓝调更明显
  const satBg = Math.round(lerp(8, 72, t))
  const lightBg = Math.round(lerp(98, 72, t))
  return {
    borderColor: `hsl(217, ${sat}%, ${light}%)`,
    backgroundColor: `hsl(217, ${satBg}%, ${lightBg}%)`,
  }
}

function growWeekStripUntilTodayVisible(today) {
  for (let i = 0; i < 48; i++) {
    const strip = timelineWeekStrip.value
    if (!strip) return
    if (today >= strip.stripStart && today <= strip.stripEnd) return
    if (today < strip.stripStart) weekExtraDaysBefore.value += WEEK_SCROLL_EXTEND_DAYS
    else weekExtraDaysAfter.value += WEEK_SCROLL_EXTEND_DAYS
  }
}

function growMonthPagesUntilTodayVisible(today) {
  for (let i = 0; i < 48; i++) {
    const arr = timelineMonthPages.value
    if (!arr.length) return
    const idx = arr.findIndex((p) => today >= p.start && today <= p.end)
    if (idx >= 0) return
    const first = arr[0]
    const last = arr[arr.length - 1]
    if (today < first.start) monthExtraDaysBefore.value += MONTH_SCROLL_EXTEND_DAYS
    else if (today > last.end) monthExtraDaysAfter.value += MONTH_SCROLL_EXTEND_DAYS
    else return
  }
}

function scrollTimelineToTodayPeriod() {
  const el = timelineScrollRef.value
  if (!el) return
  const today = parseYmdChina(chinaTodayYmd())

  if (range.value === '周') {
    growWeekStripUntilTodayVisible(today)
    const strip = timelineWeekStrip.value
    if (!strip) return
    if (today < strip.stripStart || today > strip.stripEnd) return
    const dayIdx = dayOffsetFromChina(strip.stripStart, today)
    const todayPx = (dayIdx / strip.totalDays) * strip.totalWidthPx
    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
    const target = todayPx - el.clientWidth / 2
    el.scrollLeft = Math.max(0, Math.min(target, maxLeft))
    return
  }

  growMonthPagesUntilTodayVisible(today)
  const arr = timelineMonthPages.value
  if (!arr.length) return
  const idx = arr.findIndex((p) => today >= p.start && today <= p.end)
  if (idx < 0) return
  const child = el.children[idx]
  if (!child) return
  const period = arr[idx]
  const w = child.offsetWidth
  const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
  let centerX = w * 0.5
  if (period.todayLinePct != null) {
    centerX = (period.todayLinePct / 100) * w
  }
  const target = child.offsetLeft + centerX - el.clientWidth / 2
  el.scrollLeft = Math.max(0, Math.min(target, maxLeft))
}

watch(range, async () => {
  resetTimelineScrollPaddings()
  await nextTick()
  scrollTimelineToTodayPeriod()
  await ensureTimelineHorizontallyScrollable()
})

watch(
  () => props.recenterAt,
  async (n, prev) => {
    if (n === prev) return
    clearFrozenPendingColors()
    resetTimelineScrollPaddings()
    await nextTick()
    await ensureTimelineHorizontallyScrollable()
    await nextTick()
    scrollTimelineToTodayPeriod()
    await nextTick()
    scrollTimelineToTodayPeriod()
  },
)

watch(
  () => props.tasks,
  async () => {
    resetTimelineScrollPaddings()
    await nextTick()
    scrollTimelineToTodayPeriod()
    await ensureTimelineHorizontallyScrollable()
  },
  { deep: true },
)

onMounted(() => {
  nextTick(async () => {
    scrollTimelineToTodayPeriod()
    await ensureTimelineHorizontallyScrollable()
    const el = timelineScrollRef.value
    if (el) {
      el.addEventListener('wheel', onTimelineWheel, { passive: false })
      el.addEventListener('scroll', onTimelineScroll, { passive: true })
    }
  })
})

onBeforeUnmount(() => {
  const el = timelineScrollRef.value
  if (el) {
    el.removeEventListener('wheel', onTimelineWheel)
    el.removeEventListener('scroll', onTimelineScroll)
  }
})
</script>

<style scoped>
.timeline-snap-scroll {
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.timeline-snap-scroll::-webkit-scrollbar {
  display: none;
}

.timeline-snap-scroll--mouse {
  cursor: grab;
}
.timeline-snap-scroll--mouse.is-timeline-dragging {
  cursor: grabbing;
  user-select: none;
}
.timeline-snap-scroll--mouse.is-timeline-dragging .timeline-task-card {
  pointer-events: none;
}

.timeline-snap-scroll--continuous {
  scroll-snap-type: none;
}
</style>
