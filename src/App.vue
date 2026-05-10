<template>
  <div class="min-h-screen font-body-base antialiased">
    <router-view v-slot="{ Component, route }">
      <template v-if="route.meta.public">
        <component :is="Component" />
      </template>
      <template v-else>
        <div class="flex min-h-screen bg-background text-on-background">
          <AppSidebar />

          <div class="ml-64 flex min-w-0 flex-1 flex-col">
            <AppTopBar />

            <main class="flex-1 overflow-auto">
              <keep-alive :max="20">
                <component :is="Component" :key="route.fullPath" />
              </keep-alive>
            </main>
          </div>
        </div>
      </template>
    </router-view>

    <!-- Global Loading -->
    <div
      v-if="globalLoading"
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]"
    >
      <div class="h-10 w-10 animate-spin rounded-full border-2 border-secondary border-t-transparent"></div>
      <div class="mt-3 text-body-sm text-on-surface-variant">加载中...</div>
    </div>

    <!-- Global Toast -->
    <transition name="fade">
      <div
        v-if="globalMessage.show"
        class="fixed top-6 left-1/2 z-[101] -translate-x-1/2 rounded-lg px-5 py-3 shadow-modal text-body-sm font-semibold flex items-center gap-2"
        :class="toastClass"
      >
        <span class="material-symbols-outlined icon-fill text-[18px]">{{ toastIcon }}</span>
        <span>{{ globalMessage.text }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopBar from '@/components/AppTopBar.vue'
import { globalLoading, globalMessage } from '@/utils/request'

const toastClass = computed(() => {
  switch (globalMessage.type) {
    case 'success':
      return 'bg-[#137333] text-white'
    case 'error':
      return 'bg-error text-on-error'
    case 'warning':
      return 'bg-[#b06000] text-white'
    default:
      return 'bg-inverse-surface text-inverse-on-surface'
  }
})

const toastIcon = computed(() => {
  switch (globalMessage.type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    default:
      return 'info'
  }
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
