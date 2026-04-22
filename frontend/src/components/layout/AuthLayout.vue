<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 p-5">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">
          <slot name="logo" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">AI Scheduler</h1>
        <p class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
      </div>

      <div class="rounded-3xl border border-gray-100 bg-white p-7 shadow-xl shadow-gray-100/80">
        <h2 class="mb-1 font-bold text-gray-900">{{ title }}</h2>
        <slot />
      </div>

      <p class="mt-6 text-center text-xs text-gray-300">© 2026 AI Scheduler. All rights reserved.</p>
    </div>
  </div>
</template>
