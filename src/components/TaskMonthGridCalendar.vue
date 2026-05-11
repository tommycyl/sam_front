<template>
  <section
    class="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm"
  >
    <!-- 顶栏：月导航（中间为当前浏览月份，非「今天」） -->
    <div class="flex flex-wrap items-center justify-center gap-3 border-b border-surface-variant bg-surface-container-low/30 px-4 py-3">
      <div class="flex shrink-0 items-center gap-1 rounded-lg border border-outline-variant/80 bg-surface-container-lowest px-0.5 py-0.5">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          aria-label="上一月"
          @click="shiftMonth(-1)"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        <span
          class="min-w-[6.5rem] select-none px-2 py-1 text-center text-sm font-bold tabular-nums text-on-surface sm:min-w-[7.5rem] sm:text-base"
          aria-live="polite"
        >
          {{ titleYmd }}
        </span>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
          aria-label="下一月"
          @click="shiftMonth(1)"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>

    <!-- 星期表头 -->
    <div class="grid grid-cols-7 border-b border-surface-variant bg-surface-container-low/50 text-center text-xs font-semibold text-on-surface-variant sm:text-sm">
      <div v-for="w in weekLabels" :key="w" class="border-r border-surface-variant/60 py-2 last:border-r-0">
        {{ w }}
      </div>
    </div>

    <!-- 按周：同一「日历框」内 — 上为日期，下为叠在同一格区域内的跨列任务条（无单独泳道行） -->
    <div class="bg-surface-container-lowest">
      <div
        v-for="(week, wi) in calendarWeeks"
        :key="wi"
        class="relative flex min-h-0 flex-col border-b border-surface-variant/80 last:border-b-0"
        :style="{ minHeight: week.weekMinHeightPx + 'px' }"
      >
        <div
          class="grid min-h-0 flex-1 auto-rows-[minmax(0,1fr)] grid-cols-7 divide-x divide-surface-variant/70 bg-surface-container-lowest"
        >
          <div
            v-for="(cell, di) in week.cells"
            :key="di"
            class="relative z-20 flex min-h-0 h-full flex-col px-1.5 pb-1 pt-1.5"
            :class="cell.inMonth ? '' : 'bg-surface-container-low/50'"
          >
            <div class="flex shrink-0 items-start justify-between gap-1">
              <span
                v-if="cell.cornerLeft"
                class="max-w-[48%] truncate text-[10px] leading-tight text-on-surface-variant/70 sm:text-[11px]"
              >
                {{ cell.cornerLeft }}
              </span>
              <span v-else class="max-w-[48%]" aria-hidden="true"></span>
              <span
                class="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full text-xs font-bold tabular-nums sm:text-sm"
                :class="
                  cell.isToday
                    ? 'bg-[#c62828] text-white shadow-sm'
                    : cell.inMonth
                      ? 'text-on-surface'
                      : 'text-on-surface-variant/60'
                "
              >
                {{ cell.dayNum }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 z-10"
          :style="{ top: DATE_STRIP_PX + 'px' }"
        >
          <div
            v-for="seg in week.segments"
            :key="seg.key"
            class="calendar-task-bar pointer-events-auto absolute box-border truncate border px-2 text-[10px] font-semibold leading-[16px] sm:text-[11px]"
            :class="[seg.barClass, segmentRadiusClass(seg)]"
            :title="seg.title"
            :style="segmentStyle(seg)"
          >
            {{ seg.title }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import {
  addDaysChina,
  chinaGetDaySun0,
  chinaTodayFirstOfMonthDate,
  chinaTodayYmd,
  dayOffsetFromChina,
  endOfMonthChina,
  formatYearMonthTitleChina,
  formatYmdChina,
  parseYmdChina,
  shiftMonthYmd,
} from '@/utils/chinaTime'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
})

const monthCursor = ref(chinaTodayFirstOfMonthDate())
const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const BAR_H = 18
const BAR_GAP = 3
const LANE_PAD = 6
/** 每格顶部留给日期的区域高度；任务条叠放在其下、仍在同一周方框内 */
const DATE_STRIP_PX = 40
/** 无任务或任务很少时，每周任务区仍保留的最小高度，略拉高月历整体 */
const MIN_WEEK_BODY_PX = 48

function dayIndexFrom(a, b) {
  return dayOffsetFromChina(a, b)
}

const titleYmd = computed(() => formatYearMonthTitleChina(monthCursor.value))

function shiftMonth(delta) {
  const ymd = formatYmdChina(monthCursor.value)
  monthCursor.value = parseYmdChina(shiftMonthYmd(ymd, delta))
}

