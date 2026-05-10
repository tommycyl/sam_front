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
import { getCachedProfile, setCachedProfile } from '@/utils/auth'

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
  const cached = getCachedProfile()
  if (cached?.username) {
    displayName.value = cached.username
    return
  }
  try {
    const data = await getProfile({ silent: true, loading: false })
    displayName.value = data?.username || ''
    if (data) setCachedProfile(data)
  } catch {
    displayName.value = ''
  }
})
</script>
