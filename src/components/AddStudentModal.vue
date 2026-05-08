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
                <label class="text-label-caps font-label-caps text-on-surface-variant">
                  学生姓名 *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="姓名"
                  class="h-12 w-full rounded-lg border-2 border-secondary bg-surface-container-lowest px-4 text-body-base text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-label-caps font-label-caps text-on-surface-variant">
                  申请起始日期
                </label>
                <input
                  v-model="form.startDate"
                  type="text"
                  placeholder="YYYY/MM/DD"
                  class="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-base text-on-surface placeholder:text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-label-caps font-label-caps text-on-surface-variant">
                  负责角色
                </label>
                <select
                  v-model="form.role"
                  class="h-12 w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest bg-no-repeat px-4 text-body-base text-on-surface focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  :style="selectArrow"
                >
                  <option value="PM">PM</option>
                  <option value="MENTOR">MENTOR</option>
                </select>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-label-caps font-label-caps text-on-surface-variant">
                  MENTOR
                </label>
                <input
                  v-model="form.mentor"
                  type="text"
                  placeholder="Mentor"
                  class="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-base text-on-surface placeholder:text-outline-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-label-caps font-label-caps text-on-surface-variant">PM</label>
                <input
                  v-model="form.owner"
                  type="text"
                  placeholder="PM"
                  class="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-body-base text-on-surface placeholder:text-outline-variant focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
              </div>
            </div>

            <div class="mt-8 flex items-center gap-3">
              <input
                id="bs-meeting"
                v-model="form.bsMeeting"
                type="checkbox"
                class="h-5 w-5 rounded border border-outline-variant bg-surface-variant text-secondary focus:ring-secondary"
              />
              <label for="bs-meeting" class="text-body-base text-on-surface">BS 会议已完成</label>
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
import { reactive, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initial: { type: Object, default: null },
})
const emit = defineEmits(['update:visible', 'submit'])

const today = new Date()
const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`

const form = reactive({
  name: '',
  startDate: todayStr,
  role: 'PM',
  mentor: '',
  owner: '',
  bsMeeting: false,
})

const selectArrow = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2347464f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1em',
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      form.name = props.initial?.name || ''
      form.startDate = props.initial?.startDate || todayStr
      form.role = props.initial?.role || 'PM'
      form.mentor = props.initial?.mentor || ''
      form.owner = props.initial?.owner || ''
      form.bsMeeting = props.initial?.bsMeeting || false
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
