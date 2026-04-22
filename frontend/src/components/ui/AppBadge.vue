<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: {
    type: String,
    default: 'blue'
  }
})

const toneClass = computed(() => {
  if (props.tone === 'low') return 'bg-emerald-100 text-emerald-700'
  if (props.tone === 'medium') return 'bg-amber-100 text-amber-700'
  if (props.tone === 'high') return 'bg-rose-100 text-rose-700'
  if (props.tone === 'pending') return 'bg-slate-100 text-slate-700'
  if (props.tone === 'in_progress') return 'bg-amber-100 text-amber-700'
  if (props.tone === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (props.tone === 'green') return 'bg-emerald-100 text-emerald-700'
  if (props.tone === 'purple') return 'bg-violet-100 text-violet-700'
  if (props.tone === 'amber') return 'bg-amber-100 text-amber-700'
  if (props.tone === 'red') return 'bg-red-100 text-red-700'
  return 'bg-blue-100 text-blue-700'
})
</script>

<template>
  <span :class="`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`">
    <slot />
  </span>
</template>
