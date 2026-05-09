<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Sticky Sub-header -->
    <header
      class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-variant bg-surface px-container-padding"
    >
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3 py-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
          @click="goBack"
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          返回
        </button>
        <div class="flex items-center gap-3">
          <h1 class="text-headline-md font-headline-md text-primary">{{ student.name }}</h1>
          <span
            v-if="overdueCount > 0"
            class="flex items-center gap-1 rounded bg-error-container px-2 py-0.5 text-xs font-medium text-on-error-container"
          >
            {{ overdueCount }}项延期
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex items-center gap-1 rounded bg-primary px-4 py-1.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-sm">add</span>
          新增任务
        </button>
      </div>
    </header>

    <!-- Scrollable content -->
    <div class="flex-1 space-y-6 overflow-y-auto p-container-padding">
      <!-- Student Summary -->
      <section class="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div class="flex items-end justify-between">
          <div class="flex flex-wrap gap-12">
            <div v-for="kv in summary" :key="kv.label" class="flex flex-col gap-1">
              <span class="text-label-caps font-label-caps text-on-surface-variant">{{ kv.label }}</span>
              <span
                class="text-body-base font-bold"
                :class="kv.danger ? 'text-error' : 'text-on-surface'"
              >{{ kv.value }}</span>
            </div>
          </div>
          <div class="w-64">
            <div class="mb-1 flex items-center justify-between">
              <span class="text-label-caps font-label-caps text-on-surface-variant">完成进度</span>
              <span class="text-body-sm font-bold text-on-surface">{{ progress }}%</span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div class="h-full rounded-full bg-secondary" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Alerts -->
      <section class="space-y-3">
        <div
          v-if="weeklyTasks.length"
          class="flex flex-col gap-3 rounded-lg border border-[#FFE082] bg-[#FFF8E1] p-4"
        >
          <div class="flex items-center gap-2 text-sm font-bold text-[#FF8F00]">
            <span class="material-symbols-outlined icon-fill text-sm">bolt</span>
            本周需处理 ({{ weeklyTasks.length }})
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="t in weeklyTasks"
              :key="t.title"
              class="flex items-center gap-2 rounded border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-sm"
            >
              <div class="h-2 w-2 rounded-full" :class="t.dotColor"></div>
              {{ t.title }} → {{ formatMdSlashFromYmd(t.endDate) }}
            </div>
          </div>
        </div>
        <div
          v-if="overdueTasks.length"
          class="flex flex-col gap-3 rounded-lg border border-error-container bg-error-container/30 p-4"
        >
          <div class="flex items-center gap-2 text-sm font-bold text-error">
            <span class="material-symbols-outlined text-sm">error</span>
            延期任务 ({{ overdueTasks.length }})
          </div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="t in overdueTasks"
              :key="t.title"
              class="flex items-center gap-2 rounded border border-error-container bg-surface-container-lowest px-3 py-1.5 text-sm text-error"
            >
              <div class="h-2 w-2 rounded-full bg-error"></div>
              {{ t.title }} 截止 {{ formatMdSlashFromYmd(t.endDate) }}
            </div>
          </div>
        </div>
      </section>

      <TaskTimelinePanel v-model:range="range" :tasks="tasks" subtitle-kind="teacher" />

      <!-- Task list -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-headline-md font-headline-md text-on-surface">任务明细</h2>
          <span class="text-body-sm text-on-surface-variant">{{ tasks.length }}个</span>
        </div>
        <div class="divide-y divide-surface-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          <div
            v-for="t in tasks"
            :key="t.title + 'row'"
            class="flex flex-wrap items-start gap-x-4 gap-y-2 p-4 md:grid md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-x-4 md:gap-y-0"
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
              {{ t.startDate }} ~ {{ t.endDate }}
            </div>
            <div class="min-w-0 w-full text-sm leading-snug text-on-surface-variant break-words sm:w-auto md:min-w-0 md:text-center">
              老师：{{ t.teacher || '—' }}
            </div>
            <div class="flex min-w-0 w-full justify-start sm:w-auto md:min-w-0 md:justify-center">
              <span
                class="rounded px-2 py-0.5 text-xs font-medium"
                :class="taskStatusBadgeClass(t)"
                :style="taskStatusBadgeStyle(t)"
              >{{ taskStatusLabel(t.status) }}</span>
            </div>
            <div class="shrink-0 md:justify-self-end">
              <button
                type="button"
                class="rounded bg-primary px-3 py-1 text-xs font-medium text-on-primary transition-opacity hover:opacity-90"
                @click="openEditTask(t)"
              >
                修改
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 修改任务 -->
    <Teleport to="body">
      <Transition name="fade-task-edit">
        <div
          v-if="editModalOpen"
          class="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-edit-title"
        >
          <div class="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]" @click="closeEditModal"></div>
          <div
            class="relative w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal"
            @click.stop
          >
            <div class="border-b border-outline-variant px-6 py-4">
              <h3 id="task-edit-title" class="text-headline-md font-headline-md text-primary">修改任务</h3>
              <p v-if="editingTask" class="mt-1 text-body-sm text-on-surface-variant">
                任务：<span class="font-semibold text-on-surface">{{ editingTask.title }}</span>
              </p>
            </div>
            <div class="space-y-4 px-6 py-5">
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-edit-status">
                  状态
                </label>
                <select
                  id="task-edit-status"
                  v-model="draftStatus"
                  class="h-11 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrowStyle"
                >
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-edit-start">
                    开始时间
                  </label>
                  <input
                    id="task-edit-start"
                    v-model="draftStartDate"
                    type="date"
                    class="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-edit-end">
                    结束时间
                  </label>
                  <input
                    id="task-edit-end"
                    v-model="draftEndDate"
                    type="date"
                    class="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
              </div>
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-edit-teacher">
                  任务老师
                </label>
                <input
                  id="task-edit-teacher"
                  v-model="draftTeacher"
                  type="text"
                  placeholder="负责老师姓名"
                  class="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-base text-on-surface placeholder:text-outline focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                @click="closeEditModal"
              >
                取消
              </button>
              <button
                type="button"
                class="rounded-lg bg-primary px-5 py-2 text-body-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
                @click="confirmEditTask"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showMessage } from '@/utils/request'
