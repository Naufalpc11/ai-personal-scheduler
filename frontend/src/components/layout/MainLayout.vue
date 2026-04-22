<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Bell, Calendar, ChevronRight, LayoutDashboard, ListTodo, LogOut, Sparkles } from 'lucide-vue-next'
import { useAppStore } from '@/composables/useAppStore'

const route = useRoute()
const router = useRouter()
const { user, logout } = useAppStore()

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Beranda', color: 'text-blue-500', activeBg: 'bg-blue-50', activeDot: 'bg-blue-500' },
  { path: '/task-manager', icon: ListTodo, label: 'Task', color: 'text-violet-500', activeBg: 'bg-violet-50', activeDot: 'bg-violet-500' },
  { path: '/schedule', icon: Calendar, label: 'Jadwal', color: 'text-emerald-500', activeBg: 'bg-emerald-50', activeDot: 'bg-emerald-500' },
  { path: '/ai-generate', icon: Sparkles, label: 'AI', color: 'text-amber-500', activeBg: 'bg-amber-50', activeDot: 'bg-amber-500' }
]

const pageLabels = {
  '/': 'Beranda',
  '/task-manager': 'Task Manager',
  '/schedule': 'Jadwal',
  '/ai-generate': 'AI Scheduler'
}

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function toPage(path) {
  router.push(path)
}

function handleLogout() {
  logout()
  router.push('/login')
}

const currentPageLabel = computed(() => {
  if (route.path.startsWith('/task/')) return 'Detail Task'
  return pageLabels[route.path] ?? 'AI Scheduler'
})

const currentUser = computed(() => user.value ?? { name: 'Guest', email: '-' })
</script>

<template>
  <div class="min-h-screen bg-gray-50 lg:flex">
    <aside class="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-100 bg-white shadow-sm lg:flex">
      <div class="border-b border-gray-100 p-5">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
            <Sparkles class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="font-bold leading-tight text-gray-900">AI Scheduler</p>
            <p class="text-xs text-gray-400">Personal AI Planner</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 space-y-1 p-4">
        <p class="mb-3 mt-1 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Menu Utama</p>
        <button
          v-for="item in menuItems"
          :key="item.path"
          type="button"
          :class="`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${isActive(item.path) ? `${item.activeBg} ${item.color}` : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`"
          @click="toPage(item.path)"
        >
          <component :is="item.icon" :class="`h-5 w-5 shrink-0 ${isActive(item.path) ? item.color : 'text-gray-400 group-hover:text-gray-600'}`" />
          <span :class="`text-sm ${isActive(item.path) ? 'font-semibold' : 'font-medium'}`">{{ item.label }}</span>
          <span v-if="isActive(item.path)" :class="`ml-auto h-1.5 w-1.5 rounded-full ${item.activeDot}`" />
        </button>
      </nav>

      <div class="border-t border-gray-100 p-4">
        <div class="flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white">
            {{ currentUser.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-gray-900">{{ currentUser.name }}</p>
            <p class="truncate text-xs text-gray-400">{{ currentUser.email }}</p>
          </div>
          <button class="shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" type="button" @click="handleLogout">
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>

    <div class="flex min-h-screen flex-1 flex-col lg:ml-64">
      <header class="sticky top-0 z-30 hidden items-center justify-between border-b border-gray-100 bg-white/95 px-8 py-4 shadow-sm backdrop-blur-sm lg:flex">
        <nav class="flex items-center gap-2 text-sm">
          <span class="font-medium text-gray-400">AI Scheduler</span>
          <ChevronRight class="h-4 w-4 text-gray-300" />
          <span class="font-semibold text-gray-900">{{ currentPageLabel }}</span>
        </nav>
        <div class="flex items-center gap-3">
          <button class="relative rounded-xl p-2 transition-colors hover:bg-gray-100" type="button">
            <Bell class="h-5 w-5 text-gray-500" />
            <span class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>
          <div class="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white">
              {{ currentUser.name.charAt(0).toUpperCase() }}
            </div>
            <span class="text-sm font-medium text-gray-700">{{ currentUser.name }}</span>
          </div>
        </div>
      </header>

      <header class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 shadow-sm lg:hidden">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm">
            <Sparkles class="h-4 w-4 text-white" />
          </div>
          <span class="font-bold text-gray-900">AI Scheduler</span>
        </div>
        <button type="button" class="rounded-xl p-2 transition-colors hover:bg-gray-100" @click="handleLogout">
          <LogOut class="h-5 w-5 text-gray-500" />
        </button>
      </header>

      <main class="flex-1 overflow-auto pb-24 lg:pb-6">
        <div class="mx-auto max-w-4xl px-4 py-5 lg:px-6">
          <slot />
        </div>
      </main>
    </div>

    <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white shadow-lg lg:hidden">
      <div class="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        <button
          v-for="item in menuItems"
          :key="item.path"
          type="button"
          class="group relative flex flex-1 flex-col items-center justify-center gap-1 py-2"
          @click="toPage(item.path)"
        >
          <span v-if="isActive(item.path)" :class="`absolute top-0.5 h-1 w-1 rounded-full ${item.activeDot}`" />
          <div :class="`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isActive(item.path) ? item.activeBg : 'group-hover:bg-gray-50'}`">
            <component :is="item.icon" :class="`h-5 w-5 transition-colors ${isActive(item.path) ? item.color : 'text-gray-400 group-hover:text-gray-600'}`" />
          </div>
          <span :class="`text-xs transition-colors ${isActive(item.path) ? `${item.color} font-semibold` : 'text-gray-400'}`">{{ item.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
