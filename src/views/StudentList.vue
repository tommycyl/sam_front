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
            <option value="">全部PM</option>
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
            <span class="material-symbols-outlined text-[20px]">filter_alt</span>
            按条件筛选
            <span
              v-if="appliedTaskIds.length"
              class="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-on-secondary"
            >{{ appliedTaskIds.length }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 按条件筛选：大弹窗 — 可勾选任务下拉（最多 3 项）+ 学生 × 任务状态表 -->
    <Teleport to="body">
      <Transition name="fade-task-filter">
        <div
          v-if="taskFilterOpen"
          class="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-filter-title"
        >
          <div class="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]" @click="dismissTaskFilterBackdrop"></div>
          <div
            class="relative flex h-[min(92vh,52rem)] w-full max-w-[min(96vw,56rem)] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal"
            @click.stop
          >
            <div class="shrink-0 border-b border-outline-variant px-5 py-4 sm:px-6">
              <h3 id="task-filter-title" class="text-headline-md font-headline-md text-primary">按条件筛选</h3>
              <p class="mt-1 text-body-sm text-on-surface-variant">
                在下拉框中勾选最多 3 个任务，表格展示每位学生对应任务的状态；勾选会立即同步到下方学生列表。
              </p>
            </div>

            <div class="shrink-0 border-b border-outline-variant px-5 py-4 sm:px-6" @click="taskDropdownOpen = false">
              <div class="flex flex-wrap items-end justify-between gap-4">
                <div class="relative min-w-0" @click.stop>
                  <span class="mb-1.5 block text-label-caps font-label-caps text-on-surface-variant">对比任务</span>
                  <button
                    type="button"
                    class="flex h-10 w-full min-w-[12rem] max-w-md items-center justify-between gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-left text-body-sm text-on-surface shadow-sm transition-colors hover:border-primary/60"
                    :aria-expanded="taskDropdownOpen"
                    aria-haspopup="listbox"
                    @click="taskDropdownOpen = !taskDropdownOpen"
                  >
                    <span class="min-w-0 truncate font-medium">{{ taskDropdownSummary }}</span>
                    <span class="material-symbols-outlined shrink-0 text-[22px] text-on-surface-variant">
                      {{ taskDropdownOpen ? 'expand_less' : 'expand_more' }}
                    </span>
                  </button>
                  <div
                    v-show="taskDropdownOpen"
                    class="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto overscroll-contain rounded-lg border border-outline-variant bg-surface-container-lowest py-2 shadow-lg sm:right-auto sm:w-[min(100%,22rem)]"
                    role="listbox"
                    @click.stop
                  >
                    <div v-if="taskOptionsLoading" class="flex flex-col items-center gap-2 px-4 py-8 text-body-sm text-on-surface-variant">
                      <div class="h-7 w-7 animate-spin rounded-full border-2 border-secondary border-t-transparent"></div>
                      正在加载任务…
                    </div>
                    <div v-else-if="!taskOptions.length" class="px-4 py-6 text-center text-body-sm text-on-surface-variant">
                      暂无任务数据
                    </div>
                    <ul v-else class="space-y-0.5 px-1">
                      <li
                        v-for="opt in taskOptions"
                        :key="opt.id"
                        class="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-container-low"
                      >
                        <input
                          :id="'task-opt-' + opt.id"
                          type="checkbox"
                          class="h-4 w-4 shrink-0 rounded border-outline-variant text-secondary focus:ring-secondary"
                          :checked="tempSelectedTaskIds.includes(opt.id)"
                          @change="toggleTempTask(opt.id, $event.target.checked)"
                        />
                        <label
                          :for="'task-opt-' + opt.id"
                          class="min-w-0 flex-1 cursor-pointer truncate text-body-sm text-on-surface"
                        >{{ opt.name }}</label>
                      </li>
                    </ul>
                    <p v-if="taskOptionsHint" class="border-t border-outline-variant/80 px-3 py-2 text-xs text-on-surface-variant">
                      {{ taskOptionsHint }}
                    </p>
                  </div>
                </div>
                <p class="max-w-xs text-xs text-on-surface-variant">
                  已选 {{ tempSelectedTaskIds.length }} / 3
                </p>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-auto px-0 pb-3 pt-0" @click="taskDropdownOpen = false">
              <table class="w-full min-w-[20rem] border-collapse text-left text-body-sm">
                <thead class="sticky top-0 z-10 border-b border-surface-variant bg-surface-container-low">
                  <tr>
                    <th class="whitespace-nowrap py-3 pl-5 pr-3 text-label-caps font-label-caps text-on-surface-variant sm:pl-6">
                      学生姓名
                    </th>
                    <th
                      v-for="(tid, ci) in tempSelectedTaskIds"
                      :key="tid"
                      class="min-w-[7rem] py-3 text-label-caps font-label-caps text-on-surface-variant"
                      :class="ci === tempSelectedTaskIds.length - 1 ? 'pl-3 pr-5 sm:pr-6' : 'px-3'"
                    >
                      {{ taskColumnTitle(tid) }}
                      <span class="ml-0.5 tabular-nums text-on-surface-variant/70">({{ ci + 1 }})</span>
                    </th>
                    <th
                      v-if="!tempSelectedTaskIds.length"
                      class="py-3 pl-3 pr-5 text-label-caps font-label-caps text-on-surface-variant sm:pr-6"
                    >
                      任务列
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-surface-variant">
                  <template v-if="tempSelectedTaskIds.length">
                    <tr v-for="row in matrixTableRows" :key="row.id" class="bg-surface-container-lowest hover:bg-surface-bright/80">
                      <td class="whitespace-nowrap py-3 pl-5 pr-3 font-semibold text-on-surface sm:pl-6">{{ row.name }}</td>
                      <td
                        v-for="(tid, ci) in tempSelectedTaskIds"
                        :key="tid + '-' + row.id"
                        class="py-3 align-middle"
                        :class="ci === tempSelectedTaskIds.length - 1 ? 'pl-3 pr-5 sm:pr-6' : 'px-3'"
                      >
                        <span
                          v-if="matrixTaskStatus(row, tid) == null"
                          class="inline-flex rounded-md border border-outline-variant/80 bg-surface-container-high px-2 py-1 text-xs font-medium text-on-surface-variant"
                        >无此任务</span>
                        <span
                          v-else
                          class="inline-flex rounded-md border px-2 py-1 text-xs font-medium"
                          :class="matrixStatusClass(matrixTaskStatus(row, tid))"
                        >{{ matrixStatusLabel(matrixTaskStatus(row, tid)) }}</span>
                      </td>
                    </tr>
                    <tr v-if="!matrixTableRows.length">
                      <td :colspan="1 + tempSelectedTaskIds.length" class="px-5 py-12 text-center text-on-surface-variant sm:px-6">
                        <template v-if="!baseFiltered.length">暂无学生数据</template>
                        <template v-else>暂无符合条件的学生：仅在至少一个已选任务下「有任务」的学生会显示。</template>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="2" class="px-5 py-14 text-center text-on-surface-variant sm:px-6">
                      请先在上方下拉框中勾选任务（最多 3 项），此处将展示每位学生对应任务的状态。
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-5 py-4 sm:px-6">
              <button
                type="button"
                class="rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2.5 text-body-sm font-semibold text-on-surface shadow-sm transition-colors hover:border-primary/50 hover:bg-surface-container-low hover:text-primary"
                @click="resetTempTaskSelection"
              >
                清空选择
              </button>
              <button
                type="button"
                class="rounded-lg border border-error bg-surface-container-lowest px-5 py-2.5 text-body-sm font-semibold text-error transition-colors hover:bg-error-container/35"
                @click="cancelTaskFilterPanel"
              >
                取消
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
                PM
              </th>
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                Mentor
              </th>
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                中台
              </th>
              <th class="px-4 py-3 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                当前进度
              </th>
              <th class="px-4 py-3 pl-12 text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                任务状态
              </th>
              <th class="px-4 py-3 text-right text-label-caps font-label-caps uppercase tracking-wider text-on-surface-variant">
                操作
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
              <td class="px-4 py-4 text-on-surface-variant">{{ row.midPlatform ?? '—' }}</td>
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
              <td class="px-4 py-4 text-right" @click.stop>
                <div class="inline-flex flex-wrap items-center justify-end gap-1">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-body-sm font-medium text-primary transition-colors hover:bg-surface-container-low"
                    title="编辑"
                    @click="openEdit(row, $event)"
                  >
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                    编辑
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-body-sm font-medium text-error transition-colors hover:bg-error/10"
                    title="删除"
                    @click="confirmDelete(row, $event)"
                  >
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagedRows.length">
              <td colspan="7" class="px-4 py-12 text-center text-body-sm text-on-surface-variant">
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

    <AddStudentModal
      v-model:visible="studentModalVisible"
      :initial="studentModalInitial"
      @submit="onStudentModalSubmit"
    />
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
  deleteStudent,
  fetchStudentDetail,
  fetchStudentList,
  fetchStudentTaskFilterOptions,
  updateStudent,
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

const MAX_TASK_FILTER = 3

const appliedTaskIds = ref([])
/** 打开「按条件筛选」弹窗时的任务筛选快照；点「取消」时恢复 */
const taskFilterSnapshot = ref([])
const taskFilterOpen = ref(false)
const taskOptionsLoading = ref(false)
const taskOptions = ref([])
const taskOptionsHint = ref('')
const tempSelectedTaskIds = ref([])
const taskDropdownOpen = ref(false)

/** 仅关键字 / PM / Mentor / 风险，不含「按任务」条件 — 供弹窗矩阵展示 */
const baseFiltered = computed(() =>
  rows.value.filter((r) => {
    const kw = filters.value.keyword.trim().toLowerCase()
    if (kw) {
      const haystack = `${r.name || ''} ${r.code || r.id || ''}`.toLowerCase()
      if (!haystack.includes(kw)) return false
    }
    if (filters.value.owner && r.owner !== filters.value.owner) return false
    if (filters.value.mentor && r.mentor !== filters.value.mentor) return false
    if (filters.value.risk && r.risk !== filters.value.risk) return false
    return true
  }),
)

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

const taskDropdownSummary = computed(() => {
  if (!tempSelectedTaskIds.value.length) return '勾选任务（最多 3 项）'
  return tempSelectedTaskIds.value
    .map((id) => {
      const o = taskOptions.value.find((x) => x.id === id)
      return o?.name || id
    })
    .join('、')
})

function taskColumnTitle(taskId) {
  const o = taskOptions.value.find((x) => x.id === taskId)
  return o?.name || taskId
}

function matrixTaskStatus(row, taskTitle) {
  const m = row.taskStatusByTitle
  if (!m || typeof m !== 'object') return null
  return m[taskTitle] ?? null
}

/** 矩阵表行：至少有一列有任务；排序为「命中已选列数」多→少（3 列全有最前，其次 2，最后 1），同档按姓名 */
const matrixTableRows = computed(() => {
  const tids = tempSelectedTaskIds.value
  if (!tids.length) return []
  const rows = baseFiltered.value.filter((row) => tids.some((tid) => matrixTaskStatus(row, tid) != null))
  const hitCount = (row) => tids.reduce((n, tid) => n + (matrixTaskStatus(row, tid) != null ? 1 : 0), 0)
  return [...rows].sort((a, b) => {
    const d = hitCount(b) - hitCount(a)
    if (d !== 0) return d
    return String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN')
  })
})

function matrixStatusLabel(status) {
  return (
    {
      completed: '已完成',
      delayed: '已延期',
      in_progress: '进行中',
      pending: '未开始',
      normal: '正常',
    }[status] || status
  )
}

function matrixStatusClass(status) {
  return (
    {
      completed: 'border border-[#86efac] bg-[#dcfce7] text-[#166534]',
      delayed: 'border border-[#fde047] bg-[#fef9c3] text-[#854d0e]',
      in_progress: 'border border-[#2563eb] bg-[#bfdbfe] text-[#1d4ed8]',
      pending: 'border border-outline-variant bg-surface-container-high text-on-surface-variant',
      normal: 'border border-outline-variant bg-surface-container-high text-on-surface-variant',
    }[status] || 'border border-outline-variant bg-surface-container-high text-on-surface-variant'
  )
}

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
  taskFilterSnapshot.value = [...appliedTaskIds.value]
  taskFilterOpen.value = true
  taskDropdownOpen.value = false
  tempSelectedTaskIds.value = appliedTaskIds.value.slice(0, MAX_TASK_FILTER)
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

/** 点遮罩：关闭弹窗，保留当前勾选（已实时同步到列表） */
function dismissTaskFilterBackdrop() {
  taskFilterOpen.value = false
  taskDropdownOpen.value = false
}

/** 取消：恢复打开弹窗前的任务筛选并关闭 */
function cancelTaskFilterPanel() {
  appliedTaskIds.value = [...taskFilterSnapshot.value]
  tempSelectedTaskIds.value = taskFilterSnapshot.value.slice(0, MAX_TASK_FILTER)
  taskFilterOpen.value = false
  taskDropdownOpen.value = false
}

function toggleTempTask(id, checked) {
  const cur = [...tempSelectedTaskIds.value]
  const idx = cur.indexOf(id)
  if (checked) {
    if (idx >= 0) return
    if (cur.length >= MAX_TASK_FILTER) {
      showMessage(`最多勾选 ${MAX_TASK_FILTER} 个任务`, 'info')
      return
    }
    cur.push(id)
  } else if (idx >= 0) {
    cur.splice(idx, 1)
  }
  tempSelectedTaskIds.value = cur
  appliedTaskIds.value = cur.slice(0, MAX_TASK_FILTER)
  page.value = 1
}

function resetTempTaskSelection() {
  tempSelectedTaskIds.value = []
  appliedTaskIds.value = []
  page.value = 1
  showMessage('已清除任务筛选', 'info')
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

const studentModalVisible = ref(false)
const studentModalInitial = ref(null)
const templateSettingsVisible = ref(false)
function openAdd() {
  studentModalInitial.value = null
  studentModalVisible.value = true
}

async function openEdit(row, e) {
  e?.stopPropagation?.()
  try {
    const d = await fetchStudentDetail(row.id)
    studentModalInitial.value = {
      id: d.id,
      name: d.name || '',
      startDate: d.startDate || '',
      templateId: d.templateId || '',
      owner: d.owner || d.pm || '',
      mentor: d.mentor || '',
      midPlatform: d.midPlatform || '',
      pmId: d.pmId ?? d.ownerId,
      mentorId: d.mentorId,
      midPlatformId: d.midPlatformId,
    }
    studentModalVisible.value = true
  } catch {
    showMessage('加载学生信息失败', 'error')
  }
}

async function confirmDelete(row, e) {
  e?.stopPropagation?.()
  const ok = window.confirm(`确定删除学生「${row.name}」吗？其任务数据将一并删除，且不可恢复。`)
  if (!ok) return
  try {
    await deleteStudent(row.id)
    showMessage('已删除学生', 'success')
    if (studentModalInitial.value?.id === row.id) {
      studentModalInitial.value = null
      studentModalVisible.value = false
    }
    await loadStudents()
  } catch {
    /* request 拦截器已弹错误 */
  }
}

function onOpenTemplateSettings() {
  templateSettingsVisible.value = true
}

function normalizeYmd(value) {
  if (!value) return ''
  const s = String(value).trim().replace(/\//g, '-')
  return s
}

async function onStudentModalSubmit(payload) {
  const body = {
    name: payload.name,
    startDate: normalizeYmd(payload.startDate),
    templateId: payload.templateId,
    pmId: payload.pmId,
    mentorId: payload.mentorId,
    midPlatformId: payload.midPlatformId,
  }
  try {
    if (payload.id != null && payload.id !== '') {
      await updateStudent(payload.id, body)
      showMessage('已保存修改，任务与负责人已同步', 'success')
    } else {
      await createStudent(body)
      showMessage('已添加学生', 'success')
    }
    studentModalVisible.value = false
    studentModalInitial.value = null
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
