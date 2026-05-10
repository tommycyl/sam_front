<template>
  <Teleport to="body">
    <Transition name="template-modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[92] flex items-center justify-center p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-settings-title"
      >
        <div
          class="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]"
          @click="close"
        ></div>

        <div
          class="relative flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-[0_4px_20px_rgba(29,29,75,0.08)]"
          @click.stop
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-surface-variant bg-surface-container-lowest px-6 py-4"
          >
            <h1 id="template-settings-title" class="text-headline-md font-headline-md text-on-surface">
              规则 & 模板设置
            </h1>
            <div class="flex gap-4">
              <button
                type="button"
                class="rounded-lg border border-outline-variant px-6 py-2 text-body-base font-body-base text-on-surface transition-colors hover:bg-surface-container"
                @click="close"
              >
                取消
              </button>
              <button
                type="button"
                class="rounded-lg bg-primary-container px-6 py-2 text-body-base font-body-base text-on-primary shadow-sm transition-colors hover:bg-on-primary-fixed-variant"
                @click="onSave"
              >
                保存
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 pb-8 pt-5">
            <!-- 提醒规则：单行 -->
            <section class="flex justify-center">
              <div
                class="flex max-w-full flex-nowrap items-center gap-x-3 gap-y-0 overflow-x-auto pb-0.5 text-body-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <span class="shrink-0 font-semibold text-on-surface">提醒规则</span>
                <span class="hidden h-3.5 w-px shrink-0 bg-outline-variant sm:block" aria-hidden="true" />
                <label class="shrink-0 whitespace-nowrap text-on-surface-variant" for="rule-delay-days">超截止日几天算延期</label>
                <div class="flex shrink-0 items-center gap-1">
                  <input
                    id="rule-delay-days"
                    v-model.number="rules.delayAfterDeadlineDays"
                    type="number"
                    class="w-[3.25rem] min-w-[3.25rem] rounded-lg border border-outline-variant bg-surface-container-lowest px-1.5 py-1 text-center text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span class="shrink-0 text-on-surface">天</span>
                </div>
                <span class="hidden h-3.5 w-px shrink-0 bg-outline-variant sm:block" aria-hidden="true" />
                <label class="shrink-0 whitespace-nowrap text-on-surface-variant" for="rule-urgent-days">截止前几天进入紧急</label>
                <div class="flex shrink-0 items-center gap-1">
                  <input
                    id="rule-urgent-days"
                    v-model.number="rules.urgentBeforeDeadlineDays"
                    type="number"
                    class="w-[3.25rem] min-w-[3.25rem] rounded-lg border border-outline-variant bg-surface-container-lowest px-1.5 py-1 text-center text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span class="shrink-0 text-on-surface">天</span>
                </div>
              </div>
            </section>

            <hr class="border-t border-surface-variant" />

            <!-- 任务模板 -->
            <section class="flex min-h-0 flex-1 flex-col gap-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-headline-md font-headline-md text-on-surface">任务模板</h2>
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-lg border border-dashed border-secondary bg-secondary/10 px-4 py-2 text-body-sm font-body-sm text-secondary transition-colors hover:bg-secondary/5"
                  @click="addTemplate"
                >
                  <span class="material-symbols-outlined text-[16px]">add</span>
                  新建模板
                </button>
              </div>

              <div class="flex min-h-0 flex-1 gap-6 h-[600px] max-h-[600px]">
                <!-- Sidebar -->
                <div
                  class="flex w-64 shrink-0 flex-col gap-2 rounded-lg border border-surface-variant/50 bg-surface-container-low p-2"
                >
                  <div
                    v-for="t in templates"
                    :key="t.id"
                    class="group flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 transition-colors"
                    :class="
                      t.id === activeTemplateId
                        ? 'bg-secondary/10 text-secondary'
                        : 'text-on-surface hover:bg-surface-container'
                    "
                    @click="activeTemplateId = t.id"
                  >
                    <span class="text-body-base font-body-base" :class="t.id === activeTemplateId ? 'font-semibold' : ''">
                      {{ t.name }}
                    </span>
                    <button
                      v-if="templates.length > 1"
                      type="button"
                      class="rounded p-0.5 opacity-0 transition-opacity hover:bg-error-container group-hover:opacity-100"
                      :class="t.id === activeTemplateId ? 'text-secondary' : 'text-on-surface-variant'"
                      aria-label="删除模板"
                      @click.stop="removeTemplate(t.id)"
                    >
                      <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>

                <!-- Editor -->
                <div
                  class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto rounded-xl border border-surface-variant bg-surface-container-lowest p-6"
                >
                  <div class="flex flex-col gap-2">
                    <label class="text-center text-body-sm font-body-sm text-on-surface-variant">模板名称</label>
                    <input
                      v-model="activeTemplate.name"
                      type="text"
                      class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-center text-body-base font-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div class="flex flex-wrap items-center justify-between gap-3 border-t border-surface-variant pt-4">
                    <h3 class="text-body-base font-semibold text-on-surface">
                      时间线 ({{ activeTemplate.steps.length }})
                    </h3>
                    <button
                      type="button"
                      class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-secondary bg-secondary/10 px-3 py-1.5 text-body-sm font-semibold text-secondary transition-colors hover:bg-secondary/5"
                      @click="addStep"
                    >
                      <span class="material-symbols-outlined text-[18px]">add</span>
                      添加任务
                    </button>
                  </div>

                  <div class="min-w-0 overflow-x-auto pb-0.5">
                    <div class="flex flex-col gap-3">
                    <div
                      v-for="(step, idx) in activeTemplate.steps"
                      :key="step._key"
                      class="stitch-anim-fade-in group grid min-w-[34rem] grid-cols-[2.25rem_minmax(0,1fr)_9rem_11rem_auto] items-end gap-x-3 rounded-xl border border-surface-variant/50 bg-surface-container px-4 py-3"
                    >
                      <div class="flex flex-col items-center gap-1 self-end">
                        <span class="h-4 shrink-0" aria-hidden="true"></span>
                        <span class="text-center text-body-sm font-bold text-outline">#{{ idx + 1 }}</span>
                      </div>
                      <div class="flex min-w-0 flex-col gap-1">
                        <span class="text-center text-label-caps font-label-caps text-on-surface-variant">任务名称</span>
                        <input
                          v-model="step.title"
                          type="text"
                          class="h-9 w-full min-w-0 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div class="flex w-full min-w-0 flex-col gap-1">
                        <span class="text-center text-label-caps font-label-caps text-on-surface-variant">选择负责人</span>
                        <select
                          :id="`step-owner-${step._key}`"
                          v-model="step.ownerRole"
                          class="template-owner-select h-9 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option v-for="o in OWNER_OPTIONS" :key="o" :value="o">{{ o }}</option>
                        </select>
                      </div>
                      <div class="flex w-full flex-col gap-1">
                        <span class="text-center text-label-caps font-label-caps text-on-surface-variant">时间段 (+天)</span>
                        <div class="flex h-9 items-center justify-center gap-2">
                          <input
                            v-model.number="step.startDays"
                            type="number"
                            aria-label="开始天数"
                            class="step-day-input rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span class="w-3 shrink-0 select-none text-center text-body-sm text-on-surface-variant">—</span>
                          <input
                            v-model.number="step.endDays"
                            type="number"
                            aria-label="结束天数"
                            class="step-day-input rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        class="self-center justify-self-end rounded p-1 text-error opacity-0 transition-opacity hover:bg-error-container group-hover:opacity-100"
                        aria-label="删除步骤"
                        @click="removeStep(idx)"
                      >
                        <span class="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { showMessage } from '@/utils/request'
