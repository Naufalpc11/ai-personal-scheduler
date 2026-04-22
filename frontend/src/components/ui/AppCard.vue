<script setup>
defineProps({
  className: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div :class="`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`">
    <slot />
  </div>
</template>
