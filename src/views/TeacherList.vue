<template>
  <div class="bg-background p-container-padding">
    <!-- Page header -->
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-display-lg font-display-lg text-on-background mb-1">教师管理</h2>
        <p class="text-body-sm text-on-surface-variant">
          管理教职员工档案、权限及排课状态。
        </p>
      </div>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-body-base font-bold text-on-secondary shadow-sm transition-colors hover:bg-opacity-90"
        @click="openAdd"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        新增教师
      </button>
    </div>

    <!-- Filter tabs -->
    <div class="mb-6 flex space-x-2">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="rounded-full border px-6 py-2 text-body-sm font-bold transition-colors"
        :class="
          activeTab === tab.value
            ? 'bg-primary-container text-on-primary-container border-primary-container'
            : 'bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container'
        "
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Data table -->
    <div class="overflow-hidden rounded-lg border border-surface-variant bg-surface-container-lowest">
      <table class="w-full border-collapse text-left">
        <thead class="border-b border-surface-variant bg-surface-container-low">
          <tr>
            <th class="w-12 px-4 py-3 text-label-caps font-label-caps text-on-surface-variant">
              <input
                type="checkbox"
                class="rounded border-outline-variant text-primary focus:ring-primary"
                :checked="allSelected"
                @change="toggleAll($event.target.checked)"
              />
            </th>
            <th class="px-4 py-3 text-label-caps font-label-caps text-on-surface-variant">
              Teacher Name
            </th>
            <th class="px-4 py-3 text-label-caps font-label-caps text-on-surface-variant">
              学生数量
            </th>
            <th
              class="px-4 py-3 text-right text-label-caps font-label-caps text-on-surface-variant"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-variant text-body-sm text-on-background">
          <tr
            v-for="row in pagedRows"
            :key="row.id"
            class="transition-colors hover:bg-surface-container-low"
          >
            <td class="px-4 py-3">
              <input
                type="checkbox"
                class="rounded border-outline-variant text-primary focus:ring-primary"
                :checked="selected.has(row.id)"
                @change="toggleRow(row.id, $event.target.checked)"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center">
                <div
                  class="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-variant bg-surface-container text-body-sm font-bold text-primary"
                >
                  <img
                    v-if="row.avatar"
                    :src="row.avatar"
                    :alt="row.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else>{{ initials(row.name) }}</span>
                </div>
                <div class="min-w-0">
                  <button
                    type="button"
                    class="block text-left font-bold text-primary hover:text-secondary transition-colors"
                    @click="goDetail(row.id)"
                  >
                    {{ row.name }}
                  </button>
                  <div class="mt-0.5 text-xs text-on-surface-variant">
                    {{ roleLabel(row.role) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">{{ row.studentCount }}</td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  class="text-body-sm font-bold text-primary transition-colors hover:text-secondary"
                  @click="onEdit(row)"
                >
                  编辑
                </button>
                <button
                  type="button"
                  class="text-body-sm font-bold text-error transition-colors hover:text-on-error-container"
                  @click="onDelete(row)"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!pagedRows.length">
            <td colspan="4" class="px-4 py-12 text-center text-body-sm text-on-surface-variant">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
        class="flex items-center justify-between border-t border-surface-variant bg-surface-container-low px-4 py-3"
      >
        <span class="text-body-sm text-on-surface-variant">
          显示 {{ rangeStart }} - {{ rangeEnd }} 共 {{ filtered.length }} 条记录
        </span>
        <div class="flex space-x-1">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded border border-surface-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
            :disabled="page === 1"
            @click="page--"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            v-for="n in pageList"
            :key="n"
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded border text-body-sm font-medium"
            :class="
              n === page
                ? 'border-primary bg-primary text-on-primary'
                : 'border-surface-variant bg-surface-container-lowest text-on-background hover:bg-surface-variant'
            "
            @click="page = n"
          >
            {{ n }}
          </button>
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded border border-surface-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-variant disabled:opacity-50"
            :disabled="page === totalPages"
            @click="page++"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <AddTeacherModal
      v-model:visible="addVisible"
      :initial="editing"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AddTeacherModal from '@/components/AddTeacherModal.vue'
import { showMessage } from '@/utils/request'

const router = useRouter()

const tabs = [
  { value: 'all', label: '全部' },
  { value: 'PM', label: 'PM' },
  { value: 'MENTOR', label: 'MENTOR' },
  { value: 'PM_MENTOR', label: 'PM & MENTOR' },
  { value: 'MID_PLATFORM', label: '中台' },
]
const activeTab = ref('all')

const rows = ref([
  {
    id: 'TCH-2023-041',
    name: 'Dr. Sarah Jenkins',
    code: 'TCH-2023-041',
    studentCount: 42,
    email: 's.jenkins@indigo.edu',
    role: 'MENTOR',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    id: 'TCH-2018-012',
    name: 'Prof. Michael Chang',
    code: 'TCH-2018-012',
    studentCount: 128,
    email: 'm.chang@indigo.edu',
    role: 'MENTOR',
    avatar: 'https://i.pravatar.cc/80?img=11',
  },
  {
    id: 'TCH-2021-088',
    name: 'Elena Rodriguez',
    code: 'TCH-2021-088',
    studentCount: 0,
    email: 'e.rodriguez@indigo.edu',
    role: 'PM',
    avatar: '',
  },
  {
    id: 'TCH-2022-104',
    name: 'Dr. Amara Singh',
    code: 'TCH-2022-104',
    studentCount: 65,
    email: 'a.singh@indigo.edu',
    role: 'MENTOR',
    avatar: 'https://i.pravatar.cc/80?img=32',
  },
])

const filtered = computed(() => {
  if (activeTab.value === 'all') return rows.value
  return rows.value.filter((r) => r.role === activeTab.value)
})

const pageSize = 10
const page = ref(1)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / pageSize)),
)
const pageList = computed(() => {
  const total = totalPages.value
  const list = []
  for (let i = 1; i <= Math.min(3, total); i++) list.push(i)
  if (total > 3 && !list.includes(total)) list.push(total)
  return list
})
const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})
const rangeStart = computed(() =>
  filtered.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1,
)
const rangeEnd = computed(() =>
  Math.min(page.value * pageSize, filtered.value.length),
)