import {
  fetchStudentTaskTemplatesFromServer,
  persistStudentTaskTemplatesPayload,
} from '@/utils/studentTaskTemplates'
import { syncTemplates } from '@/api/template'

const props = defineProps({
  visible: { type: Boolean, default: false },
})
const emit = defineEmits(['update:visible', 'save'])

/** 任务步骤负责人 */
const OWNER_OPTIONS = ['PM', 'MENTOR', '中台']

function stepKey() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function defaultSteps() {
  return [
    { _key: stepKey(), title: '择校评估', ownerRole: 'PM', startDays: 0, endDays: 4 },
    { _key: stepKey(), title: '推荐信', ownerRole: 'PM', startDays: 7, endDays: 28 },
    { _key: stepKey(), title: '文书初稿', ownerRole: 'PM', startDays: 14, endDays: 42 },
    { _key: stepKey(), title: '网申提交', ownerRole: 'PM', startDays: 50, endDays: 60 },
    { _key: stepKey(), title: '面试准备', ownerRole: 'PM', startDays: 55, endDays: 70 },
    { _key: stepKey(), title: '结果跟进', ownerRole: 'PM', startDays: 75, endDays: 90 },
  ]
}

const rules = ref({
  delayAfterDeadlineDays: 0,
  urgentBeforeDeadlineDays: 3,
})

const templates = ref([
  {
    id: 'tpl-1',
    name: '标准申请流程',
    steps: defaultSteps(),
  },
])

const activeTemplateId = ref('tpl-1')

