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
        <div class="flex overflow-hidden rounded border border-outline-variant bg-surface-container-lowest">
          <button
            v-for="r in ['周', '月']"
            :key="r"
            type="button"
            class="px-3 py-1.5 text-sm font-medium transition-colors"
            :class="
              range === r
                ? 'bg-surface-container-high text-on-surface'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            "
            @click="range = r"
          >
            {{ r }}
          </button>
        </div>
        <button
          type="button"
          class="rounded border border-outline-variant bg-surface-container-lowest px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-surface-container-low"
        >
          编辑信息
        </button>
        <button
          type="button"
          class="rounded border border-outline-variant bg-surface-container-lowest px-4 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-surface-container-low"
        >
          套模板
        </button>
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
              {{ t.title }} → {{ t.endDate }}
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
              {{ t.title }} 截止 {{ t.endDate }}
            </div>
          </div>
        </div>
      </section>

      <!-- Gantt -->
      <section class="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div class="flex items-center gap-4 border-b border-surface-variant p-4">
          <div class="flex overflow-hidden rounded bg-surface-container text-sm">
            <button
              type="button"
              class="px-3 py-1 text-on-surface-variant transition-colors hover:bg-surface-variant"
            >‹ 前</button>
            <button type="button" class="bg-surface-container-highest px-3 py-1 font-medium">
              今天
            </button>
            <button
              type="button"
              class="px-3 py-1 text-on-surface-variant transition-colors hover:bg-surface-variant"
            >后 ›</button>
          </div>
          <span class="text-sm text-on-surface-variant">5/2 — 6/25</span>
        </div>

        <div class="flex">
          <!-- Y-Axis -->
          <div class="w-48 flex-shrink-0 border-r border-surface-variant bg-surface-container-low/50">
            <div class="flex h-10 items-center border-b border-surface-variant px-4">
              <span class="text-xs font-medium text-on-surface-variant">任务</span>
            </div>
            <div
              v-for="t in tasks"
              :key="t.title"
              class="relative flex h-16 items-center border-b border-surface-variant px-4"
              :class="{ 'bg-error-container/10': t.status === 'delayed' }"
            >
              <div class="absolute left-2 h-2 w-2 rounded-full" :class="t.dotColor"></div>
              <div class="pl-3">
                <div
                  class="text-sm font-bold"
                  :class="t.status === 'delayed' ? 'text-error' : ''"
                >{{ t.title }}</div>
                <div
                  class="mt-1 text-xs"
                  :class="t.status === 'delayed' ? 'text-error' : 'text-on-surface-variant'"
                >
                  {{ t.tag }}
                  <span
                    v-if="t.status === 'delayed'"
                    class="ml-1 rounded bg-error px-1 text-[10px] text-white"
                  >延期</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <div class="flex-1 overflow-x-auto">
            <div class="relative min-w-[800px]">
              <div
                class="flex h-10 border-b border-surface-variant bg-surface-container-low/50 text-xs font-medium text-on-surface-variant"
              >
                <div class="flex flex-1 items-center justify-center border-r border-surface-variant">W1</div>
                <div class="relative flex flex-1 items-center justify-center border-r border-surface-variant">
                  <div class="absolute bottom-0 left-0 top-0 z-10 w-[2px] bg-secondary">
                    <div class="absolute -left-2 -top-1 rounded bg-secondary px-1 py-0.5 text-[10px] text-white">
                      今
                    </div>
                  </div>
                  W2
                </div>
                <div class="flex flex-1 items-center justify-center border-r border-surface-variant">W3</div>
                <div class="flex flex-1 items-center justify-center border-r border-surface-variant">W4</div>
              </div>

              <div class="relative">
                <div class="absolute bottom-0 left-[25%] top-0 z-0 w-[2px] bg-secondary/30"></div>

                <div
                  v-for="t in tasks"
                  :key="t.title + 'bar'"
                  class="relative flex h-16 items-center border-b border-surface-variant"
                  :class="{ 'bg-error-container/10': t.status === 'delayed' }"
                >
                  <div
                    class="absolute flex h-8 items-center justify-between rounded border-2 px-2 text-xs"
                    :class="t.barClass"
                    :style="{ left: t.barLeft, width: t.barWidth }"
                  >
                    <div class="flex items-center gap-1">
                      <div class="h-2 w-2 rounded-full" :class="t.dotColor"></div>
                      <span class="font-bold">{{ t.title }}</span>
                    </div>
                    <span class="hidden md:inline">{{ t.dateShort }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            class="flex items-center gap-4 p-4"
          >
            <div class="flex w-8 justify-center">
              <div class="h-2 w-2 rounded-full" :class="t.dotColor"></div>
            </div>
            <div class="flex-1">
              <div class="text-sm font-bold" :class="t.status === 'delayed' ? 'text-error' : ''">
                {{ t.title }}
              </div>
            </div>
            <div class="w-24">
              <span class="rounded px-2 py-0.5 text-xs" :class="t.tagClass">{{ t.tag }}</span>
            </div>
            <div class="flex-1 text-center text-sm text-on-surface-variant">
              {{ t.startDate }} → {{ t.endDate }}
            </div>
            <div class="w-24 text-right">
              <span
                class="rounded px-2 py-0.5 text-xs"
                :class="taskStatusClass(t.status)"
              >{{ taskStatusLabel(t.status) }}</span>
            </div>
            <div class="w-24 text-right">
              <button
                type="button"
                class="rounded bg-primary px-3 py-1 text-xs font-medium text-on-primary transition-opacity hover:opacity-90"
                @click="cycleStatus(t)"
              >
                修改状态
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

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
    tag: '申请',
    tagClass: 'bg-blue-100 text-[#2196F3]',
    dotColor: 'bg-[#2196F3]',
    startDate: '2026-04-06',
    endDate: '2026-04-10',
    status: 'completed',
    barClass: 'border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
    barLeft: '0.5rem',
    barWidth: '5%',
    dateShort: '4/06~4/10',
  },
  {
    title: '推荐信',
    tag: '材料',
    tagClass: 'bg-purple-100 text-[#9C27B0]',
    dotColor: 'bg-[#9C27B0]',
    startDate: '2026-04-13',
    endDate: '2026-05-04',
    status: 'delayed',
    barClass: 'border-error bg-error/10 text-error',
    barLeft: '8%',
    barWidth: '4%',
    dateShort: '4/13~5/04',
  },
  {
    title: '文书初稿',
    tag: '材料',
    tagClass: 'bg-purple-100 text-[#9C27B0]',
    dotColor: 'bg-[#9C27B0]',
    startDate: '2026-04-20',
    endDate: '2026-05-18',
    status: 'in_progress',
    barClass: 'border-[#9C27B0] bg-[#9C27B0]/10 text-[#9C27B0]',
    barLeft: '26%',
    barWidth: '40%',
    dateShort: '4/20~5/18',
  },
  {
    title: '网申提交',
    tag: '申请',
    tagClass: 'bg-blue-100 text-[#2196F3]',
    dotColor: 'bg-[#2196F3]',
    startDate: '2026-05-26',
    endDate: '2026-06-05',
    status: 'pending',
    barClass: 'border-[#2196F3] bg-[#2196F3]/10 text-[#2196F3]',
    barLeft: '60%',
    barWidth: '15%',
    dateShort: '5/26~6/05',
  },
  {
    title: '面试准备',
    tag: '面试',
    tagClass: 'bg-orange-100 text-[#FF9800]',
    dotColor: 'bg-[#FF9800]',
    startDate: '2026-05-31',
    endDate: '2026-06-15',
    status: 'pending',
    barClass: 'border-[#FF9800] bg-[#FF9800]/10 text-[#FF9800]',
    barLeft: '70%',
    barWidth: '20%',
    dateShort: '5/31~6/15',
  },
  {
    title: '结果跟进',
    tag: '跟进',
    tagClass: 'bg-green-100 text-[#4CAF50]',
    dotColor: 'bg-[#4CAF50]',
    startDate: '2026-06-20',
    endDate: '2026-07-05',
    status: 'pending',
    barClass: 'border-[#4CAF50] bg-[#4CAF50]/10 text-[#4CAF50]',
    barLeft: '85%',
    barWidth: '15%',
    dateShort: '6/20~7/05',
  },
])

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
function taskStatusClass(s) {
  return {
    completed: 'bg-green-100 text-green-700',
    delayed: 'bg-error-container text-error',
    in_progress: 'bg-surface-container-high text-on-surface-variant',
    pending: 'bg-transparent text-on-surface-variant',
  }[s] || 'bg-surface-container-high text-on-surface-variant'
}

const order = ['pending', 'in_progress', 'completed', 'delayed']
function cycleStatus(t) {
  const i = order.indexOf(t.status)
  t.status = order[(i + 1) % order.length]
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/students')
}
</script>
