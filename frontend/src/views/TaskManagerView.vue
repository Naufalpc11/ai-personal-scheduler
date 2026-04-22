<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CalendarDays, ChevronLeft, ChevronRight, ChevronRight as ArrowRight, Clock3, ListFilter, Plus, Search, Sparkles, Trash2 } from 'lucide-vue-next'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import { colorMap, useAppStore } from '@/composables/useAppStore'
import { useRequireAuth } from '@/composables/useRequireAuth'

useRequireAuth()

const router = useRouter()
const { tasks, addTask, deleteTask } = useAppStore()

const TODAY = '2026-04-21'
const TODAY_DATE = new Date('2026-04-21T00:00:00')
const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const COLORS = ['blue', 'purple', 'amber', 'green', 'red', 'pink']

const viewMode = ref('day')
const selectedDate = ref(TODAY_DATE)
const searchQuery = ref('')
const showForm = ref(false)

const form = reactive({
  title: '',
  date: TODAY,
  startTime: '',
  endTime: '',
  category: 'Kelas',
  color: 'blue',
  description: ''
})

function dateToStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date, offset) {
  const next = new Date(date)
  next.setDate(next.getDate() + offset)
  return next
}

function formatDayLabel(date) {
  const isToday = dateToStr(date) === TODAY
  const dayName = date.toLocaleDateString('id-ID', { weekday: 'long' })
  const monthName = date.toLocaleDateString('id-ID', { month: 'long' })
  const dayNum = date.getDate()
  return isToday ? `Hari Ini, ${dayNum} ${monthName}` : `${dayName}, ${dayNum} ${monthName}`
}

function buildDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMinutes = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMinutes <= 0) return '0 menit'
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (hours && mins) return `${hours} jam ${mins} menit`
  if (hours) return `${hours} jam`
  return `${mins} menit`
}

const selectedDateStr = computed(() => dateToStr(selectedDate.value))

