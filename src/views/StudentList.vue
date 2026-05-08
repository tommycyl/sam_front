<template>
  <div class="bg-background p-container-padding">
    <!-- Page header -->
    <div class="mb-6 flex items-end justify-between">
      <div>
        <h2 class="text-display-lg font-display-lg text-on-background mb-1">学生管理</h2>
        <p class="text-body-sm text-on-surface-variant">
          统一管理学生档案、负责人、Mentor 与任务进度。
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container"
        @click="openAdd"
      >
        <span class="material-symbols-outlined text-[18px]">add</span>
        新增记录
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-stack-gap rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div class="grid grid-cols-1 gap-grid-gutter md:grid-cols-2 lg:grid-cols-5">
        <div class="relative">
          <span
            class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
          >search</span>
          <input
            v-model="filters.keyword"
            type="text"
            placeholder="搜索学生姓名/ID..."
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
          v-model="filters.task"
          class="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          :style="selectArrow"
        >
          <option value="">全部任务</option>
          <option value="brainstorming">Brainstorming完成</option>
          <option value="ip">IP完成</option>
          <option value="bs">BS会议</option>
          <option value="course_plan">选课方案</option>
          <option value="course_search">选课搜索</option>
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
    </div>

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
                    <div class="text-body-sm text-outline">ID: {{ row.id }}</div>
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AddStudentModal from '@/components/AddStudentModal.vue'
import { showMessage } from '@/utils/request'

const router = useRouter()

const selectArrow = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777680' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
  backgroundPosition: 'right 0.5rem center',
  backgroundSize: '1.5em 1.5em',
}

const filters = ref({ keyword: '', owner: '', mentor: '', task: '', risk: '' })

const rows = ref([
  {
    id: 'STU-8821',
    name: 'Chen Wei',
    owner: 'Zhang San',
    mentor: 'Dr. Smith',
    progress: 75,
    status: 'normal',
    risk: 'low',
  },
  {
    id: 'STU-9032',
    name: 'Li Yanting',
    owner: 'Li Si',
    mentor: 'Prof. Davis',
    progress: 30,
    status: 'delayed',
    risk: 'high',
  },
  {
    id: 'STU-7745',
    name: 'Wang Xiao',
    owner: 'Zhang San',
    mentor: 'Dr. Miller',
    progress: 100,
    status: 'completed',
    risk: 'low',
  },
  {
    id: 'STU-8199',
    name: 'Zhao Qiang',
    owner: 'Wang Wu',
    mentor: 'Prof. Lee',
    progress: 50,
    status: 'in_progress',
    risk: 'medium',
  },
])

const ownerOptions = computed(() => [...new Set(rows.value.map((r) => r.owner))])
const mentorOptions = computed(() => [...new Set(rows.value.map((r) => r.mentor))])

const filtered = computed(() =>
  rows.value.filter((r) => {
    const kw = filters.value.keyword.trim().toLowerCase()
    if (kw && !r.name.toLowerCase().includes(kw) && !r.id.toLowerCase().includes(kw))
      return false
    if (filters.value.owner && r.owner !== filters.value.owner) return false
    if (filters.value.mentor && r.mentor !== filters.value.mentor) return false
    if (filters.value.risk && r.risk !== filters.value.risk) return false
    return true
  }),
)

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
  if (row.status === 'delayed') return 'bg-error'
  if (row.status === 'in_progress') return 'bg-[#f9ab00]'
  return 'bg-secondary'
}

function statusLabel(s) {
  return { normal: '正常', delayed: '延期', completed: '已完成', in_progress: '进行中' }[s] || s
}
function statusBadge(s) {
  return {
    normal: 'bg-[#e6f4ea] text-[#137333]',
    delayed: 'bg-error-container text-on-error-container',
    completed: 'bg-surface-variant text-on-surface-variant',
    in_progress: 'bg-[#fef7e0] text-[#b06000]',
  }[s] || 'bg-surface-variant text-on-surface-variant'
}

function goDetail(id) {
  router.push(`/students/${id}`)
}

const addVisible = ref(false)
function openAdd() {
  addVisible.value = true
}
function onCreate(payload) {
  const id = `STU-${Math.floor(Math.random() * 9000 + 1000)}`
  rows.value.unshift({
    id,
    name: payload.name,
    owner: payload.owner || '—',
    mentor: payload.mentor || '—',
    progress: 0,
    status: 'normal',
    risk: 'low',
  })
  addVisible.value = false
  showMessage('已添加学生', 'success')
}
</script>
