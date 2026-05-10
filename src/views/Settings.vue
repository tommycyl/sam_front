<template>
  <div class="bg-background p-container-padding">
    <div class="mb-6">
      <h2 class="text-display-lg font-display-lg text-on-background mb-1">系统设置</h2>
      <p class="text-body-sm text-on-surface-variant">账号信息与密码修改。</p>
    </div>

    <section class="max-w-2xl rounded-xl border border-surface-variant bg-surface-container-lowest p-6 shadow-sm">
      <div class="mb-6 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed/40 text-primary">
          <span class="material-symbols-outlined">person</span>
        </div>
        <h3 class="text-headline-md font-headline-md text-primary">账号信息</h3>
      </div>

      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p class="mb-1 text-label-caps font-label-caps text-on-surface-variant">账号用户名</p>
          <div class="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-base text-on-surface">
            {{ account.username }}
          </div>
        </div>
        <div>
          <p class="mb-1 text-label-caps font-label-caps text-on-surface-variant">当前密码</p>
          <div class="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 text-body-base text-on-surface">
            ********
          </div>
        </div>
      </div>

      <div class="mb-3 text-body-sm font-semibold text-on-surface">修改密码</div>
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="mb-1 block text-label-caps font-label-caps text-on-surface-variant">原密码</label>
          <input
            v-model="form.oldPassword"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="请输入原密码"
          />
        </div>
        <div>
          <label class="mb-1 block text-label-caps font-label-caps text-on-surface-variant">新密码</label>
          <input
            v-model="form.newPassword"
            type="password"
            autocomplete="new-password"
            class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="请输入新密码"
          />
        </div>
        <div>
          <label class="mb-1 block text-label-caps font-label-caps text-on-surface-variant">确认新密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-base text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="请再次输入新密码"
          />
        </div>

        <div class="pt-2">
          <button
            type="submit"
            class="rounded-lg bg-primary px-5 py-2 text-body-sm font-semibold text-on-primary transition-colors hover:bg-primary-container"
          >
            保存新密码
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showMessage } from '@/utils/request'
import { changePassword, getProfile } from '@/api/common'
import { clearAuth, getCachedProfile, setCachedProfile } from '@/utils/auth'

const router = useRouter()

const account = reactive({
  username: '',
})

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const submitting = ref(false)

onMounted(async () => {
  const cached = getCachedProfile()
  if (cached?.username) {
    account.username = cached.username
    return
  }
  try {
    const data = await getProfile({ silent: true, loading: false })
    account.username = data?.username || ''
    if (data) setCachedProfile(data)
  } catch {
    account.username = ''
  }
})

async function onSubmit() {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    showMessage('请完整填写密码信息', 'warning')
    return
  }
  if (form.newPassword.length < 6) {
    showMessage('新密码至少 6 位', 'warning')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    showMessage('两次输入的新密码不一致', 'error')
    return
  }
  submitting.value = true
  try {
    await changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    })
    showMessage('密码修改成功，请重新登录', 'success')
    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    setTimeout(() => {
      clearAuth()
      router.replace('/login')
    }, 600)
  } catch {
    /* request 拦截器已弹错误 */
  } finally {
    submitting.value = false
  }
}
</script>
