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
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-1 rounded bg-primary px-4 py-1.5 text-sm font-medium text-on-primary transition-opacity hover:opacity-90"
          @click="openAddTaskModal"
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

      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 class="text-headline-md font-headline-md text-primary">学生时间表</h3>
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
        subtitle-kind="teacher"
        :schedule-heading="studentTimelineScheduleTitle"
      />
      <TaskMonthGridCalendar v-else :tasks="tasksForTimeline" />

      <!-- Task list -->
      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-headline-md font-headline-md text-on-surface">任务明细</h2>
          <div class="flex flex-wrap items-center gap-3">
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
            <span class="shrink-0 text-body-sm text-on-surface-variant">
              <template v-if="taskDetailFilter === 'all'">{{ tasks.length }} 个</template>
              <template v-else>{{ tasksSortedForDetail.length }} / {{ tasks.length }} 个</template>
            </span>
          </div>
        </div>
        <div class="divide-y divide-surface-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
          <div
            v-if="!tasksSortedForDetail.length"
            class="px-4 py-10 text-center text-body-sm text-on-surface-variant"
          >
            {{
              taskDetailFilter === 'long_term' ? '暂无长期任务' : '暂无任务'
            }}
          </div>
          <template v-else>
            <div
              v-for="t in tasksSortedForDetail"
              :key="t.id || `${t.title}|${t.startDate}|${t.endDate}`"
              class="flex flex-wrap items-start gap-x-4 gap-y-2 p-4 md:grid md:grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-x-4 md:gap-y-0"
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
                  v-if="t.isLongTerm"
                  class="shrink-0 rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant"
                >长期</span>
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
          </template>
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
                <span
                  v-if="editingTask.isLongTerm"
                  class="ml-2 inline-block rounded border border-outline-variant bg-surface-container-high px-1.5 py-0.5 text-[10px] font-semibold text-on-surface-variant"
                >长期</span>
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
                <select
                  id="task-edit-teacher"
                  v-model="draftTeacher"
                  class="h-11 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrowStyle"
                >
                  <option v-for="opt in teacherSelectOptions" :key="'edit-teacher-' + opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-edit-longterm">
                  是否长期任务
                </label>
                <select
                  id="task-edit-longterm"
                  v-model="draftLongTermStr"
                  class="h-11 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrowStyle"
                >
                  <option value="0">否</option>
                  <option value="1">是</option>
                </select>
                <p class="mt-1 text-body-sm text-on-surface-variant">选「是」时不在上方时间表展示，仅在任务明细中显示。</p>
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

    <!-- 新增任务 -->
    <Teleport to="body">
      <Transition name="fade-task-edit">
        <div
          v-if="addModalOpen"
          class="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-add-title"
        >
          <div class="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]" @click="closeAddModal"></div>
          <div
            class="relative w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal"
            @click.stop
          >
            <div class="border-b border-outline-variant px-6 py-4">
              <h3 id="task-add-title" class="text-headline-md font-headline-md text-primary">新增任务</h3>
              <p class="mt-1 text-body-sm text-on-surface-variant">
                为学生添加任务。默认会出现在时间表与任务明细；若选「长期任务」，则仅在下方任务明细中显示。
              </p>
            </div>
            <div class="space-y-4 px-6 py-5">
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-add-title-input">
                  任务名称
                </label>
                <input
                  id="task-add-title-input"
                  v-model="newTitle"
                  type="text"
                  placeholder="例如：文书终稿"
                  class="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-base text-on-surface placeholder:text-outline focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-add-status">
                  状态
                </label>
                <select
                  id="task-add-status"
                  v-model="newStatus"
                  class="h-11 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrowStyle"
                >
                  <option v-for="opt in statusOptions" :key="'add-' + opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-add-start">
                    开始时间
                  </label>
                  <input
                    id="task-add-start"
                    v-model="newStartDate"
                    type="date"
                    class="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-add-end">
                    结束时间
                  </label>
                  <input
                    id="task-add-end"
                    v-model="newEndDate"
                    type="date"
                    class="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  />
                </div>
              </div>
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-add-teacher">
                  任务老师
                </label>
                <select
                  id="task-add-teacher"
                  v-model="newTeacher"
                  class="h-11 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrowStyle"
                >
                  <option v-for="opt in teacherSelectOptions" :key="'add-teacher-' + opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-label-caps font-label-caps text-on-surface-variant" for="task-add-longterm">
                  是否长期任务
                </label>
                <select
                  id="task-add-longterm"
                  v-model="newLongTermStr"
                  class="h-11 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrowStyle"
                >
                  <option value="0">否</option>
                  <option value="1">是</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                @click="closeAddModal"
              >
                取消
              </button>
              <button
                type="button"
                class="rounded-lg bg-primary px-5 py-2 text-body-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
                @click="confirmAddTask"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showMessage } from '@/utils/request'
