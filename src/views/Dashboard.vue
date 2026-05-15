<template>
  <div class="min-h-full bg-background p-container-padding">
    <div class="mx-auto max-w-[1400px] space-y-6">
      <h2 class="text-headline-md font-headline-md text-primary">首页概览</h2>

      <!-- 1. Overview stat cards -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="card in overviewCards"
          :key="card.key"
          class="relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="absolute -right-3 -top-3 opacity-[0.07]">
            <span class="material-symbols-outlined text-[72px]" :class="card.iconColor">{{ card.icon }}</span>
          </div>
          <p class="text-body-sm text-on-surface-variant">{{ card.label }}</p>
          <p class="mt-2 text-3xl font-bold tabular-nums" :class="card.textColor">{{ card.value }}</p>
          <p v-if="overview.total" class="mt-1 text-xs text-on-surface-variant">
            占比 {{ ((card.value / overview.total) * 100).toFixed(1) }}%
          </p>
        </div>
      </div>

      <!-- 2. Charts row -->
      <div class="grid gap-6 lg:grid-cols-5">
        <!-- Bar chart: last 3 months -->
        <div class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm lg:col-span-3">
          <h3 class="mb-6 text-base font-bold text-on-surface">近三个月任务趋势</h3>
          <div v-if="monthly.length" class="flex items-end gap-6">
            <div
              v-for="m in monthly"
              :key="m.month"
              class="flex flex-1 flex-col items-center gap-2"
            >
              <div class="flex w-full items-end justify-center gap-1" style="height: 180px">
                <div
                  v-for="bar in getMonthBars(m)"
                  :key="bar.status"
                  class="relative w-5 min-w-[20px] rounded-t-md transition-all duration-500"
                  :class="bar.bgClass"
                  :style="{ height: bar.heightPx + 'px' }"
                  :title="`${bar.label}: ${bar.value}`"
                >
                  <span
                    v-if="bar.value > 0"
                    class="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold tabular-nums text-on-surface-variant"
                  >{{ bar.value }}</span>
                </div>
              </div>
              <span class="text-xs font-medium text-on-surface-variant">{{ formatMonth(m.month) }}</span>
            </div>
          </div>
          <p v-else class="py-10 text-center text-body-sm text-on-surface-variant">暂无数据</p>
          <!-- Legend -->
          <div class="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1">
            <span v-for="l in barLegend" :key="l.label" class="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span class="inline-block h-2.5 w-2.5 rounded-sm" :class="l.bgClass"></span>
              {{ l.label }}
            </span>
          </div>
        </div>

        <!-- Pie chart: overall proportion -->
        <div class="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <h3 class="mb-6 self-start text-base font-bold text-on-surface">任务状态分布</h3>
          <div
            ref="pieChartRef"
            class="relative"
            @mouseleave="onPieChartLeave"
          >
            <svg viewBox="0 0 200 200" class="pie-chart-svg h-48 w-48 overflow-visible">
              <template v-if="overview.total">
                <g
                  v-for="slice in pieSlices"
                  :key="slice.key"
                  :style="{
                    transform: pieHoveredKey === slice.key ? 'scale(1.09)' : 'scale(1)',
                    transformBox: 'view-box',
                    transformOrigin: '50% 50%',
                    transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }"
                >
                  <path
                    :d="slice.path"
                    :fill="slice.color"
                    stroke="currentColor"
                    class="text-surface-container-lowest"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                    @mouseenter="onPieSliceEnter(slice, $event)"
                    @mousemove="onPieSliceMove($event)"
                  />
                </g>
              </template>
              <circle
                v-else
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e0e3e5"
                stroke-width="32"
              />
            </svg>
            <div
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            >
              <span class="text-2xl font-bold text-on-surface tabular-nums">{{ overview.total }}</span>
              <span class="text-xs text-on-surface-variant">总任务</span>
            </div>
            <div
              v-if="pieTooltip"
              class="pointer-events-none absolute z-20 max-w-[200px] rounded-lg border border-outline-variant bg-inverse-surface px-3 py-2 text-inverse-on-surface shadow-modal"
              :style="{ left: pieTooltip.left + 'px', top: pieTooltip.top + 'px' }"
            >
              <div class="text-xs font-semibold">{{ pieTooltip.label }}</div>
              <div class="mt-0.5 text-sm font-bold tabular-nums">{{ pieTooltip.pctText }}</div>
              <div class="mt-0.5 text-[11px] opacity-80">共 {{ pieTooltip.count }} 条</div>
            </div>
          </div>
          <div class="mt-5 grid w-full grid-cols-2 gap-x-4 gap-y-2">
            <div
              v-for="item in pieLegend"
              :key="item.label"
              class="flex items-center gap-2 text-xs"
            >
              <span class="inline-block h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
              <span class="text-on-surface-variant">{{ item.label }}</span>
              <span class="ml-auto font-semibold tabular-nums text-on-surface">{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Upcoming overdue tasks -->
      <div class="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h3 class="mb-4 text-base font-bold text-on-surface">近期延期风险任务</h3>
        <p class="mb-4 text-xs text-on-surface-variant">展示截止日期在 7 天内且尚未完成的任务，最多 10 条</p>
        <div v-if="urgent.length" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-surface-variant text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                <th class="whitespace-nowrap px-4 py-3">任务名称</th>
                <th class="whitespace-nowrap px-4 py-3">所属学生</th>
                <th class="whitespace-nowrap px-4 py-3">起止日期</th>
                <th class="whitespace-nowrap px-4 py-3">状态</th>
                <th class="whitespace-nowrap px-4 py-3 text-right">剩余天数</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in urgent"
                :key="t.id"
                class="border-b border-surface-variant/60 transition-colors last:border-b-0 hover:bg-surface-container-low/40"
              >
                <td class="whitespace-nowrap px-4 py-3 font-medium text-on-surface">{{ t.title }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-on-surface-variant">
                  <router-link
                    v-if="t.studentId"
                    :to="`/students/${t.studentId}`"
                    class="text-primary underline-offset-2 hover:underline"
                  >{{ t.studentName }}</router-link>
                  <span v-else>{{ t.studentName }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-on-surface-variant tabular-nums">
                  {{ formatDateRange(t.startDate, t.endDate) }}
                </td>
                <td class="whitespace-nowrap px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="statusBadgeClass(t.status)"
                  >{{ statusLabel(t.status) }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums" :class="daysLeftColor(t.daysLeft)">
                  {{ t.daysLeft != null ? (t.daysLeft >= 0 ? t.daysLeft + ' 天' : '已超 ' + Math.abs(t.daysLeft) + ' 天') : '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="flex flex-col items-center py-10 text-on-surface-variant">
          <span class="material-symbols-outlined mb-2 text-4xl opacity-40">check_circle</span>
          <p class="text-body-sm">暂无延期风险任务，一切顺利！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { fetchDashboardStats } from '@/api/dashboard'

const overview = ref({ total: 0, pending: 0, inProgress: 0, completed: 0, delayed: 0 })
const monthly = ref([])
const urgent = ref([])

const pieChartRef = ref(null)
const pieHoveredKey = ref(null)
const pieTooltip = ref(null)

onMounted(async () => {
  try {
    const data = await fetchDashboardStats()
    overview.value = data.overview || overview.value
    monthly.value = data.monthly || []
    urgent.value = data.urgent || []
  } catch {
    /* global interceptor handles */
  }
})

const overviewCards = computed(() => [
  { key: 'pending', label: '未开始', value: overview.value.pending, icon: 'schedule', iconColor: 'text-[#2196F3]', textColor: 'text-[#2196F3]' },
  { key: 'inProgress', label: '进行中', value: overview.value.inProgress, icon: 'play_circle', iconColor: 'text-[#9C27B0]', textColor: 'text-[#9C27B0]' },
  { key: 'completed', label: '已完成', value: overview.value.completed, icon: 'check_circle', iconColor: 'text-[#4CAF50]', textColor: 'text-[#4CAF50]' },
  { key: 'delayed', label: '逾期', value: overview.value.delayed, icon: 'error', iconColor: 'text-error', textColor: 'text-error' },
])

const barLegend = [
  { label: '未开始', bgClass: 'bg-[#2196F3]' },
  { label: '进行中', bgClass: 'bg-[#9C27B0]' },
  { label: '已完成', bgClass: 'bg-[#4CAF50]' },
  { label: '逾期', bgClass: 'bg-error' },
]

function getMonthBars(m) {
  const maxVal = Math.max(
    ...monthly.value.flatMap((mo) => [mo.pending, mo.inProgress, mo.completed, mo.delayed]),
    1,
  )
  const scale = (v) => Math.max(v > 0 ? 8 : 0, (v / maxVal) * 160)
  return [
    { status: 'pending', label: '未开始', value: m.pending, bgClass: 'bg-[#2196F3]', heightPx: scale(m.pending) },
    { status: 'inProgress', label: '进行中', value: m.inProgress, bgClass: 'bg-[#9C27B0]', heightPx: scale(m.inProgress) },
    { status: 'completed', label: '已完成', value: m.completed, bgClass: 'bg-[#4CAF50]', heightPx: scale(m.completed) },
    { status: 'delayed', label: '逾期', value: m.delayed, bgClass: 'bg-error', heightPx: scale(m.delayed) },
  ]
}

function formatMonth(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m)}月`
}

const PIE_COLORS = { pending: '#2196F3', inProgress: '#9C27B0', completed: '#4CAF50', delayed: '#E53935' }
const PIE_LABELS = { pending: '未开始', inProgress: '进行中', completed: '已完成', delayed: '逾期' }

/** 环形扇区路径：内半径 64、外半径 96（与原 stroke r=80、宽 32 一致），从顶部顺时针 */
function donutSlicePath(cx, cy, rInner, rOuter, a0, a1) {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0
  const xos = cx + rOuter * Math.cos(a0)
  const yos = cy + rOuter * Math.sin(a0)
  const xoe = cx + rOuter * Math.cos(a1)
  const yoe = cy + rOuter * Math.sin(a1)
  const xie = cx + rInner * Math.cos(a1)
  const yie = cy + rInner * Math.sin(a1)
  const xis = cx + rInner * Math.cos(a0)
  const yis = cy + rInner * Math.sin(a0)
  return `M ${xos} ${yos} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${xoe} ${yoe} L ${xie} ${yie} A ${rInner} ${rInner} 0 ${largeArc} 0 ${xis} ${yis} Z`
}

const pieSlices = computed(() => {
  const t = overview.value.total
  if (!t) return []
  const order = ['pending', 'inProgress', 'completed', 'delayed']
  const slices = []
  let angle = -Math.PI / 2
  for (const key of order) {
    const val = overview.value[key] || 0
    if (val <= 0) continue
    const sliceAngle = (val / t) * 2 * Math.PI
    const a0 = angle
    const a1 = angle + sliceAngle
    const pct = (val / t) * 100
    slices.push({
      key,
      label: PIE_LABELS[key] || key,
      value: val,
      color: PIE_COLORS[key],
      pct,
      pctText: `${pct.toFixed(1)}%`,
      path: donutSlicePath(100, 100, 64, 96, a0, a1),
    })
    angle = a1
  }
  return slices
})

function clampTooltipPosition(clientX, clientY) {
  const wrap = pieChartRef.value
  if (!wrap) return { left: 0, top: 0 }
  const rect = wrap.getBoundingClientRect()
  const pad = 12
  const tw = 200
  const th = 72
  let left = clientX - rect.left + pad
  let top = clientY - rect.top + pad
  if (left + tw > rect.width) left = rect.width - tw - 8
  if (top + th > rect.height) top = clientY - rect.top - th - 8
  left = Math.max(8, left)
  top = Math.max(8, top)
  return { left, top }
}

function onPieSliceEnter(slice, evt) {
  pieHoveredKey.value = slice.key
  const { left, top } = clampTooltipPosition(evt.clientX, evt.clientY)
  pieTooltip.value = {
    label: slice.label,
    pctText: slice.pctText,
    count: slice.value,
    left,
    top,
  }
}

function onPieSliceMove(evt) {
  if (!pieTooltip.value) return
  const { left, top } = clampTooltipPosition(evt.clientX, evt.clientY)
  pieTooltip.value = { ...pieTooltip.value, left, top }
}

function onPieChartLeave() {
  pieHoveredKey.value = null
  pieTooltip.value = null
}

const pieLegend = computed(() => [
  { label: '未开始', color: PIE_COLORS.pending, value: overview.value.pending },
  { label: '进行中', color: PIE_COLORS.inProgress, value: overview.value.inProgress },
  { label: '已完成', color: PIE_COLORS.completed, value: overview.value.completed },
  { label: '逾期', color: PIE_COLORS.delayed, value: overview.value.delayed },
])

function formatDateRange(s, e) {
  const fmt = (d) => {
    if (!d) return ''
    const p = d.split('-')
    return p.length === 3 ? `${p[1]}/${p[2]}` : d
  }
  return `${fmt(s)} ~ ${fmt(e)}`
}

function statusLabel(s) {
  return { pending: '未开始', in_progress: '进行中', completed: '已完成', delayed: '逾期' }[s] || s
}

function statusBadgeClass(s) {
  return {
    pending: 'bg-[#2196F3]/10 text-[#2196F3]',
    in_progress: 'bg-[#9C27B0]/10 text-[#9C27B0]',
    completed: 'bg-[#4CAF50]/10 text-[#4CAF50]',
    delayed: 'bg-error/10 text-error',
  }[s] || 'bg-surface-container text-on-surface-variant'
}

function daysLeftColor(d) {
  if (d == null) return 'text-on-surface-variant'
  if (d < 0) return 'text-error'
  if (d <= 2) return 'text-error'
  if (d <= 5) return 'text-[#F57C00]'
  return 'text-on-surface-variant'
}
</script>

<style scoped>
.pie-chart-svg path {
  cursor: pointer;
}
</style>
