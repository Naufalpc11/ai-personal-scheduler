<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CalendarDays, CheckCircle2, Clock, Hourglass, Lightbulb, ListTodo, Play, Sparkles, TrendingUp } from 'lucide-vue-next'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useAppStore } from '@/composables/useAppStore'
import { useRequireAuth } from '@/composables/useRequireAuth'

useRequireAuth()

const router = useRouter()
const { user, tasks } = useAppStore()

const TODAY = '2026-04-21'

function getNow() {
  const date = new Date('2026-04-21T10:15:00')
  return date
}

function timeToMinutes(hhmm) {
  const [hour, minute] = hhmm.split(':').map(Number)
  return (hour * 60) + minute
}

function formatDateIndo(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function getGreeting(hour) {
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

const now = getNow()
const currentMinutes = now.getHours() * 60 + now.getMinutes()

const todayTasks = computed(() => {
  return tasks.value
    .filter((task) => task.date === TODAY)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const currentTask = computed(() => {
  return todayTasks.value.find((task) => {
    const start = timeToMinutes(task.startTime)
    const end = timeToMinutes(task.endTime)
    return start <= currentMinutes && end >= currentMinutes
  })
})

const nextTask = computed(() => {
  if (!currentTask.value) {
    return todayTasks.value.find((task) => timeToMinutes(task.startTime) > currentMinutes)
  }

  const index = todayTasks.value.indexOf(currentTask.value)
  return todayTasks.value[index + 1] ?? null
})

const completedToday = computed(() => {
  return todayTasks.value.filter((task) => timeToMinutes(task.endTime) < currentMinutes).length
})

const totalTasks = computed(() => tasks.value.length)
const totalDone = computed(() => tasks.value.filter((task) => task.status === 'completed').length)
const completionRate = computed(() => {
  return todayTasks.value.length ? Math.round((completedToday.value / todayTasks.value.length) * 100) : 0
})

const currentColor = computed(() => {
  const task = currentTask.value
  if (!task) return null
  return task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'green'
})

const statsItems = computed(() => ([
  { icon: ListTodo, iconBg: 'bg-blue-100', iconColor: 'text-blue-500', value: totalTasks.value, label: 'Total Task' },
  { icon: CheckCircle2, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', value: totalDone.value, label: 'Selesai' },
  { icon: TrendingUp, iconBg: 'bg-violet-100', iconColor: 'text-violet-500', value: `${completionRate.value}%`, label: 'Hari Ini' }
]))

function formatTaskDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const aiRecommendations = computed(() => {
  return [
    nextTask.value
      ? `Task berikutnya: "${nextTask.value.title}" pukul ${nextTask.value.startTime}. Bersiaplah 5 menit sebelumnya.`
      : 'Tidak ada task lagi hari ini. Gunakan waktu luangmu untuk istirahat! 🎉',
    `Kamu sudah menyelesaikan ${completedToday.value} dari ${todayTasks.value.length} task hari ini. Pertahankan!`
  ]
})
</script>

<template>
  <MainLayout>
    <div class="space-y-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-medium text-slate-400">{{ formatDateIndo(now) }}</p>
          <h1 class="mt-1 text-2xl font-bold text-slate-900">
            {{ getGreeting(now.getHours()) }}, <span class="font-extrabold">{{ user?.name ?? 'Pengguna' }} 👋</span>
          </h1>
        </div>

        <AppButton variant="ai" class-name="rounded-xl px-4 py-2" @click="router.push('/ai-generate')">
          <Sparkles class="h-4 w-4" />
          Tanya AI
        </AppButton>
      </div>

      <section>
        <div class="mb-3 flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-500">
            <Play class="h-3.5 w-3.5" />
          </div>
          <h2 class="text-sm font-semibold text-slate-700">Task Berjalan Sekarang</h2>
        </div>

        <AppCard class-name="border-slate-100">
          <div v-if="currentTask" class="p-5">
            <div class="mb-3 flex items-start justify-between gap-3">
              <div>
                <AppBadge :tone="currentTask.priority">{{ currentTask.category }}</AppBadge>
                <h3 class="mt-2 text-lg font-bold text-slate-900">{{ currentTask.title }}</h3>
                <div class="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                  <Clock class="h-4 w-4" />
                  <span>{{ currentTask.startTime }} – {{ currentTask.endTime }}</span>
                  <span>•</span>
                  <span>{{ currentTask.duration ?? '2 jam' }}</span>
                </div>
              </div>

              <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-600">
                <span class="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle" />
                Live
              </div>
            </div>

            <div v-if="currentTask.subtasks?.length" class="mt-3">
              <div class="mb-1.5 flex justify-between text-xs text-slate-400">
                <span>Sub-task progress</span>
                <span>{{ currentTask.subtasks.filter((subtask) => subtask.completed).length }}/{{ currentTask.subtasks.length }}</span>
              </div>
              <div class="h-2 rounded-full bg-slate-100">
                <div
                  class="h-2 rounded-full bg-blue-500 transition-all"
                  :style="{ width: `${(currentTask.subtasks.filter((subtask) => subtask.completed).length / currentTask.subtasks.length) * 100}%` }"
                />
              </div>
            </div>

            <button class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-500 transition-all hover:gap-2" type="button" @click="router.push(`/task/${currentTask.id}`)">
              Lihat Detail
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>

          <div v-else class="p-6 text-center">
            <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
              <Hourglass class="h-7 w-7" />
            </div>
            <p class="font-semibold text-slate-700">Tidak ada task saat ini</p>
            <p class="mt-1 text-sm text-slate-400">
              {{ nextTask ? `Task berikutnya: "${nextTask.title}" pukul ${nextTask.startTime}` : 'Kamu sudah menyelesaikan semua task hari ini!' }}
            </p>
          </div>
        </AppCard>
      </section>

      <section class="grid gap-3 sm:grid-cols-3">
        <AppCard v-for="(stat, index) in statsItems" :key="index" class-name="text-center">
          <div class="p-4">
            <div class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl" :class="stat.iconBg">
              <component :is="stat.icon" :class="['h-5 w-5', stat.iconColor]" />
            </div>
            <p class="text-2xl font-bold text-slate-900">{{ stat.value }}</p>
            <p class="mt-0.5 text-xs text-slate-400">{{ stat.label }}</p>
          </div>
        </AppCard>
      </section>

      <section>
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500">
              <CalendarDays class="h-3.5 w-3.5" />
            </div>
            <h2 class="text-sm font-semibold text-slate-700">Jadwal Hari Ini</h2>
          </div>

          <button class="text-sm font-medium text-blue-500 transition-colors hover:text-blue-600" type="button" @click="router.push('/schedule')">
            Lihat Semua →
          </button>
        </div>

        <AppCard>
          <div v-if="todayTasks.length" class="divide-y divide-slate-100">
            <button
              v-for="task in todayTasks"
              :key="task.id"
              class="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
              type="button"
              @click="router.push(`/task/${task.id}`)"
            >
              <div class="flex items-start gap-3">
                <div :class="['mt-1.5 h-2.5 w-2.5 rounded-full', task.priority === 'high' ? 'bg-violet-400' : task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400']" />
                <div class="text-right">
                  <p class="text-sm font-semibold text-slate-700">{{ task.startTime }}</p>
                  <p class="text-xs text-slate-300">{{ task.endTime }}</p>
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-slate-900">{{ task.title }}</p>
                <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <AppBadge :tone="task.priority">{{ task.category }}</AppBadge>
                  <span v-if="task.subtasks?.length">{{ task.subtasks.filter((subtask) => subtask.completed).length }}/{{ task.subtasks.length }} sub-task</span>
                </div>
              </div>

              <AppBadge :tone="task.status === 'completed' ? 'completed' : 'pending'">
                <span v-if="task.status === 'completed'">✓</span>
                <span v-else>Live</span>
              </AppBadge>
            </button>
          </div>

          <div v-else class="p-6 text-center text-sm text-slate-500">
            Belum ada agenda untuk hari ini.
          </div>
        </AppCard>
      </section>

      <section class="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
        <p class="font-medium text-slate-700">Rekomendasi AI</p>
        <div class="mt-2 space-y-1.5 text-sm text-slate-500">
          <p v-for="(item, index) in aiRecommendations" :key="index" class="flex items-start gap-2">
            <Lightbulb class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>{{ item }}</span>
          </p>
        </div>
      </section>
    </div>
  </MainLayout>
</template>