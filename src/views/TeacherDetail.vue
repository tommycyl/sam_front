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
        <div class="mb-1 flex items-center gap-3">
          <h2 class="text-display-lg font-display-lg text-primary">{{ teacher.name }}</h2>
          <span
            class="rounded border border-secondary-fixed-dim bg-secondary-fixed px-2 py-0.5 text-label-caps font-label-caps text-on-secondary-fixed"
          >{{ teacher.title }}</span>
        </div>
        <p class="mb-4 text-body-base text-on-surface-variant">
          {{ teacher.department }} | 编号: {{ teacher.code }}
        </p>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-on-surface">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-outline">email</span>
            {{ teacher.email }}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-outline">phone</span>
            {{ teacher.phone }}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-outline">location_on</span>
            {{ teacher.office }}
          </div>
        </div>
      </div>
    </section>

    <!-- Summary Cards -->
    <section class="grid grid-cols-1 gap-grid-gutter md:grid-cols-3">
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
              <th class="px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">学号</th>
              <th class="px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">年级</th>
              <th class="px-5 py-3 text-label-caps font-label-caps text-on-surface-variant">状态</th>
              <th class="px-5 py-3 text-right text-label-caps font-label-caps text-on-surface-variant">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant text-body-base text-on-surface">
            <tr
              v-for="s in students"
              :key="s.id"
              class="transition-colors hover:bg-surface-container-low/50"
            >
              <td class="px-5 py-3 font-semibold">{{ s.name }}</td>
              <td class="px-5 py-3 text-body-sm text-on-surface-variant">{{ s.id }}</td>
              <td class="px-5 py-3 text-on-surface-variant">{{ s.grade }}</td>
              <td class="px-5 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border"
                  :class="studentStatusClass(s.status)"
                >{{ studentStatusLabel(s.status) }}</span>
              </td>
              <td class="px-5 py-3 text-right">
                <button
                  type="button"
                  class="text-outline transition-colors hover:text-primary"
                >
                  <span class="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Tasks Overview -->
    <section class="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <div class="mb-6 flex items-center justify-between">
        <h3 class="text-headline-md font-headline-md text-primary">任务明细</h3>
        <button type="button" class="text-body-sm font-semibold text-secondary hover:underline">
          查看所有任务
        </button>
      </div>
      <div class="grid grid-cols-1 gap-grid-gutter md:grid-cols-3">
        <div
          v-for="t in tasks"
          :key="t.title"
          class="flex items-center gap-3 rounded-lg border border-outline-variant p-4 transition-colors hover:bg-surface-container-low/50"
        >
          <div class="h-2 w-2 shrink-0 rounded-full" :class="t.dotColor"></div>
          <div class="min-w-0 flex-1">
            <div class="mb-1 flex items-center gap-2">
              <span class="truncate text-body-base font-semibold text-on-surface">
                {{ t.title }}
              </span>
              <span
                class="rounded px-2 py-0.5 text-[10px] font-medium"
                :class="t.tagClass"
              >{{ t.tag }}</span>
            </div>
            <div class="flex items-center gap-1 text-body-sm text-on-surface-variant">
              <span class="material-symbols-outlined text-[14px]">calendar_today</span>
              {{ t.dateRange }}
            </div>
          </div>
          <div class="shrink-0">
            <span
              class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
              :class="t.statusClass"
            >{{ t.statusLabel }}</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({ id: { type: String, required: true } })

const teacher = ref({
  id: props.id,
  name: 'Sarah Jenkins 博士',
  code: props.id || 'TCH-2023-041',
  title: '高级教授',
  department: '计算机科学学院',
  email: 'sarah.j@indigo.edu',
  phone: '+86 138 0000 0000',
  office: '科研主楼 402室',
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
  {
    label: '完成率',
    value: '92%',
    icon: 'check_circle',
    iconBg: 'bg-secondary-fixed/30 group-hover:bg-secondary-fixed',
    iconText: 'text-secondary-container',
  },
]

const students = ref([
  { id: 'STU-24-001', name: '陈明 (Chen Ming)', grade: '研二', status: 'normal' },
  { id: 'STU-24-045', name: '李华 (Li Hua)', grade: '博一', status: 'normal' },
  { id: 'STU-23-112', name: '王晓 (Wang Xiao)', grade: '研三', status: 'attention' },
  { id: 'STU-24-089', name: '张伟 (Zhang Wei)', grade: '研一', status: 'normal' },
])

function studentStatusLabel(s) {
  return { normal: '正常', attention: '需关注' }[s] || s
}
function studentStatusClass(s) {
  return s === 'attention'
    ? 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim'
    : 'bg-surface-container-high text-on-surface border-outline-variant'
}

const tasks = [
  {
    title: '初步评估',
    tag: '申请',
    tagClass: 'bg-secondary-container/10 text-on-secondary-fixed-variant',
    dateRange: '2026-04-06 → 2026-04-10',
    dotColor: 'bg-secondary',
    statusLabel: '进行中',
    statusClass: 'bg-surface-container-high text-on-surface border-outline-variant',
  },
  {
    title: '推荐信',
    tag: '材料',
    tagClass: 'bg-primary-fixed/20 text-on-primary-fixed-variant',
    dateRange: '2026-04-01 → 2026-04-05',
    dotColor: 'bg-primary',
    statusLabel: '已完成',
    statusClass: 'bg-surface-container-high text-on-surface border-outline-variant',
  },
  {
    title: '文书初稿',
    tag: '面试',
    tagClass: 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant',
    dateRange: '2026-03-25 → 2026-03-30',
    dotColor: 'bg-error',
    statusLabel: '延期',
    statusClass: 'bg-error-container text-on-error-container border-error-container',
  },
]

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/teachers')
}
</script>
