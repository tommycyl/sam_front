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

    <!-- 任务时间表：时间轴 / 月历（与学生详情一致；数据为该老师名下任务） -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="text-headline-md font-headline-md text-primary">任务时间表</h3>
      <button
        type="button"
        class="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm font-medium text-on-surface transition-colors hover:border-primary hover:text-primary"
        :aria-pressed="scheduleViewMode === 'calendar'"
        @click="toggleScheduleView"
      >
        <span class="material-symbols-outlined text-[18px]">
          {{ scheduleViewMode === 'timeline' ? 'calendar_month' : 'view_agenda' }}
        </span>
        {{ scheduleViewMode === 'timeline' ? '月历表' : '时间轴' }}
      </button>
    </div>
    <TaskTimelinePanel
      v-if="scheduleViewMode === 'timeline'"
      v-model:range="range"
      :tasks="tasksForTimeline"
      subtitle-kind="student"
      :schedule-heading="teacherTimelineScheduleTitle"
    />
    <TaskMonthGridCalendar v-else :tasks="tasksForTimeline" />

    <!-- 名下任务：名称、学生、时间 -->
    <section class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-headline-md font-headline-md text-on-surface shrink-0">任务明细</h2>
        <div class="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-3">
          <div
            class="inline-flex shrink-0 rounded-lg border border-outline-variant bg-surface-container-low p-0.5"
            role="group"
            aria-label="任务明细筛选"
          >
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-body-sm font-semibold transition-colors"
              :class="
                taskDetailFilter === 'all'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              "
              @click="setTaskDetailFilter('all')"
            >
              全部任务
            </button>
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-body-sm font-semibold transition-colors"
              :class="
                taskDetailFilter === 'long_term'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              "
              @click="setTaskDetailFilter('long_term')"
            >
              长期任务
            </button>
          </div>
          <div class="relative w-full min-w-[12rem] max-w-sm sm:w-auto sm:flex-1 sm:basis-[14rem]">
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
          <span class="shrink-0 text-body-sm text-on-surface-variant">
            <template v-if="taskDetailFilter === 'all'">
              <template v-if="taskDetailSearch">{{ filteredTasksForDetail.length }} / {{ tasks.length }} 个</template>
              <template v-else>{{ tasks.length }} 个</template>
            </template>
            <template v-else>
              <template v-if="taskDetailSearch">
                {{ filteredTasksForDetail.length }} / {{ longTermCount }} 个
              </template>
              <template v-else>{{ longTermCount }} / {{ tasks.length }} 个</template>
            </template>
          </span>
        </div>
      </div>
      <div class="divide-y divide-surface-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div
          v-if="filteredTasksForDetail.length === 0"
          class="px-4 py-10 text-center text-body-sm text-on-surface-variant"
        >
          {{ taskDetailEmptyHint }}
        </div>
        <div
          v-for="t in filteredTasksForDetail"
          :key="t.id || (t.title + (t.student || '') + t.startDate + 'row')"
          class="flex flex-wrap items-start gap-x-4 gap-y-2 p-4 md:grid md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,auto)] md:items-center md:gap-x-4 md:gap-y-0"
        >
          <div class="flex w-8 shrink-0 justify-center pt-0.5 md:pt-0">
            <div class="h-2 w-2 rounded-full" :class="t.dotColor"></div>
          </div>
          <div class="min-w-0 flex-1 basis-[140px] md:min-w-0 md:flex-none">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-sm font-bold leading-snug break-words" :class="t.status === 'delayed' ? 'text-error' : ''">
                {{ t.title }}
              </span>
              <span
                v-if="isLongTermTask(t)"
                class="shrink-0 rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant"
              >长期</span>
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import TaskTimelinePanel from '@/components/TaskTimelinePanel.vue'
import TaskMonthGridCalendar from '@/components/TaskMonthGridCalendar.vue'
import {
  fetchTeacherDetail,
  fetchTeacherStudents,
  fetchTeacherTasks,
} from '@/api/teacher'
import { isLongTermFlag, normalizeTaskRow } from '@/utils/taskFlags'

const router = useRouter()
const props = defineProps({ id: { type: String, required: true } })

const range = ref('周')
/** timeline：泳道时间表；calendar：月历网格 */
const scheduleViewMode = ref('timeline')
function toggleScheduleView() {
  scheduleViewMode.value = scheduleViewMode.value === 'timeline' ? 'calendar' : 'timeline'
}