import TaskTimelinePanel from '@/components/TaskTimelinePanel.vue'
import TaskMonthGridCalendar from '@/components/TaskMonthGridCalendar.vue'
import {
  createStudentTask,
  fetchStudentDetail,
  updateTask,
} from '@/api/student'
import { fetchTeacherList } from '@/api/teacher'

const router = useRouter()
const props = defineProps({ id: { type: String, required: true } })

const range = ref('周')
/** timeline：原泳道时间表；calendar：月历网格 */
const scheduleViewMode = ref('timeline')

function toggleScheduleView() {
  scheduleViewMode.value = scheduleViewMode.value === 'timeline' ? 'calendar' : 'timeline'
}

const student = ref({
  id: props.id,
  name: '',
  owner: '—',
  mentor: '—',
  pm: '—',
  startDate: '',
})

const tasks = ref([])
const teacherList = ref([])

/** 时间表左侧竖栏：学生姓名 +「时间表」 */
const studentTimelineScheduleTitle = computed(() => {
  const n = String(student.value?.name || '').trim()
  return n ? `${n} 时间表` : '时间表'
})

async function loadDetail() {
  try {
    const data = await fetchStudentDetail(props.id)
    if (data) {
      student.value = {
        id: data.id,
        name: data.name || '',
        owner: data.owner || '—',
        mentor: data.mentor || '—',
        pm: data.pm || data.owner || '—',
        startDate: data.startDate || '',
      }
      tasks.value = Array.isArray(data.tasks) ? data.tasks : []
    }
  } catch {
    /* request 拦截器已弹错误 */
  }
}

async function loadTeachers() {
  try {
    const data = await fetchTeacherList({ silent: true, loading: false })
    const list = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []
    teacherList.value = list
  } catch {
    teacherList.value = []
  }
}

onMounted(async () => {
  await Promise.all([loadDetail(), loadTeachers()])
})

watch(() => props.id, () => {
  loadDetail()
})

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

function formatYmdLocalDate(d) {
  const x = startOfDay(d)
  const y = x.getFullYear()
  const mo = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}

function todayYmd() {
  return formatYmdLocalDate(new Date())
}

function addDaysYmd(ymd, n) {
  const base = parseYmdLocal(ymd)
  const x = new Date(base)
  x.setDate(x.getDate() + n)
  return formatYmdLocalDate(x)
}

function taskVisualsForStatus(status) {
  if (status === 'delayed') {
    return { dotColor: 'bg-error', barClass: 'border-error bg-error/10 text-error' }
  }
  if (status === 'completed') {
    return {
      dotColor: 'bg-[#4CAF50]',
      barClass: 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]',
    }
  }
  if (status === 'in_progress') {
    return {
      dotColor: 'bg-[#9C27B0]',
      barClass: 'border-[#9C27B0] bg-[#9C27B0]/10 text-[#9C27B0]',
    }
  }
  return {
    dotColor: 'bg-[#2196F3]',
    barClass: 'border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
  }
}

function dayOffsetFrom(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000)
}

function isLongTermTask(t) {
  return Boolean(t?.isLongTerm)
}

const tasksForTimeline = computed(() => tasks.value.filter((t) => !isLongTermTask(t)))

const overdueTasks = computed(() =>
  tasks.value.filter((t) => t.status === 'delayed' && !isLongTermTask(t)),
)
const overdueCount = computed(() => overdueTasks.value.length)
const weeklyTasks = computed(() =>
  tasks.value.filter((t) => t.status === 'in_progress' && !isLongTermTask(t)),
)

/** 任务明细列表：全部任务 | 仅长期任务 */
const taskDetailFilter = ref('all')

function setTaskDetailFilter(mode) {
  taskDetailFilter.value = mode
}

/** 任务明细：先按筛选，再按开始时间、结束时间升序，同名时段再按标题 */
const tasksSortedForDetail = computed(() => {
  const base =
    taskDetailFilter.value === 'long_term'
      ? tasks.value.filter((t) => isLongTermTask(t))
      : [...tasks.value]
  return base.sort((a, b) => {
    const byStart = String(a.startDate).localeCompare(String(b.startDate))
    if (byStart !== 0) return byStart
    const byEnd = String(a.endDate).localeCompare(String(b.endDate))
    if (byEnd !== 0) return byEnd
    return String(a.title).localeCompare(String(b.title), 'zh-Hans-CN')
  })
})

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

