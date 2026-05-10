<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[80]">
      <div
        class="absolute inset-0 bg-surface-variant/80 backdrop-blur-sm"
        @click="close"
      ></div>

      <div class="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          class="w-full max-w-[600px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            class="absolute right-6 top-6 text-on-surface-variant transition-colors hover:text-on-surface"
            @click="close"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>

          <div class="px-8 pb-6 pt-8">
            <h2 class="text-display-lg font-display-lg text-on-surface">
              {{ initial ? '编辑学生' : '新增学生' }}
            </h2>
          </div>

          <form class="px-8 pb-8" @submit.prevent="submit">
            <div class="grid grid-cols-1 gap-x-grid-gutter gap-y-6 md:grid-cols-2">
              <div class="flex flex-col gap-2">
                <label
                  class="text-label-caps font-label-caps"
                  :class="errors.name ? 'text-error' : 'text-on-surface-variant'"
                >
                  学生姓名 *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="姓名"
                  class="h-12 w-full rounded-lg bg-surface-container-lowest px-4 text-body-base text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2"
                  :class="
                    errors.name
                      ? 'border-2 border-error focus:ring-error/35'
                      : 'border-2 border-secondary focus:ring-secondary/50'
                  "
                  @input="errors.name = false"
                />
                <p v-if="errors.name" class="text-body-sm text-error">请填写学生姓名</p>
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-label-caps font-label-caps"
                  :class="errors.startDate ? 'text-error' : 'text-on-surface-variant'"
                >
                  申请起始日期 *
                </label>
                <input
                  v-model="form.startDate"
                  type="text"
                  placeholder="YYYY/MM/DD"
                  class="h-12 w-full rounded-lg bg-surface-container-lowest px-4 text-body-base text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2"
                  :class="
                    errors.startDate
                      ? 'border-2 border-error focus:ring-error/35'
                      : 'border border-outline-variant focus:border-secondary focus:ring-secondary/30'
                  "
                  @input="errors.startDate = false"
                />
                <p v-if="errors.startDate" class="text-body-sm text-error">请填写正确日期，格式 YYYY/MM/DD</p>
              </div>

              <div class="flex flex-col gap-2 md:col-span-2">
                <label
                  class="text-label-caps font-label-caps"
                  :class="errors.templateId ? 'text-error' : 'text-on-surface-variant'"
                >
                  任务模板 *
                </label>
                <select
                  v-model="form.templateId"
                  class="h-12 w-full appearance-none rounded-lg bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:outline-none focus:ring-2"
                  :class="
                    errors.templateId
                      ? 'border-2 border-error focus:ring-error/35'
                      : 'border border-outline-variant focus:border-secondary focus:ring-secondary/30'
                  "
                  :style="selectArrow"
                  @change="errors.templateId = false"
                >
                  <option value="" disabled>请选择任务模板</option>
                  <option v-for="t in templateOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                </select>
                <p v-if="errors.templateId" class="text-body-sm text-error">请选择任务模板</p>
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-label-caps font-label-caps"
                  :class="errors.mentorId ? 'text-error' : 'text-on-surface-variant'"
                >
                  MENTOR *
                </label>
                <select
                  v-model="form.mentorId"
                  class="h-12 w-full appearance-none rounded-lg bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:outline-none focus:ring-2 disabled:opacity-60"
                  :class="
                    errors.mentorId
                      ? 'border-2 border-error focus:ring-error/35'
                      : 'border border-outline-variant focus:border-secondary focus:ring-secondary/30'
                  "
                  :disabled="optionsLoading"
                  :style="selectArrow"
                  @change="errors.mentorId = false"
                >
                  <option value="" disabled>{{ optionsLoading ? '加载中…' : '请选择 MENTOR' }}</option>
                  <option v-for="o in mentorOptions" :key="o.id" :value="o.id">{{ o.name }}</option>
                </select>
                <p v-if="errors.mentorId" class="text-body-sm text-error">请选择 MENTOR</p>
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-label-caps font-label-caps"
                  :class="errors.pmId ? 'text-error' : 'text-on-surface-variant'"
                >
                  PM *
                </label>
                <select
                  v-model="form.pmId"
                  class="h-12 w-full appearance-none rounded-lg bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:outline-none focus:ring-2 disabled:opacity-60"
                  :class="
                    errors.pmId
                      ? 'border-2 border-error focus:ring-error/35'
                      : 'border border-outline-variant focus:border-secondary focus:ring-secondary/30'
                  "
                  :disabled="optionsLoading"
                  :style="selectArrow"
                  @change="errors.pmId = false"
                >
                  <option value="" disabled>{{ optionsLoading ? '加载中…' : '请选择 PM' }}</option>
                  <option v-for="o in pmOptions" :key="o.id" :value="o.id">{{ o.name }}</option>
                </select>
                <p v-if="errors.pmId" class="text-body-sm text-error">请选择 PM</p>
              </div>

              <div class="flex flex-col gap-2 md:col-span-2">
                <label
                  class="text-label-caps font-label-caps"
                  :class="errors.midPlatformId ? 'text-error' : 'text-on-surface-variant'"
                >
                  中台 *
                </label>
                <select
                  v-model="form.midPlatformId"
                  class="h-12 w-full appearance-none rounded-lg bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:outline-none focus:ring-2 disabled:opacity-60"
                  :class="
                    errors.midPlatformId
                      ? 'border-2 border-error focus:ring-error/35'
                      : 'border border-outline-variant focus:border-secondary focus:ring-secondary/30'
                  "
                  :disabled="optionsLoading"
                  :style="selectArrow"
                  @change="errors.midPlatformId = false"
                >
                  <option value="" disabled>
                    {{
                      optionsLoading
                        ? '加载中…'
                        : midPlatformOptions.length
                          ? '请选择中台老师'
                          : '暂无中台老师，请先在教师管理中新增'
                    }}
                  </option>
                  <option v-for="o in midPlatformOptions" :key="o.id" :value="o.id">{{ o.name }}</option>
                </select>
                <p v-if="errors.midPlatformId" class="text-body-sm text-error">请选择中台老师</p>
              </div>
            </div>
          </form>

          <div class="flex justify-end gap-4 px-8 pb-8 pt-4">
            <button
              type="button"
              class="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-6 text-body-base text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
              @click="close"
            >
              取消
            </button>
            <button
              type="button"
              class="flex h-10 items-center justify-center rounded-lg bg-primary-container px-6 text-body-base text-on-primary transition-colors hover:bg-primary"
              @click="submit"
            >
              {{ initial ? '保存修改' : '添加学生' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import {
  fetchStudentFormMentorOptions,
  fetchStudentFormMidPlatformOptions,
  fetchStudentFormPmOptions,
} from '@/api/student'
import {
  fetchStudentTemplateSelectOptions,
  getStudentTemplateSelectOptions,
} from '@/utils/studentTaskTemplates'
import { showMessage } from '@/utils/request'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'submit'])

const today = new Date()
const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

/** 接口未就绪时与列表 mock 负责人/MENTOR 大致对齐 */
const FALLBACK_PM_OPTIONS = [
  { id: 'pm-zs', name: 'Zhang San' },
  { id: 'pm-ls', name: 'Li Si' },
  { id: 'pm-ww', name: 'Wang Wu' },
]
const FALLBACK_MENTOR_OPTIONS = [
  { id: 'm-sm', name: 'Dr. Smith' },
  { id: 'm-dv', name: 'Prof. Davis' },
  { id: 'm-ml', name: 'Dr. Miller' },
  { id: 'm-ls', name: 'Prof. Lee' },
]
const FALLBACK_MIDPLATFORM_OPTIONS = []

const form = reactive({
  name: '',
  startDate: todayStr,
  templateId: '',
  pmId: '',
  mentorId: '',
  midPlatformId: '',
})

const pmOptions = ref([])
const mentorOptions = ref([])
const midPlatformOptions = ref([])
const templateOptions = ref([])
const optionsLoading = ref(false)

const errors = reactive({
  name: false,
  startDate: false,
  templateId: false,
  mentorId: false,
  pmId: false,
  midPlatformId: false,
})

function toSlashDisplayDate(value) {
  const s = String(value || '').trim()
  if (!s) return ''
  return s.replace(/-/g, '/')
}

function clearFieldErrors() {
  errors.name = false
  errors.startDate = false
  errors.templateId = false
  errors.mentorId = false
  errors.pmId = false
  errors.midPlatformId = false
}

function isValidStartDate(s) {
  const t = String(s || '').trim().replace(/-/g, '/')
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(t)) return false
  const [y, mo, d] = t.split('/').map(Number)
  const dt = new Date(y, mo - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d
}

function validateForm() {
  clearFieldErrors()
  let valid = true
  if (!form.name.trim()) {
    errors.name = true
    valid = false
  }
  if (!String(form.startDate || '').trim() || !isValidStartDate(form.startDate)) {
    errors.startDate = true
    valid = false
  }
  if (!form.templateId) {
    errors.templateId = true
    valid = false
  }
  if (!optionsLoading.value) {
    if (!form.mentorId) {
      errors.mentorId = true
      valid = false
    }
    if (!form.pmId) {
      errors.pmId = true
      valid = false
    }
    if (!form.midPlatformId) {
      errors.midPlatformId = true
      valid = false
    }
  }
  return valid
}

const selectArrow = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2347464f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1em',
}