const activeTemplate = computed(() => {
  const t = templates.value.find((x) => x.id === activeTemplateId.value)
  return t || templates.value[0]
})

function applyPayload(data) {
  if (!data?.templates?.length) return
  if (data.rules) {
    rules.value.delayAfterDeadlineDays =
      data.rules.delayAfterDeadlineDays ?? rules.value.delayAfterDeadlineDays
    rules.value.urgentBeforeDeadlineDays =
      data.rules.urgentBeforeDeadlineDays ?? rules.value.urgentBeforeDeadlineDays
  }
  templates.value = data.templates.map((t) => ({
    id: String(t.id),
    name: String(t.name ?? t.id),
    steps: (t.steps || []).map((s) => ({
      ...s,
      _key: s._key || stepKey(),
    })),
  }))
}

async function hydrate() {
  const data = await fetchStudentTaskTemplatesFromServer()
  applyPayload(data)
}

watch(
  () => props.visible,
  async (v) => {
    if (!v) return
    await hydrate()
    if (!templates.value.find((t) => t.id === activeTemplateId.value)) {
      activeTemplateId.value = templates.value[0]?.id || ''
    }
  },
)

function close() {
  emit('update:visible', false)
}

function addTemplate() {
  const n = templates.value.filter((t) => t.name.startsWith('新模板')).length + 1
  const id = `tpl_${Date.now()}`
  templates.value.push({
    id,
    name: `新模板${n > 1 ? ` (${n})` : ''}`,
    steps: [
      {
        _key: stepKey(),
        title: '新步骤',
        ownerRole: 'PM',
        startDays: 0,
        endDays: 7,
      },
    ],
  })
  activeTemplateId.value = id
}

function removeTemplate(id) {
  if (templates.value.length <= 1) return
  const i = templates.value.findIndex((t) => t.id === id)
  if (i === -1) return
  templates.value.splice(i, 1)
  if (activeTemplateId.value === id) {
    activeTemplateId.value = templates.value[Math.max(0, i - 1)]?.id || templates.value[0].id
  }
}

function removeStep(index) {
  const t = activeTemplate.value
  if (!t || t.steps.length <= 1) {
    showMessage('至少保留一个步骤', 'warning')
    return
  }
  t.steps.splice(index, 1)
}

function addStep() {
  const t = templates.value.find((x) => x.id === activeTemplateId.value)
  if (!t) return
  const last = t.steps[t.steps.length - 1]
  let startDays = 0
  let endDays = 7
  if (last && Number.isFinite(Number(last.endDays))) {
    startDays = Number(last.endDays)
    endDays = startDays + 7
  }
  t.steps.push({
    _key: stepKey(),
    title: '新任务',
    ownerRole: 'PM',
    startDays,
    endDays,
  })
}

const saving = ref(false)

async function onSave() {
  if (saving.value) return
  const payload = {
    rules: { ...rules.value },
    templates: templates.value.map((t) => ({
      id: t.id,
      name: t.name,
      steps: t.steps.map((s) => ({
        title: s.title,
        ownerRole: s.ownerRole,
        startDays: s.startDays,
        endDays: s.endDays,
      })),
    })),
  }
  saving.value = true
  try {
    const data = await syncTemplates(payload)
    if (data?.templates?.length) {
      applyPayload(data)
      persistStudentTaskTemplatesPayload({
        rules: data.rules || payload.rules,
        templates: data.templates.map((t) => ({
          id: String(t.id),
          name: String(t.name ?? t.id),
          steps: (t.steps || []).map((s) => ({ ...s })),
        })),
      })
    } else {
      persistStudentTaskTemplatesPayload(payload)
    }
    emit('save', payload)
    showMessage('模板设置已保存', 'success')
    close()
  } catch {
    /* request 拦截器已弹错误 */
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.template-modal-enter-active,
.template-modal-leave-active {
  transition: opacity 0.2s ease;
}
.template-modal-enter-active .relative,
.template-modal-leave-active .relative {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.template-modal-enter-from,
.template-modal-leave-to {
  opacity: 0;
}
.template-modal-enter-from .relative,
.template-modal-leave-to .relative {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

@keyframes stitch-fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.stitch-anim-fade-in {
  animation: stitch-fade-in 0.28s ease-out both;
}

/* 原生 select 与自定义箭头并存时易叠双箭头，统一去掉系统样式后只保留一层 */
.template-owner-select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 1.75rem;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23777680' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.4rem center;
  background-size: 1.15rem;
}

.step-day-input {
  box-sizing: border-box;
  width: 2.75rem;
  min-width: 2.75rem;
  height: 2.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}
</style>
