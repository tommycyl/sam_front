<template>
  <div class="bg-background p-container-padding">
    <!-- Page header -->
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-display-lg font-display-lg text-on-background mb-1">学生管理</h2>
        <p class="text-body-sm text-on-surface-variant">
          统一管理学生档案、负责人、Mentor 与任务进度。
        </p>
      </div>
      <div class="flex shrink-0 flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          class="flex items-center gap-2 whitespace-nowrap rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2.5 text-body-sm font-semibold text-primary shadow-sm transition-colors hover:bg-surface-container-low"
          @click="onOpenTemplateSettings"
        >
          <span class="material-symbols-outlined text-[18px]">article</span>
          设置模板
        </button>
        <button
          type="button"
          class="flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          @click="openAdd"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          新增学生
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-stack-gap rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div class="flex flex-col gap-grid-gutter lg:flex-row lg:items-end lg:gap-grid-gutter">
        <div class="grid min-w-0 flex-1 grid-cols-1 gap-grid-gutter md:grid-cols-2 lg:grid-cols-4">
          <div class="relative">
            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
            >search</span>
            <input
              v-model="filters.keyword"
              type="text"
              placeholder="搜索学生姓名"
              class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 text-body-base text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            v-model="filters.owner"
            class="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            :style="selectArrow"
          >
            <option value="">全部负责人</option>
            <option v-for="o in ownerOptions" :key="o" :value="o">{{ o }}</option>
          </select>
          <select
            v-model="filters.mentor"
            class="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            :style="selectArrow"
          >
            <option value="">全部 Mentor</option>
            <option v-for="m in mentorOptions" :key="m" :value="m">{{ m }}</option>
          </select>
          <select
            v-model="filters.risk"
            class="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            :style="selectArrow"
          >
            <option value="">全部风险级别</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
          </select>
        </div>
        <div class="flex shrink-0 justify-end lg:justify-start">
          <button
            type="button"
            class="relative inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
            @click="openTaskFilterPanel"
          >
            <span class="material-symbols-outlined text-[20px]">tune</span>
            筛选
            <span
              v-if="appliedTaskIds.length"
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary"
            >{{ appliedTaskIds.length }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 任务多选筛选卡片 -->
    <Teleport to="body">
      <Transition name="fade-task-filter">
        <div
          v-if="taskFilterOpen"
          class="fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-filter-title"
        >
          <div class="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]" @click="closeTaskFilterPanel"></div>
          <div
            class="relative w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal"
            @click.stop
          >
            <div class="border-b border-outline-variant px-6 py-4">
              <h3 id="task-filter-title" class="text-headline-md font-headline-md text-primary">按任务筛选</h3>
              <p class="mt-1 text-body-sm text-on-surface-variant">
                多选任务后点击确认，列表将只显示关联了所选任务的学生。
              </p>
            </div>

            <div class="max-h-[min(360px,50vh)] overflow-y-auto px-6 py-4">
              <div v-if="taskOptionsLoading" class="flex flex-col items-center justify-center gap-3 py-10 text-body-sm text-on-surface-variant">
                <div class="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent"></div>
                正在加载任务列表…
              </div>
              <div v-else-if="!taskOptions.length" class="py-8 text-center text-body-sm text-on-surface-variant">
                暂无任务数据
              </div>
              <ul v-else class="space-y-1">
                <li
                  v-for="opt in taskOptions"
                  :key="opt.id"
                  class="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface-container-low"
                >
                  <input
                    :id="'task-opt-' + opt.id"
                    type="checkbox"
                    class="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary"
                    :checked="tempSelectedTaskIds.has(opt.id)"
                    @change="toggleTempTask(opt.id, $event.target.checked)"
                  />
                  <label
                    :for="'task-opt-' + opt.id"
                    class="flex-1 cursor-pointer text-body-base text-on-surface"
                  >{{ opt.name }}</label>
                </li>
              </ul>
              <p v-if="taskOptionsHint" class="mt-3 text-body-sm text-on-surface-variant">{{ taskOptionsHint }}</p>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant bg-surface-container-low px-6 py-4">
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                @click="resetTempTaskSelection"
              >
                清空选择
              </button>
              <button
                type="button"
                class="rounded-lg px-4 py-2 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                @click="closeTaskFilterPanel"
              >
                取消
              </button>
              <button
                type="button"
                class="rounded-lg bg-primary px-5 py-2 text-body-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
                @click="confirmTaskFilter"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Table meta -->
    <div class="mb-4 flex items-center justify-between px-1">
      <span class="text-body-sm text-on-surface-variant">
        共找到 <strong class="text-primary">{{ filtered.length }}</strong> 位学生
      </span>
    </div>

    <!-- Data table -->
    <div class="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left">
          <thead>
            <tr class="border-b border-surface-variant bg-surface-container-low">
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                学生姓名
              </th>
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                负责人
              </th>
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                Mentor
              </th>
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                当前进度
              </th>
              <th class="px-4 py-3 pl-12 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                任务状态
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-variant text-body-base">
            <tr
              v-for="row in pagedRows"
              :key="row.id"
              class="group cursor-pointer transition-colors hover:bg-surface-bright"
              @click="goDetail(row.id)"
            >
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-body-sm font-bold"
                    :class="avatarBg(row.id)"
                  >
                    {{ initials(row.name) }}
                  </div>
                  <div>
                    <div class="font-semibold text-on-surface">{{ row.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-4 text-on-surface-variant">{{ row.owner }}</td>
              <td class="px-4 py-4 text-on-surface-variant">{{ row.mentor }}</td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <div class="h-1.5 w-full max-w-[100px] rounded-full bg-surface-variant">
                    <div
                      class="h-1.5 rounded-full"
                      :class="progressBarColor(row)"
                      :style="{ width: row.progress + '%' }"
                    ></div>
                  </div>
                  <span class="text-body-sm text-on-surface-variant">{{ row.progress }}%</span>
                </div>
              </td>
              <td class="px-4 py-4 pl-12">
                <span
                  class="inline-flex items-center rounded px-2 py-0.5 text-[12px] font-medium"
                  :class="statusBadge(row.status)"
                >
                  {{ statusLabel(row.status) }}
                </span>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="5" class="px-4 py-12 text-center text-body-sm text-on-surface-variant">
                暂无数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between border-t border-surface-variant bg-surface-container-lowest px-4 py-3 sm:px-6">
        <p class="text-body-sm text-on-surface-variant">
          显示第 <span class="font-medium text-on-surface">{{ rangeStart }}</span> 到
          <span class="font-medium text-on-surface">{{ rangeEnd }}</span> 条，共
          <span class="font-medium text-on-surface">{{ filtered.length }}</span> 条
        </p>
        <nav class="relative inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            type="button"
            class="relative inline-flex items-center rounded-l-md border border-outline-variant bg-surface-container-lowest px-2 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
            :disabled="page === 1"
            @click="page--"
          >
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button
            v-for="n in pageList"
            :key="n"
            type="button"
            class="relative inline-flex items-center border px-4 py-2 text-body-sm font-medium"
            :class="
              n === page
                ? 'z-10 border-primary bg-primary-fixed text-primary'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
            "
            @click="page = n"
          >
            {{ n }}
          </button>
          <button
            type="button"
            class="relative inline-flex items-center rounded-r-md border border-outline-variant bg-surface-container-lowest px-2 py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
            :disabled="page === totalPages"
            @click="page++"
          >
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </nav>
      </div>
    </div>

    <AddStudentModal v-model:visible="addVisible" @submit="onCreate" />
    <TemplateSettingsModal v-model:visible="templateSettingsVisible" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AddStudentModal from '@/components/AddStudentModal.vue'
import TemplateSettingsModal from '@/components/TemplateSettingsModal.vue'
import {
  createStudent,
  fetchStudentList,
  fetchStudentTaskFilterOptions,
} from '@/api/student'
import { showMessage } from '@/utils/request'

const router = useRouter()
const loading = ref(false)

const selectArrow = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777680' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1.5em 1.5em',
}

const filters = ref({ keyword: '', owner: '', mentor: '', risk: '' })

/** 后端未就绪时的示例任务，需与下方 rows[].taskKeys 的 id 对齐 */
const FALLBACK_TASK_OPTIONS = [
  { id: 'initial_eval', name: '初始评估' },
  { id: 'recommendation', name: '推荐信' },
  { id: 'essay_draft', name: '文书初稿' },
  { id: 'online_apply', name: '网申提交' },
  { id: 'interview_prep', name: '面试准备' },
  { id: 'result_followup', name: '结果跟进' },
]

const rows = ref([])

async function loadStudents() {
  loading.value = true
  try {
    const data = await fetchStudentList()
    const list = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []
    rows.value = list
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadStudents)

const ownerOptions = computed(() => [...new Set(rows.value.map((r) => r.owner))])
const mentorOptions = computed(() => [...new Set(rows.value.map((r) => r.mentor))])

const appliedTaskIds = ref([])
const taskFilterOpen = ref(false)
const taskOptionsLoading = ref(false)
const taskOptions = ref([])
const taskOptionsHint = ref('')
const tempSelectedTaskIds = ref([])

const filtered = computed(() =>
  rows.value.filter((r) => {
    const kw = filters.value.keyword.trim().toLowerCase()
    if (kw) {
      const haystack = `${r.name || ''} ${r.code || r.id || ''}`.toLowerCase()
      if (!haystack.includes(kw)) return false
    }
    if (filters.value.owner && r.owner !== filters.value.owner) return false
    if (filters.value.mentor && r.mentor !== filters.value.mentor) return false
    if (filters.value.risk && r.risk !== filters.value.risk) return false
    if (appliedTaskIds.value.length) {
      const keys = r.taskKeys || []
      const hit = appliedTaskIds.value.some((id) => keys.includes(id))
      if (!hit) return false
    }
    return true
  }),
)

function normalizeTaskOptions(data) {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.map((x) =>
      typeof x === 'string' ? { id: x, name: x } : { id: String(x.id), name: String(x.name ?? x.id) },
    )
  }
  if (Array.isArray(data.list)) {
    return data.list.map((x) => ({ id: String(x.id), name: String(x.name ?? x.id) }))
  }
  return []
}

async function openTaskFilterPanel() {
  taskFilterOpen.value = true
  tempSelectedTaskIds.value = [...appliedTaskIds.value]
  taskOptionsHint.value = ''
  taskOptionsLoading.value = true
  taskOptions.value = []
  try {
    const data = await fetchStudentTaskFilterOptions({ silent: true, loading: false })
    const list = normalizeTaskOptions(data)
    taskOptions.value = list
    if (!list.length) {
      taskOptionsHint.value = '当前没有可选任务，请确认后端已返回任务名称列表。'
    }
  } catch {
    taskOptions.value = [...FALLBACK_TASK_OPTIONS]
    taskOptionsHint.value = '接口未就绪，已使用本地示例任务列表。对接后请实现 GET /students/meta/task-names。'
  } finally {
    taskOptionsLoading.value = false
  }
}

function closeTaskFilterPanel() {
  taskFilterOpen.value = false
}

function toggleTempTask(id, checked) {
  const set = new Set(tempSelectedTaskIds.value)
  if (checked) set.add(id)
  else set.delete(id)
  tempSelectedTaskIds.value = [...set]
}

function resetTempTaskSelection() {
  tempSelectedTaskIds.value = []
}

function confirmTaskFilter() {
  appliedTaskIds.value = [...tempSelectedTaskIds.value]
  page.value = 1
  taskFilterOpen.value = false
  if (appliedTaskIds.value.length) {
    showMessage(`已按 ${appliedTaskIds.value.length} 个任务筛选`, 'success')
  } else {
    showMessage('已清除任务筛选', 'info')
  }
}

const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageList = computed(() => {
  const total = totalPages.value
  const list = []
  for (let i = 1; i <= Math.min(3, total); i++) list.push(i)
  return list
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
const rangeStart = computed(() =>
  filtered.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1,
)
const rangeEnd = computed(() => Math.min(page.value * pageSize, filtered.value.length))

function initials(name) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const palette = [
  'bg-primary-fixed-dim text-primary',
  'bg-tertiary-fixed-dim text-tertiary-container',
  'bg-surface-variant text-on-surface-variant',
  'bg-secondary-fixed-dim text-secondary',
]
function avatarBg(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

function progressBarColor(row) {
  if (row.status === 'completed') return 'bg-primary'
  if (row.status === 'delayed') return 'bg-[#eab308]'
  if (row.status === 'in_progress') return 'bg-[#1d4ed8]'
  return 'bg-secondary'
}

function statusLabel(s) {
  return { normal: '正常', delayed: '延期', completed: '已完成', in_progress: '进行中' }[s] || s
}
function statusBadge(s) {
  return {
    normal: 'bg-[#e6f4ea] text-[#137333]',
    delayed: 'bg-[#fef9c3] text-[#854d0e] border border-[#fde047]',
    completed: 'bg-surface-variant text-on-surface-variant',
    in_progress: 'border border-[#2563eb] bg-[#bfdbfe] text-[#1d4ed8]',
  }[s] || 'bg-surface-variant text-on-surface-variant'
}

function goDetail(id) {
  router.push(`/students/${id}`)
}

const addVisible = ref(false)
const templateSettingsVisible = ref(false)
function openAdd() {
  addVisible.value = true
}

function onOpenTemplateSettings() {
  templateSettingsVisible.value = true
}

function normalizeYmd(value) {
  if (!value) return ''
  const s = String(value).trim().replace(/\//g, '-')
  return s
}

async function onCreate(payload) {
  try {
    await createStudent({
      name: payload.name,
      startDate: normalizeYmd(payload.startDate),
      templateId: payload.templateId,
      pmId: payload.pmId,
      mentorId: payload.mentorId,
      midPlatformId: payload.midPlatformId,
    })
    addVisible.value = false
    showMessage('已添加学生', 'success')
    await loadStudents()
  } catch {
    /* request 拦截器已弹错误 */
  }
}
</script>

<style scoped>
.fade-task-filter-enter-active,
.fade-task-filter-leave-active {
  transition: opacity 0.2s ease;
}
.fade-task-filter-enter-active .relative,
.fade-task-filter-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.fade-task-filter-enter-from,
.fade-task-filter-leave-to {
  opacity: 0;
}
.fade-task-filter-enter-from .relative,
.fade-task-filter-leave-to .relative {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
