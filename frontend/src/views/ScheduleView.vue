<script setup>
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-vue-next'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { useAppStore } from '@/composables/useAppStore'
import { useRequireAuth } from '@/composables/useRequireAuth'
import { MONTH_NAMES, dateToStr, timeToMinutes } from '@/utils/task-helpers'

useRequireAuth()

const { tasks } = useAppStore()

const TODAY = '2026-04-21'
const cursor = ref(new Date('2026-04-21T00:00:00'))
const selectedDate = ref(TODAY)
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const monthLabel = computed(() => `${MONTH_NAMES[cursor.value.getMonth()]} ${cursor.value.getFullYear()}`)

const cells = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const offset = firstDay
  const items = []

  for (let i = 0; i < offset; i += 1) {
    items.push({ key: `empty-${i}`, empty: true })
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day)
    const key = dateToStr(date)
    const count = tasks.value.filter((task) => task.date === key).length

    items.push({
      key,
      empty: false,
      day,
      keyDate: key,
      count,
      isToday: key === TODAY,
      isSelected: key === selectedDate.value
    })
  }

  return items
})

const selectedTasks = computed(() => {
  return tasks.value
    .filter((task) => task.date === selectedDate.value)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
})

function prevMonth() {
  const next = new Date(cursor.value)
  next.setMonth(next.getMonth() - 1)
  cursor.value = next
}

function nextMonth() {
  const next = new Date(cursor.value)
  next.setMonth(next.getMonth() + 1)
  cursor.value = next
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <MainLayout>
    <div class="space-y-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Jadwal</h1>
          <p class="mt-1 text-sm text-slate-400">Kalender kegiatan</p>
        </div>

        <button class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-600" type="button" @click="selectedDate = TODAY">
          Hari Ini
        </button>
      </div>

      <AppCard class-name="p-4">
        <div class="mb-4 flex items-center justify-between">
          <button class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50" type="button" @click="prevMonth">
            <ChevronLeft class="h-5 w-5" />
          </button>

          <h2 class="text-lg font-semibold text-slate-900">{{ monthLabel }}</h2>

          <button class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50" type="button" @click="nextMonth">
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>

        <div class="mb-4 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
          <span v-for="day in DAY_NAMES" :key="day">{{ day }}</span>
        </div>

        <div class="grid grid-cols-7 gap-y-2">
          <div v-for="cell in cells" :key="cell.key">
            <button
              v-if="!cell.empty"
              class="mx-auto flex aspect-square w-[72%] flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all"
              :class="cell.isSelected ? 'bg-emerald-500 text-white shadow-sm' : cell.isToday ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'"
              type="button"
              @click="selectedDate = cell.keyDate"
            >
              <span>{{ cell.day }}</span>
              <span v-if="cell.count" class="mt-1 h-1 w-1 rounded-full" :class="cell.isSelected ? 'bg-white' : 'bg-slate-400'" />
            </button>
          </div>
        </div>
      </AppCard>

      <section>
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-700">{{ formatDate(selectedDate) }}</p>
          <span class="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">{{ selectedTasks.length }} task</span>
        </div>

        <div v-if="selectedTasks.length" class="space-y-3">
          <AppCard v-for="task in selectedTasks" :key="task.id" class-name="p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <AppBadge :tone="task.priority">{{ task.category }}</AppBadge>
                <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ task.title }}</h3>
                <div class="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                  <Clock3 class="h-4 w-4" />
                  <span>{{ task.startTime }} – {{ task.endTime }} · {{ task.duration ?? '1 jam' }}</span>
                </div>
                <p v-if="task.subtasks?.length" class="mt-1 text-xs text-slate-400">
                  {{ task.subtasks.filter((subtask) => subtask.completed).length }}/{{ task.subtasks.length }} sub-task selesai
                </p>
              </div>

              <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="task.priority === 'high' ? 'bg-amber-100 text-amber-500' : task.priority === 'medium' ? 'bg-blue-100 text-blue-500' : 'bg-emerald-100 text-emerald-500'">
                <Clock3 class="h-5 w-5" />
              </div>
            </div>

            <div v-if="task.subtasks?.length" class="mt-3">
              <div class="h-1.5 rounded-full bg-slate-100">
                <div
                  class="h-1.5 rounded-full bg-blue-500"
                  :style="{ width: `${(task.subtasks.filter((subtask) => subtask.completed).length / task.subtasks.length) * 100}%` }"
                />
              </div>
            </div>
          </AppCard>
        </div>

        <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Tidak ada task di tanggal ini.
        </div>
      </section>
    </div>
  </MainLayout>
</template>