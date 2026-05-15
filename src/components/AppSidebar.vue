<template>
  <nav
    class="fixed left-0 top-0 z-50 h-full w-64 flex flex-col bg-primary text-on-primary"
  >
    <!-- Brand area with red ribbon decoration -->
    <div class="relative overflow-hidden">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-[7.25rem]" aria-hidden="true">
        <div
          class="absolute -right-4 -top-10 h-[12rem] w-[11rem] rotate-[24deg] rounded-[2.5rem] bg-gradient-to-bl from-red-500 via-red-600 to-red-900/40 opacity-[0.92]"
        ></div>
        <div
          class="absolute -left-14 top-2 h-[10rem] w-[9rem] -rotate-[16deg] rounded-[2rem] bg-gradient-to-tr from-red-700/95 via-red-500/55 to-transparent"
        ></div>
        <div
          class="absolute left-[18%] -top-6 h-[6rem] w-[7rem] rotate-[8deg] rounded-full bg-red-500/25 blur-md"
        ></div>
        <div
          class="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-primary via-primary/85 to-transparent"
        ></div>
      </div>
      <div class="relative z-10 px-6 pt-7 pb-8">
        <h1 class="text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
          Sam's Advisory
        </h1>
        <p class="mt-1 text-[11px] tracking-[0.18em] text-white/80 uppercase">
          Management Portal
        </p>
      </div>
    </div>

    <!-- Main Nav -->
    <ul class="flex-1 px-3 space-y-1">
      <li v-for="item in items" :key="item.to">
        <router-link
          :to="item.to"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-body-base transition-colors duration-150"
          :class="
            isActive(item)
              ? 'bg-secondary text-white font-semibold shadow-sm'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          "
        >
          <span
            class="material-symbols-outlined"
            :class="{ 'icon-fill': isActive(item) }"
          >{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>

    <!-- Bottom -->
    <div class="px-4 pb-6 pt-4">
      <div class="border-t border-white/10 pt-4">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-body-sm text-white/70 transition-colors hover:text-white"
          @click="openLogoutConfirm"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          <span>退出登录</span>
        </button>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <Transition name="fade-logout-confirm">
      <div
        v-if="logoutConfirmOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
      >
        <div
          class="absolute inset-0 bg-inverse-surface/40 backdrop-blur-[2px]"
          @click="closeLogoutConfirm"
        ></div>
        <div
          class="relative w-full max-w-sm overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-modal"
          @click.stop
        >
          <div class="border-b border-surface-variant px-6 pb-4 pt-6">
            <h3 id="logout-confirm-title" class="text-headline-md font-headline-md text-primary">
              退出登录
            </h3>
            <p class="mt-2 text-body-sm text-on-surface-variant">
              确定要退出当前账号吗？退出后需要重新登录才能访问管理后台。
            </p>
          </div>
          <div class="flex flex-row-reverse gap-3 border-t border-surface-variant bg-surface-container-low px-6 py-4">
            <button
              type="button"
              class="rounded-lg bg-primary px-5 py-2 text-body-sm font-semibold text-on-primary shadow-sm transition-opacity hover:opacity-90"
              @click="confirmLogout"
            >
              确认退出
            </button>
            <button
              type="button"
              class="rounded-lg border border-outline-variant bg-surface-container-lowest px-5 py-2 text-body-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
              @click="closeLogoutConfirm"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearAuth } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const items = [
  { to: '/dashboard', label: '首页', icon: 'dashboard', match: '/dashboard' },
  { to: '/students', label: '学生管理', icon: 'group', match: '/students' },
  { to: '/teachers', label: '教师管理', icon: 'school', match: '/teachers' },
  { to: '/settings', label: '系统设置', icon: 'settings', match: '/settings' },
]

function isActive(item) {
  return route.path === item.match || route.path.startsWith(item.match + '/')
}

const logoutConfirmOpen = ref(false)

function openLogoutConfirm() {
  logoutConfirmOpen.value = true
}

function closeLogoutConfirm() {
  logoutConfirmOpen.value = false
}

function confirmLogout() {
  clearAuth()
  logoutConfirmOpen.value = false
  router.replace('/login')
}
</script>

<style scoped>
.fade-logout-confirm-enter-active,
.fade-logout-confirm-leave-active {
  transition: opacity 0.2s ease;
}
.fade-logout-confirm-enter-active .relative,
.fade-logout-confirm-leave-active .relative {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-logout-confirm-enter-from,
.fade-logout-confirm-leave-to {
  opacity: 0;
}
.fade-logout-confirm-enter-from .relative,
.fade-logout-confirm-leave-to .relative {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}
</style>
