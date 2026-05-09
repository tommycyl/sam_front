<template>
  <transition name="fade">
    <div v-if="visible" class="fixed inset-0 z-[80]">
      <div
        class="absolute inset-0 bg-[rgba(15,23,42,0.4)] backdrop-blur-sm"
        @click="close"
      ></div>

      <div class="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          class="w-full max-w-md overflow-hidden rounded-xl bg-surface-container-lowest text-left shadow-modal"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-surface-variant px-6 pb-4 pt-6"
          >
            <h3 class="text-headline-md font-headline-md text-primary">
              {{ initial ? '编辑教师' : '新增教师' }}
            </h3>
            <button
              type="button"
              class="rounded-md text-on-surface-variant transition-colors hover:text-on-surface"
              @click="close"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Body -->
          <form class="space-y-4 px-6 py-5" @submit.prevent="submit">
            <div>
              <label
                class="block text-body-sm font-semibold"
                :class="errors.name ? 'text-error' : 'text-on-surface'"
                for="t-name"
              >
                教师姓名 <span class="text-error">*</span>
              </label>
              <input
                id="t-name"
                v-model="form.name"
                type="text"
                placeholder="请输入姓名"
                class="mt-1 block w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-body-base text-on-surface placeholder:text-outline focus:outline-none"
                :class="
                  errors.name
                    ? 'ring-2 ring-inset ring-error focus:ring-error'
                    : 'ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-inset focus:ring-primary'
                "
                @input="errors.name = false"
              />
              <p v-if="errors.name" class="mt-1 text-body-sm text-error">请填写教师姓名</p>
            </div>

            <div>
              <label
                class="block text-body-sm font-semibold"
                :class="errors.role ? 'text-error' : 'text-on-surface'"
                for="t-role"
              >
                所属部门 <span class="text-error">*</span>
              </label>
              <select
                id="t-role"
                v-model="form.role"
                class="mt-1 block w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-body-base text-on-surface focus:outline-none"
                :class="
                  errors.role
                    ? 'ring-2 ring-inset ring-error focus:ring-error'
                    : 'ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-inset focus:ring-primary'
                "
                @change="errors.role = false"
              >
                <option value="" disabled>请选择所属部门</option>
                <option value="PM">PM</option>
                <option value="MENTOR">MENTOR</option>
                <option value="PM_MENTOR">PM &amp; MENTOR</option>
                <option value="MID_PLATFORM">中台</option>
              </select>
              <p v-if="errors.role" class="mt-1 text-body-sm text-error">请选择所属部门</p>
            </div>
          </form>

          <!-- Footer -->
          <div
            class="flex flex-row-reverse gap-3 border-t border-surface-variant bg-surface-container-low px-6 py-4 rounded-b-xl"
          >
            <button
              type="button"
              class="inline-flex justify-center rounded-lg bg-primary-container px-4 py-2 text-body-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary"
              @click="submit"
            >
              {{ initial ? '保存修改' : '确认添加' }}
            </button>
            <button
              type="button"
              class="inline-flex justify-center rounded-lg bg-surface-container-lowest px-4 py-2 text-body-sm font-semibold text-on-surface ring-1 ring-inset ring-outline-variant hover:bg-surface-container-low"
              @click="close"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { showMessage } from '@/utils/request'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'submit'])

const ROLE_OPTIONS = ['PM', 'MENTOR', 'PM_MENTOR', 'MID_PLATFORM']

const form = reactive({ name: '', role: '' })

const errors = reactive({
  name: false,
  role: false,
})

function clearFieldErrors() {
  errors.name = false
  errors.role = false
}

function validateForm() {
  clearFieldErrors()
  let valid = true
  if (!form.name.trim()) {
    errors.name = true
    valid = false
  }
  if (!form.role || !ROLE_OPTIONS.includes(form.role)) {
    errors.role = true
    valid = false
  }
  return valid
}

watch(
  () => props.visible,
  (v) => {
    clearFieldErrors()
    if (v) {
      form.name = props.initial?.name || ''
      form.role =
        props.initial?.role && ROLE_OPTIONS.includes(props.initial.role)
          ? props.initial.role
          : ''
    }
  },
  { immediate: true },
)

function close() {
  clearFieldErrors()
  emit('update:visible', false)
}
function submit() {
  if (!validateForm()) {
    showMessage('请填写或选择所有必填项', 'warning')
    return
  }
  emit('submit', { ...form })
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