import TaskTimelinePanel from '@/components/TaskTimelinePanel.vue'

const router = useRouter()
const props = defineProps({ id: { type: String, required: true } })

const range = ref('周')

const student = ref({
  id: props.id,
  name: '张明',
  owner: '李经理',
  mentor: '王老师',
  pm: '陈PM',
  startDate: '2026-04-07',
})

const tasks = ref([
  {
    title: '初始评估',
    dotColor: 'bg-[#2196F3]',
    startDate: '2026-04-06',
    endDate: '2026-04-10',
    status: 'completed',
    teacher: 'Dr. Smith',
    barClass: 'border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
    dateShort: '4/6~4/10',
  },
  {
    title: '推荐信',
    dotColor: 'bg-[#9C27B0]',
    startDate: '2026-04-13',
    endDate: '2026-05-04',
    status: 'delayed',
    teacher: 'Prof. Davis',
    barClass: 'border-error bg-error/10 text-error',
    dateShort: '4/13~5/4',
  },
  {
    title: '文书初稿',
    dotColor: 'bg-[#9C27B0]',
    startDate: '2026-04-20',
    endDate: '2026-05-18',
    status: 'in_progress',
    teacher: '王老师',
    barClass: 'border-[#9C27B0] bg-[#9C27B0]/10 text-[#9C27B0]',
    dateShort: '4/20~5/18',
  },
  /** 与「文书初稿」时段重叠，用于演示同一时间段多条任务堆叠 */
  {
    title: '材料补充说明',
    dotColor: 'bg-[#7e57c2]',
    startDate: '2026-04-25',
    endDate: '2026-05-10',
    status: 'in_progress',
    teacher: '李老师',
    barClass: 'border-[#7e57c2] bg-[#7e57c2]/15 text-[#5e35b1]',
    dateShort: '4/25~5/10',
  },
  {
    title: '网申提交',
    dotColor: 'bg-[#2196F3]',
    startDate: '2026-05-26',
    endDate: '2026-06-05',
    status: 'pending',
    teacher: '陈PM',
    barClass: 'border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
    dateShort: '5/26~6/5',
  },
  {
    title: '面试准备',
    dotColor: 'bg-[#FF9800]',
    startDate: '2026-05-31',
    endDate: '2026-06-15',
    status: 'pending',
    teacher: '赵老师',
    barClass: 'border-[#FF9800] bg-[#FF9800]/10 text-[#FF9800]',
    dateShort: '5/31~6/15',
  },
  {
    title: '结果跟进',
    dotColor: 'bg-[#4CAF50]',
    startDate: '2026-06-20',
    endDate: '2026-07-05',
    status: 'pending',
    teacher: '王老师',
    barClass: 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]',
    dateShort: '6/20~7/5',
  },
])