const filteredTasks = computed(() => {
  const keyword = searchQuery.value.toLowerCase().trim()
  return tasks.value
    .filter((task) => {
      const matchSearch = !keyword || task.title.toLowerCase().includes(keyword) || (task.description || '').toLowerCase().includes(keyword)
      if (viewMode.value === 'day') return matchSearch && task.date === selectedDateStr.value
      return matchSearch
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
})

const dayStrip = computed(() => {
  return [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const date = addDays(TODAY_DATE, offset)
    const dateKey = dateToStr(date)
    return {
      date,
      dateKey,
      dayName: DAY_NAMES_SHORT[date.getDay()],
      dayNum: date.getDate(),
      isSelected: dateKey === selectedDateStr.value,
      isToday: dateKey === TODAY,
      hasTask: tasks.value.some((task) => task.date === dateKey)
    }
  })
})

function resetForm() {
  form.title = ''
  form.date = TODAY
  form.startTime = ''
  form.endTime = ''
  form.category = 'Kelas'
  form.color = 'blue'
  form.description = ''
}

function submitTask() {
  if (!form.title.trim() || !form.date || !form.startTime || !form.endTime) return

  addTask({
    title: form.title,
    description: form.description,
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    duration: buildDuration(form.startTime, form.endTime),
    category: form.category,
    color: form.color,
    priority: 'medium',
    status: 'pending',
    subtasks: []
  })

  resetForm()
  showForm.value = false
}

function countSubtask(task) {
  const total = task.subtasks?.length || 0
  const completed = task.subtasks?.filter((item) => item.completed).length || 0
  return { total, completed }
}
</script>

<template>
  <MainLayout>
    <div class="space-y-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Task Manager</h1>
          <p class="mt-1 text-sm text-slate-400">{{ tasks.length }} total task</p>
        </div>

        <AppButton variant="ai" class-name="rounded-xl px-4 py-2" @click="router.push('/ai-generate')">
          <Sparkles class="h-4 w-4" />
          AI
        </AppButton>
      </div>

      <div class="relative">
        <Search class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          class="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-400"
          placeholder="Cari task..."
          type="text"
        >
      </div>

      <AppCard class-name="overflow-hidden">
        <div class="flex border-b border-slate-100">
          <button
            class="flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors"
            :class="viewMode === 'day' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-transparent text-slate-500 hover:bg-slate-50'"
            type="button"
            @click="viewMode = 'day'"
          >
            <CalendarDays class="mr-1.5 inline h-4 w-4" />
            Per Hari
          </button>
          <button
            class="flex-1 border-b-2 py-2.5 text-sm font-medium transition-colors"
            :class="viewMode === 'all' ? 'border-violet-500 bg-violet-50 text-violet-600' : 'border-transparent text-slate-500 hover:bg-slate-50'"
            type="button"
            @click="viewMode = 'all'"
          >
            <ListFilter class="mr-1.5 inline h-4 w-4" />
            Semua Task
          </button>
        </div>

        <div v-if="viewMode === 'day'" class="px-3 py-3">
          <div class="flex items-center justify-between">
            <button class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100" type="button" @click="selectedDate = addDays(selectedDate, -1)">
              <ChevronLeft class="h-5 w-5" />
            </button>

            <button class="text-center" type="button" @click="selectedDate = TODAY_DATE">
              <p class="text-sm font-semibold text-blue-600">{{ formatDayLabel(selectedDate) }}</p>
              <p class="text-xs text-blue-400">{{ dateToStr(selectedDate) === TODAY ? 'Hari ini' : 'Ketuk untuk ke hari ini' }}</p>
            </button>

            <button class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100" type="button" @click="selectedDate = addDays(selectedDate, 1)">
              <ChevronRight class="h-5 w-5" />
            </button>
          </div>

          <div class="mt-3 flex gap-1 overflow-x-auto pb-1">
            <button
              v-for="day in dayStrip"
              :key="day.dateKey"
              class="flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all"
              :class="day.isSelected ? 'bg-blue-500 text-white' : day.isToday ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'"
              type="button"
              @click="selectedDate = day.date"
            >
              <span>{{ day.dayName }}</span>
              <span class="text-sm font-bold">{{ day.dayNum }}</span>
              <span v-if="day.hasTask" class="h-1 w-1 rounded-full" :class="day.isSelected ? 'bg-white' : day.isToday ? 'bg-blue-400' : 'bg-slate-400'" />
            </button>
          </div>
        </div>
      </AppCard>

      <button
        class="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-medium transition-colors"
        :class="showForm ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500'"
        type="button"
        @click="showForm = !showForm"
      >
        <Plus class="h-4 w-4" />
        {{ showForm ? 'Tutup Form' : 'Tambah Task Baru' }}
      </button>

      <AppCard v-if="showForm">
        <div class="p-5">
          <h2 class="mb-4 text-base font-semibold text-slate-900">Buat Task Baru</h2>
          <form class="space-y-4" @submit.prevent="submitTask">
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-600">Nama Task</label>
              <input v-model="form.title" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Masukkan judul task..." type="text">
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-600">Tanggal</label>
              <input v-model="form.date" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" type="date">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-600">Mulai</label>
                <input v-model="form.startTime" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" type="time">
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-600">Selesai</label>
                <input v-model="form.endTime" class="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" type="time">
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-600">Kategori</label>
              <select v-model="form.category" class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                <option>Kelas</option>
                <option>Review</option>
                <option>Meeting</option>
                <option>Personal</option>
                <option>Belajar</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-600">Warna</label>
              <div class="flex gap-2">
                <button
                  v-for="color in COLORS"
                  :key="color"
                  class="h-8 w-8 rounded-full transition-all"
                  :class="[colorMap[color].dot, form.color === color ? 'scale-110 ring-2 ring-slate-400 ring-offset-2' : '']"
                  type="button"
                  @click="form.color = color"
                />
              </div>
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-600">Catatan (opsional)</label>
              <textarea v-model="form.description" class="min-h-20 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400" placeholder="Tambah catatan..." />
            </div>

            <AppButton class-name="w-full" type="submit">Buat Task</AppButton>
          </form>
        </div>
      </AppCard>

      <div class="text-sm text-slate-500">
        <span class="font-semibold text-slate-700">{{ filteredTasks.length }}</span>
        task pada
        <span v-if="viewMode === 'day'">hari ini, {{ new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) }}</span>
        <span v-else>semua data</span>
      </div>

      <div v-if="filteredTasks.length" class="space-y-3">
        <article v-for="task in filteredTasks" :key="task.id" class="rounded-2xl border border-slate-100 border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md" :class="colorMap[task.color || 'blue'].border">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium" :class="`${colorMap[task.color || 'blue'].bg} ${colorMap[task.color || 'blue'].text}`">{{ task.category }}</span>
              <h3 class="mt-2 text-lg font-semibold text-slate-900">{{ task.title }}</h3>
              <p class="mt-1 text-sm text-slate-500">{{ task.description }}</p>
            </div>

            <div class="flex items-center gap-1.5 text-slate-300">
              <button class="rounded-lg p-1.5 transition hover:bg-red-50 hover:text-red-500" type="button" @click="deleteTask(task.id)">
                <Trash2 class="h-4 w-4" />
              </button>
              <button class="rounded-lg p-1.5 transition hover:bg-slate-100 hover:text-slate-500" type="button" @click="router.push(`/task/${task.id}`)">
                <ArrowRight class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center gap-1.5 text-sm text-slate-400">
            <Clock3 class="h-4 w-4" />
            <span>{{ task.startTime }} – {{ task.endTime }} · {{ task.duration ?? '1 jam' }}</span>
          </div>

          <div v-if="countSubtask(task).total" class="mt-3">
            <p class="mb-1 text-xs text-slate-400">Sub-task</p>
            <div class="h-1.5 rounded-full bg-slate-100">
              <div class="h-1.5 rounded-full" :class="colorMap[task.color || 'blue'].badge" :style="{ width: `${(countSubtask(task).completed / countSubtask(task).total) * 100}%` }" />
            </div>
            <p class="mt-1 text-xs text-slate-400">{{ countSubtask(task).completed }}/{{ countSubtask(task).total }}</p>
          </div>
        </article>
      </div>

      <div v-else class="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Tidak ada task sesuai filter saat ini.
      </div>
    </div>
  </MainLayout>
</template>