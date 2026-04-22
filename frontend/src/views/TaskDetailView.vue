<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-vue-next'

import MainLayout from '@/components/layout/MainLayout.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppCard from '@/components/ui/AppCard.vue'

import { useAppStore } from '@/composables/useAppStore'
import { useRequireAuth } from '@/composables/useRequireAuth'

useRequireAuth()

const router = useRouter()
const route = useRoute()

const {
  tasks,
  updateTask,
  addSubtask,
  deleteTask,
  deleteSubtask,
  toggleSubtask,
  updateSubtask
} = useAppStore()

const newSubtask = ref('')
const isEditingTask = ref(false)

const editTitle = ref('')
const editDescription = ref('')
const editStartTime = ref('')
const editEndTime = ref('')

const task = computed(() =>
  tasks.value.find(t => String(t.id) === String(route.params.taskId))
)

// ================= PROGRESS =================
const completionPercent = computed(() => {
  if (!task.value) return 0
  const total = task.value.subtasks?.length || 0
  if (!total) return 0
  const done = task.value.subtasks.filter(s => s.completed).length
  return Math.round((done / total) * 100)
})

// ================= ACTION =================
function handleAddSubtask() {
  const title = newSubtask.value.trim()
  if (!title || !task.value) return
  addSubtask(task.value.id, title)
  newSubtask.value = ''
}

function handleDeleteTask() {
  if (!task.value) return
  deleteTask(task.value.id)
  router.push('/task-manager')
}

function startEditTask() {
  if (!task.value) return
  editTitle.value = task.value.title
  editDescription.value = task.value.description || ''
  editStartTime.value = task.value.startTime
  editEndTime.value = task.value.endTime
  isEditingTask.value = true
}

function saveTaskEdit() {
  if (!task.value) return

  updateTask(task.value.id, {
    title: editTitle.value,
    description: editDescription.value,
    startTime: editStartTime.value,
    endTime: editEndTime.value,
    duration: buildDuration(editStartTime.value, editEndTime.value)
  })

  isEditingTask.value = false
}

// ================= HELPER =================
function buildDuration(start, end) {
  if (!start || !end) return '-'
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)

  const total = (eh * 60 + em) - (sh * 60 + sm)
  if (total <= 0) return '0 menit'

  const h = Math.floor(total / 60)
  const m = total % 60

  if (h && m) return `${h} jam ${m} menit`
  if (h) return `${h} jam`
  return `${m} menit`
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <MainLayout>
    <div v-if="task" class="space-y-6">

      <!-- BREADCRUMB -->
      <div class="text-sm text-slate-400 flex gap-2">
        <span>AI Scheduler</span>
        <span>›</span>
        <span>Task Manager</span>
        <span>›</span>
        <span class="text-slate-700 font-medium">Detail Task</span>
      </div>

      <!-- HEADER -->
      <div class="flex items-center gap-3">
        <button @click="router.back()" class="p-2 border rounded-lg hover:bg-slate-50">
          <ArrowLeft class="w-4 h-4" />
        </button>

        <h1 class="text-2xl font-bold">{{ task.title }}</h1>
      </div>

      <!-- DETAIL CARD -->
      <AppCard class="p-6">
        <div class="flex justify-between">
          <div>
            <AppBadge>{{ task.category }}</AppBadge>
            <h2 class="text-lg font-semibold mt-2">{{ task.title }}</h2>
          </div>

          <div class="flex gap-2">
            <button @click="startEditTask" class="p-2 hover:bg-slate-100 rounded-lg">
              <Edit2 class="w-4 h-4" />
            </button>

            <button @click="handleDeleteTask" class="p-2 hover:bg-red-50 rounded-lg text-red-500">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- INFO -->
        <div class="grid sm:grid-cols-3 gap-4 mt-5">
          <div class="bg-slate-50 p-4 rounded-xl">
            <p class="text-xs text-slate-400">Tanggal</p>
            <p class="mt-1 font-medium">{{ formatDate(task.date) }}</p>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl">
            <p class="text-xs text-slate-400">Waktu</p>
            <p class="mt-1 font-medium">
              {{ task.startTime || '-' }} - {{ task.endTime || '-' }}
            </p>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl">
            <p class="text-xs text-slate-400">Durasi</p>
            <p class="mt-1 font-medium">{{ task.duration || '-' }}</p>
          </div>
        </div>

        <!-- CATATAN -->
        <div class="bg-slate-50 p-4 rounded-xl mt-4">
          <p class="text-xs text-slate-400">Catatan</p>
          <p class="mt-1">{{ task.description || '-' }}</p>
        </div>
      </AppCard>

      <!-- SUBTASK -->
      <AppCard class="p-6">
        <div class="flex justify-between mb-2">
          <h2 class="font-semibold">Sub-Task</h2>
          <span class="text-blue-500 font-semibold">
            {{ completionPercent }}%
          </span>
        </div>

        <div class="text-sm text-slate-500 mb-3">
          Total {{ task.subtasks?.length || 0 }}
        </div>

        <!-- PROGRESS -->
        <div class="h-2 bg-slate-100 rounded-full mb-4">
          <div
            class="h-full bg-blue-500 rounded-full"
            :style="{ width: completionPercent + '%' }"
          />
        </div>

        <!-- LIST -->
        <div v-if="task.subtasks?.length" class="space-y-2">
          <div
            v-for="sub in task.subtasks"
            :key="sub.id"
            class="flex items-center gap-3 border rounded-xl p-3"
          >
            <button @click="toggleSubtask(task.id, sub.id)">
              <CheckCircle2 v-if="sub.completed" class="w-5 h-5 text-blue-500" />
              <Circle v-else class="w-5 h-5 text-slate-400" />
            </button>

            <input
              :value="sub.title"
              @input="updateSubtask(task.id, sub.id, $event.target.value)"
              class="flex-1 bg-transparent outline-none"
              :class="sub.completed && 'line-through text-slate-400'"
            />

            <button @click="deleteSubtask(task.id, sub.id)">
              <Trash2 class="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          </div>
        </div>

        <div v-else class="text-center text-slate-400 py-4">
          Belum ada subtask
        </div>

        <!-- INPUT -->
        <div class="flex gap-2 mt-4">
          <input
            v-model="newSubtask"
            class="flex-1 border rounded-xl px-3 py-2"
            placeholder="Tambah subtask..."
            @keyup.enter="handleAddSubtask"
          />
          <button
            @click="handleAddSubtask"
            class="bg-blue-500 text-white px-4 rounded-xl"
          >
            +
          </button>
        </div>
      </AppCard>

    </div>

    <!-- NOT FOUND -->
    <AppCard v-else class="p-6 text-center">
      Task tidak ditemukan
    </AppCard>
  </MainLayout>
</template>