/** 任务时间表展示：YYYY-MM-DD → MM/dd（无年份） */
function formatMdSlashFromYmd(ymd) {
  const p = String(ymd).split('-')
  if (p.length !== 3) return ymd
  return `${p[1].padStart(2, '0')}/${p[2].padStart(2, '0')}`
}

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

const overdueTasks = computed(() => tasks.value.filter((t) => t.status === 'delayed'))
const overdueCount = computed(() => overdueTasks.value.length)
const weeklyTasks = computed(() => tasks.value.filter((t) => t.status === 'in_progress'))

const completedCount = computed(() => tasks.value.filter((t) => t.status === 'completed').length)
const progress = computed(() =>
  tasks.value.length === 0
    ? 0
    : Math.round((completedCount.value / tasks.value.length) * 100),
)

const summary = computed(() => [
  { label: '负责人', value: student.value.owner },
  { label: 'MENTOR', value: student.value.mentor },
  { label: 'PM', value: student.value.pm },
  { label: '起始', value: student.value.startDate },
  { label: '任务', value: tasks.value.length },
  { label: '完成', value: completedCount.value },
  { label: '延期', value: overdueCount.value, danger: overdueCount.value > 0 },
])

function taskStatusLabel(s) {
  return {
    completed: '已完成',
    delayed: '延期',
    in_progress: '进行中',
    pending: '未开始',
  }[s] || s
}

/** 仅「未开始」：距开始日越近越大（0~1），用于渐变深浅 */
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

/** 「未开始」徽标：越接近开始日背景与字色越深 */
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

const statusOptions = [
  { value: 'pending', label: '未开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'completed', label: '已完成' },
  { value: 'delayed', label: '延期' },
]

const selectArrowStyle = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777680' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
  backgroundPosition: 'right 0.75rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.25em 1.25em',
}

const editModalOpen = ref(false)
const editingTask = ref(null)
const draftStatus = ref('pending')
const draftStartDate = ref('')
const draftEndDate = ref('')
const draftTeacher = ref('')

/** 甘特条右侧短日期，MM/dd~MM/dd */
function formatTaskDateShort(startYmd, endYmd) {
  return `${formatMdSlashFromYmd(startYmd)}~${formatMdSlashFromYmd(endYmd)}`
}

function openEditTask(t) {
  editingTask.value = t
  draftStatus.value = t.status
  draftStartDate.value = t.startDate
  draftEndDate.value = t.endDate
  draftTeacher.value = t.teacher || ''
  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  editingTask.value = null
}

function confirmEditTask() {
  if (!editingTask.value) return
  if (!draftStartDate.value || !draftEndDate.value) {
    showMessage('请填写开始与结束时间', 'warning')
    return
  }
  if (draftStartDate.value > draftEndDate.value) {
    showMessage('结束时间不能早于开始时间', 'error')
    return
  }
  editingTask.value.status = draftStatus.value
  editingTask.value.startDate = draftStartDate.value
  editingTask.value.endDate = draftEndDate.value
  editingTask.value.teacher = draftTeacher.value.trim() || '—'
  editingTask.value.dateShort = formatTaskDateShort(draftStartDate.value, draftEndDate.value)
  showMessage('任务已更新', 'success')
  closeEditModal()
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/students')
}
</script>

<style scoped>
.fade-task-edit-enter-active,
.fade-task-edit-leave-active {
  transition: opacity 0.2s ease;
}
.fade-task-edit-enter-from,
.fade-task-edit-leave-to {
  opacity: 0;
}
</style>