/** 任务老师下拉：使用全量老师列表（id 作为 value，姓名做 label） */
const teacherSelectOptions = computed(() => {
  const list = (teacherList.value || []).map((t) => ({
    value: String(t.id ?? ''),
    label: t.name,
  }))
  return [{ value: '', label: '未指定' }, ...list]
})

function findTeacherIdByName(name) {
  const x = String(name || '').trim()
  if (!x || x === '—') return ''
  const t = teacherList.value.find((row) => row.name === x)
  return t ? String(t.id) : ''
}

function findTeacherNameById(id) {
  const x = String(id || '').trim()
  if (!x) return ''
  const t = teacherList.value.find((row) => String(row.id) === x)
  return t ? t.name : ''
}

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
const draftLongTermStr = ref('0')

const addModalOpen = ref(false)
const newTitle = ref('')
const newStatus = ref('pending')
const newStartDate = ref('')
const newEndDate = ref('')
const newTeacher = ref('')
const newLongTermStr = ref('0')

/** 甘特条右侧短日期，MM/dd~MM/dd */
function formatTaskDateShort(startYmd, endYmd) {
  return `${formatMdSlashFromYmd(startYmd)}~${formatMdSlashFromYmd(endYmd)}`
}

function openEditTask(t) {
  addModalOpen.value = false
  editingTask.value = t
  draftStatus.value = t.status
  draftStartDate.value = t.startDate
  draftEndDate.value = t.endDate
  draftTeacher.value =
    t.teacherId != null && t.teacherId !== ''
      ? String(t.teacherId)
      : findTeacherIdByName(t.teacher)
  draftLongTermStr.value = t.isLongTerm ? '1' : '0'
  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  editingTask.value = null
}

async function confirmEditTask() {
  if (!editingTask.value) return
  if (!draftStartDate.value || !draftEndDate.value) {
    showMessage('请填写开始与结束时间', 'warning')
    return
  }
  if (draftStartDate.value > draftEndDate.value) {
    showMessage('结束时间不能早于开始时间', 'error')
    return
  }
  const taskId = editingTask.value.id
  if (!taskId) {
    showMessage('该任务缺少 ID，无法保存', 'error')
    return
  }
  try {
    const updated = await updateTask(taskId, {
      status: draftStatus.value,
      startDate: draftStartDate.value,
      endDate: draftEndDate.value,
      teacherId: draftTeacher.value || null,
      isLongTerm: draftLongTermStr.value === '1',
    })
    if (updated) {
      const i = tasks.value.findIndex((x) => x.id === taskId)
      if (i >= 0) tasks.value[i] = updated
    } else {
      Object.assign(editingTask.value, {
        status: draftStatus.value,
        startDate: draftStartDate.value,
        endDate: draftEndDate.value,
        teacher: findTeacherNameById(draftTeacher.value) || '—',
        teacherId: draftTeacher.value || null,
        isLongTerm: draftLongTermStr.value === '1',
      })
    }
    showMessage('任务已更新', 'success')
    closeEditModal()
  } catch {
    /* 拦截器已弹错误 */
  }
}

function openAddTaskModal() {
  editModalOpen.value = false
  editingTask.value = null
  newTitle.value = ''
  newStatus.value = 'pending'
  const t0 = todayYmd()
  newStartDate.value = t0
  newEndDate.value = addDaysYmd(t0, 7)
  newTeacher.value = ''
  newLongTermStr.value = '0'
  addModalOpen.value = true
}

function closeAddModal() {
  addModalOpen.value = false
}

async function confirmAddTask() {
  const title = newTitle.value.trim()
  if (!title) {
    showMessage('请填写任务名称', 'warning')
    return
  }
  if (!newStartDate.value || !newEndDate.value) {
    showMessage('请填写开始与结束时间', 'warning')
    return
  }
  if (newStartDate.value > newEndDate.value) {
    showMessage('结束时间不能早于开始时间', 'error')
    return
  }
  try {
    const created = await createStudentTask(props.id, {
      title,
      status: newStatus.value,
      startDate: newStartDate.value,
      endDate: newEndDate.value,
      teacherId: newTeacher.value || null,
      isLongTerm: newLongTermStr.value === '1',
    })
    if (created) tasks.value.push(created)
    showMessage('任务已添加', 'success')
    closeAddModal()
  } catch {
    /* 拦截器已弹错误 */
  }
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
