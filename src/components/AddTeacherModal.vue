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
              <label class="block text-body-sm font-semibold text-on-surface" for="t-name">
                教师姓名 <span class="text-error">*</span>
              </label>
              <input
                id="t-name"
                v-model="form.name"
                type="text"
                required
                placeholder="请输入姓名"
                class="mt-1 block w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-body-base text-on-surface ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-body-sm font-semibold text-on-surface" for="t-role">
                所属部门
              </label>
              <select
                id="t-role"
                v-model="form.role"
                class="mt-1 block w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-body-base text-on-surface ring-1 ring-inset ring-outline-variant focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <option value="PM">PM</option>
                <option value="MENTOR">MENTOR</option>
                <option value="TEACHER">老师</option>
              </select>
            </div>

            <div>
              <label class="block text-body-sm font-semibold text-on-surface" for="t-phone">
                联系方式
              </label>
              <input
                id="t-phone"
                v-model="form.phone"
                type="tel"
                placeholder="例: +86 138 0000 0000"
                class="mt-1 block w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-body-base text-on-surface ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-body-sm font-semibold text-on-surface" for="t-email">
                电子邮箱
              </label>
              <input
                id="t-email"
                v-model="form.email"
                type="email"
                placeholder="example@school.com"
                class="mt-1 block w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-body-base text-on-surface ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary"
              />
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

const props = defineProps({
  visible: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'submit'])

const form = reactive({ name: '', role: 'PM', phone: '', email: '' })

watch(
  () => props.visible,
  (v) => {
    if (v) {
      form.name = props.initial?.name || ''
      form.role = props.initial?.role || 'PM'
      form.phone = props.initial?.phone || ''
      form.email = props.initial?.email || ''
    }
  },
  { immediate: true },
)

function close() {
  emit('update:visible', false)
}
function submit() {
  if (!form.name.trim()) return
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
