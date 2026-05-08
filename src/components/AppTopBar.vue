<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-surface-variant bg-surface-container-lowest px-container-padding"
  >
    <!-- Left: Search -->
    <div class="flex flex-1 items-center">
      <div class="relative w-96 max-w-full">
        <span
          class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
        >search</span>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索..."
          class="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-sm text-on-surface placeholder:text-outline focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
        />
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-stack-gap">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        aria-label="通知"
      >
        <span class="material-symbols-outlined">notifications</span>
      </button>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
        aria-label="应用"
      >
        <span class="material-symbols-outlined">apps</span>
      </button>
      <div
        class="h-9 w-9 overflow-hidden rounded-full border border-outline-variant bg-surface-container"
      >
        <img
          alt="Administrator"
          class="h-full w-full object-cover"
          src="https://i.pravatar.cc/80?img=12"
        />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const keyword = ref('')
</script>