function normalizePersonOptions(data) {
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

function matchOptionId(options, name, existingId) {
  if (existingId && options.some((o) => o.id === String(existingId))) return String(existingId)
  if (!name) return ''
  const o = options.find((x) => x.name === name)
  return o ? String(o.id) : ''
}

function refreshTemplateOptions() {
  templateOptions.value = getStudentTemplateSelectOptions()
}

async function refreshTemplateOptionsFromServer() {
  try {
    const list = await fetchStudentTemplateSelectOptions()
    if (list?.length) templateOptions.value = list
  } catch {
    /* keep local fallback */
  }
}

async function loadRoleOptions() {
  optionsLoading.value = true
  let pm = []
  let mentor = []
  let mid = []
  try {
    const [pmData, mentorData, midData] = await Promise.all([
      fetchStudentFormPmOptions({ silent: true, loading: false }),
      fetchStudentFormMentorOptions({ silent: true, loading: false }),
      fetchStudentFormMidPlatformOptions({ silent: true, loading: false }),
    ])
    pm = normalizePersonOptions(pmData)
    mentor = normalizePersonOptions(mentorData)
    mid = normalizePersonOptions(midData)
  } catch {
    pm = [...FALLBACK_PM_OPTIONS]
    mentor = [...FALLBACK_MENTOR_OPTIONS]
    mid = [...FALLBACK_MIDPLATFORM_OPTIONS]
  }
  if (!pm.length) pm = [...FALLBACK_PM_OPTIONS]
  if (!mentor.length) mentor = [...FALLBACK_MENTOR_OPTIONS]
  pmOptions.value = pm
  mentorOptions.value = mentor
  midPlatformOptions.value = mid
  optionsLoading.value = false
}

watch(
  () => props.visible,
  async (v) => {
    if (!v) return
    clearFieldErrors()
    refreshTemplateOptions()
    await Promise.all([loadRoleOptions(), refreshTemplateOptionsFromServer()])
    form.name = props.initial?.name || ''
    form.startDate = toSlashDisplayDate(props.initial?.startDate) || todayStr
    const initTid = props.initial?.templateId
    const opts = templateOptions.value
    form.templateId =
      initTid && opts.some((o) => o.id === String(initTid)) ? String(initTid) : opts[0]?.id || ''
    form.pmId = matchOptionId(
      pmOptions.value,
      props.initial?.owner,
      props.initial?.pmId,
    )
    form.mentorId = matchOptionId(
      mentorOptions.value,
      props.initial?.mentor,
      props.initial?.mentorId,
    )
    form.midPlatformId = matchOptionId(
      midPlatformOptions.value,
      props.initial?.midPlatform,
      props.initial?.midPlatformId,
    )
  },
  { immediate: true },
)

function close() {
  clearFieldErrors()
  emit('update:visible', false)
}
function submit() {
  if (optionsLoading.value) {
    showMessage('负责人选项加载中，请稍候', 'info')
    return
  }
  if (!validateForm()) {
    showMessage('请填写或选择所有必填项', 'warning')
    return
  }
  const pm = pmOptions.value.find((o) => o.id === form.pmId)
  const ment = mentorOptions.value.find((o) => o.id === form.mentorId)
  const mid = midPlatformOptions.value.find((o) => o.id === form.midPlatformId)
  const tpl = templateOptions.value.find((o) => o.id === form.templateId)
  emit('submit', {
    id: props.initial?.id ?? null,
    name: form.name.trim(),
    startDate: form.startDate,
    templateId: form.templateId,
    templateName: tpl?.name || '',
    owner: pm?.name || '',
    mentor: ment?.name || '',
    midPlatform: mid?.name || '',
    pmId: form.pmId,
    mentorId: form.mentorId,
    midPlatformId: form.midPlatformId,
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