/** 占满列宽，不在列与列之间留缝，视觉上连成一条 */
function segmentStyle(seg) {
  const colPct = 100 / 7
  return {
    left: `${seg.startCol * colPct}%`,
    width: `${seg.span * colPct}%`,
    top: `${LANE_PAD + seg.lane * (BAR_H + BAR_GAP)}px`,
    height: `${BAR_H}px`,
  }
}

/** 仅在本段为任务真实起点/终点时圆角，跨周截断的一侧为直角以贴合格线 */
function segmentRadiusClass(seg) {
  const r = []
  if (!seg.clipStart) r.push('rounded-l-md')
  if (!seg.clipEnd) r.push('rounded-r-md')
  return r.join(' ')
}

function assignLanes(segments) {
  const sorted = [...segments].sort((a, b) => {
    if (a.startCol !== b.startCol) return a.startCol - b.startCol
    return b.span - a.span
  })
  const laneEndCol = []
  for (const seg of sorted) {
    let placed = false
    for (let L = 0; L < laneEndCol.length; L++) {
      if (laneEndCol[L] < seg.startCol) {
        laneEndCol[L] = seg.endCol
        seg.lane = L
        placed = true
        break
      }
    }
    if (!placed) {
      laneEndCol.push(seg.endCol)
      seg.lane = laneEndCol.length - 1
    }
  }
}

const calendarWeeks = computed(() => {
  const anchorYmd = formatYmdChina(monthCursor.value)
  const y = Number(anchorYmd.slice(0, 4))
  const viewMonth = Number(anchorYmd.slice(5, 7))
  const first = parseYmdChina(`${String(y).padStart(4, '0')}-${String(viewMonth).padStart(2, '0')}-01`)
  const lead = chinaGetDaySun0(first)
  const lastDayYmd = formatYmdChina(endOfMonthChina(first))
  const lastDay = Number(lastDayYmd.slice(8, 10))
  const gridStart = addDaysChina(first, -lead)
  const totalDays = Math.ceil((lead + lastDay) / 7) * 7
  const today = chinaTodayYmd()

  const tasksPrepared = props.tasks
    .map((t) => ({
      raw: t,
      s: parseYmdChina(t.startDate),
      e: parseYmdChina(t.endDate),
      id: t.id ?? t.title,
      title: String(t.title || '任务'),
      barClass: t.barClass || 'border-outline-variant bg-surface-container-high text-on-surface',
    }))
    .filter((x) => x.s && x.e && !Number.isNaN(x.s.getTime()) && !Number.isNaN(x.e.getTime()) && x.e >= x.s)

  const weeks = []
  const numWeeks = totalDays / 7

  for (let w = 0; w < numWeeks; w++) {
    const cells = []
    for (let d = 0; d < 7; d++) {
      const i = w * 7 + d
      const dd = addDaysChina(gridStart, i)
      const ddYmd = formatYmdChina(dd)
      const cellMonth = Number(ddYmd.slice(5, 7))
      const cellDay = Number(ddYmd.slice(8, 10))
      cells.push({
        dayNum: cellDay,
        inMonth: cellMonth === viewMonth,
        isToday: ddYmd === today,
        cornerLeft: cellMonth !== viewMonth ? `${cellMonth}/${cellDay}` : '',
      })
    }

    const weekStart = addDaysChina(gridStart, w * 7)
    const weekEnd = addDaysChina(weekStart, 6)

    const segments = []
    for (const t of tasksPrepared) {
      if (t.e < weekStart || t.s > weekEnd) continue
      const segStart = t.s > weekStart ? t.s : weekStart
      const segEnd = t.e < weekEnd ? t.e : weekEnd
      const startCol = dayIndexFrom(weekStart, segStart)
      const endCol = dayIndexFrom(weekStart, segEnd)
      if (startCol < 0 || endCol > 6 || startCol > endCol) continue
      const span = endCol - startCol + 1
      const clipStart = t.s < weekStart
      const clipEnd = t.e > weekEnd
      segments.push({
        key: `${t.id}-w${w}`,
        startCol,
        endCol,
        span,
        title: t.title,
        barClass: t.barClass,
        clipStart,
        clipEnd,
        lane: 0,
      })
    }

    assignLanes(segments)
    const laneCount = segments.length ? Math.max(...segments.map((s) => s.lane)) + 1 : 0
    const lanePx = laneCount > 0 ? LANE_PAD * 2 + laneCount * BAR_H + (laneCount - 1) * BAR_GAP : 0
    const bodyPx = Math.max(lanePx, MIN_WEEK_BODY_PX)
    const weekMinHeightPx = DATE_STRIP_PX + bodyPx

    weeks.push({ cells, segments, lanePx, weekMinHeightPx })
  }

  return weeks
})
</script>

<style scoped>
/* 横条在格线内铺满，避免 border 把相邻视觉「断开」——用内阴影描边感 */
.calendar-task-bar {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
</style>
