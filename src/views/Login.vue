<template>
  <div
    class="login-root fixed inset-0 z-[1] flex flex-col overflow-hidden"
    :style="rootStyle"
  >
    <div
      class="pointer-events-none absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute right-1/4 top-10 h-40 w-40 rounded-full bg-brand-burgundy/20 blur-3xl"
      aria-hidden="true"
    />

    <!-- 主内容区：占满剩余高度并垂直居中，底部无额外留白 -->
    <div
      class="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-4 pt-10 sm:pt-12"
    >
      <div class="w-full max-w-[420px]">
      <div class="mb-10 flex flex-col items-center text-center">
        <img
          v-if="logoOk"
          src="/favicon.png"
          alt="Sam's Advisory"
          class="mx-auto h-24 w-24 rounded-xl object-cover shadow-lg ring-1 ring-white/10"
          width="96"
          height="96"
          @error="logoOk = false"
        />
        <div v-else class="mx-auto max-w-xs text-center">
          <p
            class="font-login-display text-[1.65rem] leading-snug tracking-tight text-white sm:text-[1.85rem]"
          >
            Sam's Advisory
          </p>
          <p class="mt-2 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55">
            Management Portal
          </p>
        </div>
      </div>

      <div
        class="rounded-2xl border border-white/10 bg-white/[0.97] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10"
      >
        <div class="text-center">
          <h1 class="font-login-display text-2xl text-[#002060]">登录</h1>
          <p class="mt-1 text-body-sm text-on-surface-variant">请使用用户名与密码进入系统</p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="onSubmit">
          <div>
            <label for="login-username" class="text-label-caps font-label-caps text-[#002060]/80">
              用户名
            </label>
            <input
              id="login-username"
              v-model.trim="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              class="login-input mt-2"
              placeholder="请输入用户名"
            />
          </div>
          <div>
            <label for="login-password" class="text-label-caps font-label-caps text-[#002060]/80">
              密码
            </label>
            <input
              id="login-password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="login-input mt-2"
              placeholder="请输入密码"
            />
          </div>

          <p v-if="errorMsg" class="text-body-sm text-error" role="alert">{{ errorMsg }}</p>

          <button
            type="submit"
            class="login-submit"
            :disabled="submitting"
          >
            <span v-if="submitting" class="inline-flex items-center gap-2">
              <span
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
                aria-hidden="true"
              />
              登录中…
            </span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>
      </div>
    </div>

    <!-- 红色飘带：贴齐屏幕底边，全宽自左向右贯穿 -->
    <div
      class="relative z-[1] mt-auto w-full shrink-0 leading-[0]"
      aria-hidden="true"
    >
      <svg
        class="block h-[min(24vh,200px)] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#6d102c"
          d="M0 220V165C220 72 460 188 720 108S1180 48 1440 92v128H0z"
        />
      </svg>
      <svg
        class="pointer-events-none absolute inset-0 block h-[min(24vh,200px)] w-full"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#8b1538"
          fill-opacity="0.95"
          d="M0 220V182C260 88 500 172 720 118c220-54 460-62 720 26v76H0z"
        />
        <path
          fill="#ffffff"
          fill-opacity="0.07"
          d="M0 208C280 168 520 200 720 172c200-28 460-40 720 24v24H0z"
        />
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { setCachedProfile, setToken } from '@/utils/auth'
import { getProfile, login as loginApi } from '@/api/common'

const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)
const logoOk = ref(true)

const rootStyle = {
  background: 'linear-gradient(165deg, #001845 0%, #002060 42%, #001a4d 100%)',
}

async function onSubmit() {
  errorMsg.value = ''
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  submitting.value = true
  try {
    const data = await loginApi(
      { username: username.value, password: password.value },
      { silent: true, loading: false },
    )
    if (!data?.token) {
      throw new Error('未获取到登录凭证')
    }
    setToken(data.token)
    try {
      const profile = await getProfile({ silent: true, loading: false })
      setCachedProfile(profile)
    } catch {
      setCachedProfile(null)
    }
    const raw = route.query.redirect
    const nextPath =
      typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/students'
    await router.replace(nextPath)
  } catch (e) {
    errorMsg.value = e?.message || '登录失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-input {
  display: block;
  width: 100%;
  height: 2.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 32, 96, 0.22);
  background: #fff;
  padding: 0 0.875rem;
  font-size: 14px;
  line-height: 20px;
  color: #191c1e;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.login-input::placeholder {
  color: #8b8d91;
}
.login-input:hover {
  border-color: rgba(0, 32, 96, 0.38);
}
.login-input:focus {
  border-color: #002060;
  box-shadow: 0 0 0 3px rgba(0, 32, 96, 0.12);
}

.login-submit {
  display: flex;
  width: 100%;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: #8b1538;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}
.login-submit:hover:not(:disabled) {
  background: #6d102c;
}
.login-submit:active:not(:disabled) {
  transform: scale(0.99);
}
.login-submit:disabled {
  cursor: not-allowed;
  opacity: 0.85;
}
</style>