const selected = ref(new Set())
const allSelected = computed(
  () => pagedRows.value.length > 0 && pagedRows.value.every((r) => selected.value.has(r.id)),
)
function toggleAll(checked) {
  const next = new Set(selected.value)
  pagedRows.value.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)))
  selected.value = next
}
function toggleRow(id, checked) {
  const next = new Set(selected.value)
  checked ? next.add(id) : next.delete(id)
  selected.value = next
}

function initials(name) {
  return name
    .replace(/(Dr\.|Prof\.)/g, '')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/** 与新增/编辑弹窗「所属部门」取值一致 */
function roleLabel(role) {
  return (
    {
      PM: 'PM',
      MENTOR: 'MENTOR',
      PM_MENTOR: 'PM & MENTOR',
      MID_PLATFORM: '中台',
      TEACHER: '老师',
    }[role] || role || '—'
  )
}

function goDetail(id) {
  router.push(`/teachers/${id}`)
}

const addVisible = ref(false)
const editing = ref(null)
function openAdd() {
  editing.value = null
  addVisible.value = true
}
function onEdit(row) {
  editing.value = { ...row }
  addVisible.value = true
}
function onDelete(row) {
  if (!confirm(`确定删除 ${row.name}？`)) return
  rows.value = rows.value.filter((r) => r.id !== row.id)
  showMessage('已删除', 'success')
}
function onSubmit(payload) {
  if (editing.value) {
    const i = rows.value.findIndex((r) => r.id === editing.value.id)
    if (i >= 0) rows.value[i] = { ...rows.value[i], ...payload }
    showMessage('已保存', 'success')
  } else {
    const id = `TCH-${new Date().getFullYear()}-${String(rows.value.length + 1).padStart(3, '0')}`
    rows.value.unshift({
      id,
      code: id,
      studentCount: 0,
      avatar: '',
      ...payload,
    })
    showMessage('已添加', 'success')
  }
  addVisible.value = false
}
</script>
