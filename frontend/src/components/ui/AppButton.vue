<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  disabled: { type: Boolean, default: false },
  className: { type: String, default: '' }
})

const styleClass = computed(() => {
  if (props.variant === 'ai') {
    return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-md'
  }

  if (props.variant === 'ghost') {
    return 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
  }

  if (props.variant === 'danger') {
    return 'bg-red-500 text-white hover:bg-red-600'
  }

  return 'bg-blue-500 text-white hover:bg-blue-600'
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${styleClass} ${className}`"
  >
    <slot />
  </button>
</template>
