<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center justify-end border-b border-surface-variant bg-surface-container-lowest px-container-padding"
  >
    <div
      class="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-variant bg-surface-container text-body-sm font-bold text-primary"
      :title="displayName || '用户'"
    >
      <span>{{ userInitials }}</span>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getProfile } from '@/api/common'

const displayName = ref('')

function initials(name) {
  return String(name || '')
    .replace(/(Dr\.|Prof\.)/g, '')
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const userInitials = computed(() => {
  const v = initials(displayName.value)
  return v || '?'
})

onMounted(async () => {
  try {
    const data = await getProfile({ silent: true, loading: false })
    displayName.value = data?.username || ''
  } catch {
    displayName.value = ''
  }
})
</script>
