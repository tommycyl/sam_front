<template>
  <main class="mx-auto flex w-full max-w-[1400px] flex-col gap-stack-gap p-container-padding">
    <!-- Breadcrumb & Back -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2 text-on-surface-variant">
        <button
          type="button"
          class="group flex items-center gap-1 text-body-base text-on-surface-variant transition-colors hover:text-primary"
          @click="goBack"
        >
          <span
            class="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1"
          >arrow_back</span>
          返回
        </button>
        <span class="mx-2 text-outline">|</span>
        <nav class="flex items-center gap-2 text-body-sm">
          <router-link to="/teachers" class="hover:text-primary transition-colors">教师</router-link>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <span class="text-on-surface font-semibold">{{ teacher.name }}</span>
        </nav>
      </div>
    </div>

    <!-- Profile Header -->
    <section
      class="relative flex flex-col items-start gap-6 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 md:flex-row md:items-center"
    >
      <div
        class="pointer-events-none absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-surface-container-low to-transparent opacity-50"
      ></div>
      <div
        class="h-24 w-24 flex-shrink-0 rounded-full border border-outline-variant bg-surface p-1"
      >
        <img
          :alt="teacher.name"
          class="h-full w-full rounded-full object-cover"
          :src="teacher.avatar"
        />
      </div>
      <div class="relative flex-1">
        <div class="flex items-center gap-3">
          <h2 class="text-display-lg font-display-lg text-primary">{{ teacher.name }}</h2>
          <span
            class="rounded border border-secondary-fixed-dim bg-secondary-fixed px-2 py-0.5 text-label-caps font-label-caps text-on-secondary-fixed"
          >{{ teacher.title }}</span>
        </div>
      </div>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-grid-gutter md:grid-cols-2">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="group flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors hover:border-primary/50"
      >
        <div>
          <p class="mb-1 text-label-caps font-label-caps text-on-surface-variant">{{ card.label }}</p>
          <p class="text-display-lg font-display-lg text-primary">{{ card.value }}</p>
        </div>
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full transition-colors"
          :class="card.iconBg"
        >
          <span class="material-symbols-outlined" :class="card.iconText">{{ card.icon }}</span>
        </div>
      </div>
    </section>

    <!-- Assigned Students -->
    <section class="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <div
        class="flex items-center justify-between border-b border-outline-variant bg-surface-bright px-5 py-4"
      >
        <h3 class="text-headline-md font-headline-md text-primary">分配学生列表</h3>
        <button type="button" class="text-body-sm font-semibold text-secondary hover:underline">
          查看全部
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-outline-variant bg-surface-container-low">
              <th class="px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">姓名</th>
              <th class="px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">开始时间</th>
              <th class="min-w-[10rem] px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">
                任务进度
              </th>
              <th class="px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">状态</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant text-body-base text-on-surface">
            <tr
              v-for="s in students"
              :key="s.id"
              class="transition-colors hover:bg-surface-container-low/50"
            >
              <td class="px-5 py-3 font-semibold">{{ s.name }}</td>
              <td class="px-5 py-3 text-on-surface-variant">{{ s.startTime }}</td>
              <td class="px-5 py-3">
                <div class="flex min-w-[9rem] max-w-[14rem] items-center gap-2">
                  <div class="h-2 min-w-[4rem] flex-1 overflow-hidden rounded-full bg-surface-variant">
                    <div
                      class="h-full rounded-full transition-all"
                      :class="studentProgressBarClass(s)"
                      :style="{ width: `${Math.min(100, Math.max(0, s.taskProgress))}%` }"
                    ></div>
                  </div>
                  <span class="shrink-0 tabular-nums text-body-sm text-on-surface-variant">
                    {{ s.taskProgress }}%
                  </span>
                </div>
              </td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border"
                  :class="studentStatusClass(s.status)"
                >{{ studentStatusLabel(s.status) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 任务时间表（与学生详情相同交互：周连续条带 / 月分页横滑；周/月切换在时间表卡片内右上角） -->
    <h3 class="text-headline-md font-headline-md text-primary">任务时间表</h3>
    <TaskTimelinePanel v-model:range="range" :tasks="tasks" subtitle-kind="student" />

    <!-- 名下任务：名称、学生、时间 -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <h2 class="text-headline-md font-headline-md text-on-surface shrink-0">任务明细</h2>
          <div class="relative w-full min-w-[12rem] max-w-sm flex-1">
            <span
              class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
            >search</span>
            <input
              v-model.trim="taskDetailSearch"
              type="search"
              enterkeyhint="search"
              placeholder="按学生姓名筛选"
              class="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-3 text-body-sm text-on-surface placeholder:text-outline focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
            />
          </div>
        </div>
        <span class="shrink-0 text-body-sm text-on-surface-variant">
          <template v-if="taskDetailSearch">{{ filteredTasksForDetail.length }} / {{ tasks.length }}个</template>
          <template v-else>{{ tasks.length }}个</template>
        </span>
      </div>
      <div class="divide-y divide-surface-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div
          v-if="filteredTasksForDetail.length === 0"
          class="px-4 py-10 text-center text-body-sm text-on-surface-variant"
        >
          无匹配任务，请尝试其他关键词
        </div>
        <div
          v-for="t in filteredTasksForDetail"
          :key="t.title + (t.student || '') + t.startDate + 'row'"
          class="flex flex-wrap items-start gap-x-4 gap-y-2 p-4 md:grid md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,auto)] md:items-center md:gap-x-4 md:gap-y-0"
        >
          <div class="flex w-8 shrink-0 justify-center pt-0.5 md:pt-0">
            <div class="h-2 w-2 rounded-full" :class="t.dotColor"></div>
          </div>
          <div class="min-w-0 flex-1 basis-[140px] md:min-w-0 md:flex-none">
            <div class="text-sm font-bold leading-snug break-words" :class="t.status === 'delayed' ? 'text-error' : ''">
              {{ t.title }}
            </div>
          </div>
          <div class="min-w-0 w-full text-sm leading-snug text-on-surface-variant break-words sm:w-auto md:min-w-0 md:text-center">
            {{ t.student || '—' }}
          </div>
          <div class="min-w-0 w-full text-sm leading-snug text-on-surface-variant break-words sm:w-auto md:min-w-0 md:text-center">
            {{ t.startDate }} ~ {{ t.endDate }}
          </div>
          <div class="flex min-w-0 w-full justify-start sm:w-auto md:min-w-0 md:justify-center">
            <span
              class="rounded px-2 py-0.5 text-xs font-medium"
              :class="taskStatusBadgeClass(t)"
              :style="taskStatusBadgeStyle(t)"
            >{{ taskStatusLabel(t.status) }}</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import TaskTimelinePanel from '@/components/TaskTimelinePanel.vue'

const router = useRouter()
const props = defineProps({ id: { type: String, required: true } })

const range = ref('周')

const teacher = ref({
  id: props.id,
  name: 'Sarah Jenkins 博士',
  title: '高级教授',
  avatar: 'https://i.pravatar.cc/200?img=47',
})

const summaryCards = [
  {
    label: '分配学生',
    value: '42',
    icon: 'group',
    iconBg: 'bg-primary-fixed/30 group-hover:bg-primary-fixed',
    iconText: 'text-primary-container',
  },
  {
    label: '进行中任务',
    value: '8',
    icon: 'assignment',
    iconBg: 'bg-tertiary-fixed/30 group-hover:bg-tertiary-fixed',
    iconText: 'text-tertiary-container',
  },
]

const students = ref([
  { id: 'STU-24-001', name: '陈明 (Chen Ming)', startTime: '2026/03/01', status: 'normal', taskProgress: 72 },
  { id: 'STU-24-045', name: '李华 (Li Hua)', startTime: '2026/03/15', status: 'normal', taskProgress: 38 },
  { id: 'STU-23-112', name: '王晓 (Wang Xiao)', startTime: '2025/09/01', status: 'attention', taskProgress: 22 },
  { id: 'STU-24-089', name: '张伟 (Zhang Wei)', startTime: '2026/04/02', status: 'normal', taskProgress: 100 },
])

function studentStatusLabel(s) {
  return { normal: '正常', attention: '需关注' }[s] || s
}
function studentStatusClass(s) {
  return s === 'attention'
    ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim'
    : 'bg-surface-container-high text-on-surface border-outline-variant'
}

/** 与列表页任务进度条配色思路一致 */
function studentProgressBarClass(row) {
  if (row.status === 'attention') return 'bg-tertiary-container'
  const p = Number(row.taskProgress) || 0
  if (p >= 100) return 'bg-primary'
  if (p < 35) return 'bg-[#eab308]'
  return 'bg-secondary'
}

const tasks = ref([
  {
    title: '初步评估',
    student: '陈明 (Chen Ming)',
    dotColor: 'bg-secondary',
    startDate: '2026-04-06',
    endDate: '2026-04-10',
    status: 'in_progress',
    barClass: 'border-secondary bg-secondary/10 text-secondary',
    dateShort: '4/6~4/10',
  },
  {
    title: '推荐信',
    student: '李华 (Li Hua)',
    dotColor: 'bg-primary',
    startDate: '2026-04-01',
    endDate: '2026-04-05',
    status: 'completed',
    barClass: 'border-primary bg-primary/10 text-primary',
    dateShort: '4/1~4/5',
  },
  {
    title: '文书初稿',
    student: '王晓 (Wang Xiao)',
    dotColor: 'bg-error',
    startDate: '2026-03-25',
    endDate: '2026-03-30',
    status: 'delayed',
    barClass: 'border-error bg-error/10 text-error',
    dateShort: '3/25~3/30',
  },
  {
    title: '材料补充说明',
    student: '陈明 (Chen Ming)',
    dotColor: 'bg-[#7e57c2]',
    startDate: '2026-04-25',
    endDate: '2026-05-10',
    status: 'in_progress',
    barClass: 'border-[#7e57c2] bg-[#7e57c2]/15 text-[#5e35b1]',
    dateShort: '4/25~5/10',
  },
  {
    title: '网申提交',
    student: '张伟 (Zhang Wei)',
    dotColor: 'bg-[#2196F3]',
    startDate: '2026-05-26',
    endDate: '2026-06-05',
    status: 'pending',
    barClass: 'border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
    dateShort: '5/26~6/5',
  },
])

/** 任务明细列表：按学生姓名模糊筛选（中英文不区分大小写） */
const taskDetailSearch = ref('')
const filteredTasksForDetail = computed(() => {
  const raw = taskDetailSearch.value.trim()
  if (!raw) return tasks.value
  const q = raw.toLowerCase()
  return tasks.value.filter((t) => String(t.student || '').toLowerCase().includes(q))
})

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function parseYmdLocal(ymd) {
  const [y, m, d] = String(ymd).split('-').map(Number)
  return startOfDay(new Date(y, m - 1, d))
}

function dayOffsetFrom(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000)
}

function taskStatusLabel(s) {
  return {
    completed: '已完成',
    delayed: '延期',
    in_progress: '进行中',
    pending: '未开始',
  }[s] || s
}

function incompleteStartCloseness(task) {
  if (task?.status !== 'pending' || !task?.startDate) return 0
  const today = startOfDay(new Date())
  const start = parseYmdLocal(task.startDate)
  const daysUntil = dayOffsetFrom(today, start)
  if (daysUntil > 21) return 0
  if (daysUntil <= 0) return 1
  return 1 - daysUntil / 21
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function incompleteBadgeStyleFromCloseness(c) {
  const t = Math.min(1, Math.max(0, c))
  const bg = `hsl(${lerp(214, 220, t)}, ${lerp(32, 86, t)}%, ${lerp(94, 40, t)}%)`
  const fg = `hsl(218, ${lerp(16, 92, t)}%, ${lerp(38, 99, t)}%)`
  const br = `hsl(217, ${lerp(28, 72, t)}%, ${lerp(86, 30, t)}%)`
  return {
    backgroundColor: bg,
    color: fg,
    borderColor: br,
    borderWidth: '1px',
    borderStyle: 'solid',
  }
}

function taskStatusBadgeClass(task) {
  const s = task.status
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'delayed') return 'border border-[#fde047] bg-[#fef9c3] text-[#854d0e]'
  if (s === 'in_progress') return 'border border-[#2563eb] bg-[#bfdbfe] text-[#1d4ed8]'
  if (s === 'pending') return ''
  return 'border border-outline-variant bg-surface-container-high text-on-surface-variant'
}

function taskStatusBadgeStyle(task) {
  if (task.status !== 'pending') return {}
  return incompleteBadgeStyleFromCloseness(incompleteStartCloseness(task))
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/teachers')
}
</script>