const teacher = ref({
  id: props.id,
  name: '',
  title: '',
  avatar: '',
})

/** 时间表顶栏：老师姓名 +「时间表」 */
const teacherTimelineScheduleTitle = computed(() => {
  const n = String(teacher.value?.name || '').trim()
  return n ? `${n} 时间表` : '时间表'
})

const summaryStats = ref({
  studentCount: 0,
  inProgressCount: 0,
})

const summaryCards = computed(() => [
  {
    label: '分配学生',
    value: String(summaryStats.value.studentCount ?? 0),
    icon: 'group',
    iconBg: 'bg-primary-fixed/30 group-hover:bg-primary-fixed',
    iconText: 'text-primary-container',
  },
  {
    label: '进行中任务',
    value: String(summaryStats.value.inProgressCount ?? 0),
    icon: 'assignment',
    iconBg: 'bg-tertiary-fixed/30 group-hover:bg-tertiary-fixed',
    iconText: 'text-tertiary-container',
  },
])

const ROLE_TITLE = {
  PM: 'PM',
  MENTOR: 'MENTOR',
  PM_MENTOR: 'PM & MENTOR',
  MID_PLATFORM: '中台',
}

function avatarFallback(name) {
  const trimmed = String(name || '').trim()
  if (!trimmed) return ''
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(trimmed)}`
}

const students = ref([])
const tasks = ref([])

function isLongTermTask(t) {
  return isLongTermFlag(t)
}

const tasksForTimeline = computed(() => tasks.value.filter((t) => !isLongTermTask(t)))

async function loadTeacher() {
  try {
    const data = await fetchTeacherDetail(props.id)
    if (data) {
      teacher.value = {
        id: data.id,
        name: data.name || '',
        title: data.title || ROLE_TITLE[data.role] || '老师',
        avatar: data.avatar || avatarFallback(data.name),
      }
      summaryStats.value = {
        studentCount: data.studentCount ?? 0,
        inProgressCount: data.inProgressCount ?? 0,
      }
    }
  } catch {
    /* request 拦截器已弹错误 */
  }
}

async function loadStudents() {
  try {
    const data = await fetchTeacherStudents(props.id)
    const list = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []
    students.value = list.map((s) => ({
      id: s.id,
      name: s.name,
      startTime: (s.startTime || '').replace(/-/g, '/'),
      status: s.status || 'normal',
      taskProgress: Number(s.taskProgress || 0),
    }))
  } catch {
    students.value = []
  }
}

async function loadTasks() {
  try {
    const data = await fetchTeacherTasks(props.id)
    const list = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []
    tasks.value = list.map((t) => normalizeTaskRow(t))
  } catch {
    tasks.value = []
  }
}

async function loadAll() {
  await Promise.all([loadTeacher(), loadStudents(), loadTasks()])
}

onMounted(loadAll)
watch(() => props.id, loadAll)

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

/** 任务明细：全部 | 仅长期；再按学生姓名筛选；与学生详情排序一致 */
const taskDetailFilter = ref('all')
const taskDetailSearch = ref('')

function setTaskDetailFilter(mode) {
  taskDetailFilter.value = mode
}

const longTermCount = computed(() => tasks.value.filter((t) => isLongTermTask(t)).length)

const tasksInDetailScope = computed(() =>
  taskDetailFilter.value === 'long_term'
    ? tasks.value.filter((t) => isLongTermTask(t))
    : [...tasks.value],
)

const filteredTasksForDetail = computed(() => {
  const raw = taskDetailSearch.value.trim()
  const searched = !raw
    ? [...tasksInDetailScope.value]
    : tasksInDetailScope.value.filter((t) =>
        String(t.student || '').toLowerCase().includes(raw.toLowerCase()),
      )
  return searched.sort((a, b) => {
    const byStart = String(a.startDate).localeCompare(String(b.startDate))
    if (byStart !== 0) return byStart
    const byEnd = String(a.endDate).localeCompare(String(b.endDate))
    if (byEnd !== 0) return byEnd
    return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN')
  })
})

const taskDetailEmptyHint = computed(() => {
  if (!tasks.value.length) return '暂无任务'
  if (!tasksInDetailScope.value.length) {
    return taskDetailFilter.value === 'long_term' ? '暂无长期任务' : '暂无任务'
  }
  if (!filteredTasksForDetail.value.length) return '无匹配任务，请尝试其他关键词'
  return ''
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
