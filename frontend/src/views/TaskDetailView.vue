<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '../components/AppSidebar.vue'
import { getTaskById } from '../data/mockTasks'

const route = useRoute()
const router = useRouter()

const taskId = computed(() => route.params.taskId)
const sourceTask = getTaskById(taskId.value)

const isDeleted = ref(false)
const isEditing = ref(false)
const newSubTask = ref('')

const taskState = ref(
  sourceTask
    ? {
        ...sourceTask,
        subtasks: sourceTask.subtasks.map((item) => ({ ...item }))
      }
    : null
)

const canSave = computed(() => {
  return taskState.value && taskState.value.title.trim() && taskState.value.date && taskState.value.time
})

const progress = computed(() => {
  if (!taskState.value || taskState.value.subtasks.length === 0) {
    return 0
  }

  const doneCount = taskState.value.subtasks.filter((item) => item.done).length
  return Math.round((doneCount / taskState.value.subtasks.length) * 100)
})

const totalSubTask = computed(() => taskState.value?.subtasks.length ?? 0)
const completedSubTask = computed(() => taskState.value?.subtasks.filter((item) => item.done).length ?? 0)
const remainingSubTask = computed(() => totalSubTask.value - completedSubTask.value)
const canAddSubTask = computed(() => newSubTask.value.trim().length > 0)

function toggleEdit() {
  isEditing.value = !isEditing.value
}

function saveTask() {
  if (!canSave.value) {
    return
  }

  isEditing.value = false
}

function deleteTask() {
  isDeleted.value = true
}

function addSubTask() {
  if (!taskState.value || !newSubTask.value.trim()) {
    return
  }

  taskState.value.subtasks.push({
    id: `sub-${Date.now()}`,
    title: newSubTask.value.trim(),
    done: false
  })
  newSubTask.value = ''
}

function deleteSubTask(subTaskId) {
  if (!taskState.value) {
    return
  }

  taskState.value.subtasks = taskState.value.subtasks.filter((item) => item.id !== subTaskId)
}

function toggleSubTask(subTaskId) {
  if (!taskState.value) {
    return
  }

  const target = taskState.value.subtasks.find((item) => item.id === subTaskId)
  if (target) {
    target.done = !target.done
  }
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="main-content">
      <section v-if="!taskState" class="card state-card">
        <h2>Task tidak ditemukan</h2>
        <button class="btn-back" @click="router.push('/task-manager')">Kembali ke Task Manager</button>
      </section>

      <section v-else-if="isDeleted" class="card state-card">
        <h2>Task berhasil dihapus (dummy state)</h2>
        <button class="btn-back" @click="router.push('/task-manager')">Kembali ke Task Manager</button>
      </section>

      <section v-else class="detail-page">
        <header class="header-row">
          <h1>Detail Task</h1>
          <button class="btn-back" @click="router.push('/task-manager')">Kembali</button>
        </header>

        <section class="card">
          <div class="title-row">
            <h2>{{ taskState.title }}</h2>
            <div class="action-row">
              <button class="btn-outline" @click="toggleEdit">{{ isEditing ? 'Batal' : 'Edit Task' }}</button>
              <button class="btn-danger" @click="deleteTask">Delete Task</button>
            </div>
          </div>

          <div class="meta-grid">
            <label>
              Tanggal
              <input v-model="taskState.date" type="date" :disabled="!isEditing" />
            </label>
            <label>
              Waktu
              <input v-model="taskState.time" type="text" :disabled="!isEditing" />
            </label>
            <label>
              Durasi
              <input v-model="taskState.duration" type="text" :disabled="!isEditing" />
            </label>
          </div>

          <label class="field-block">
            Judul
            <input v-model="taskState.title" type="text" :disabled="!isEditing" />
          </label>

          <label class="field-block">
            Catatan
            <textarea v-model="taskState.notes" rows="4" :disabled="!isEditing"></textarea>
          </label>

          <button v-if="isEditing" class="btn-primary" :disabled="!canSave" @click="saveTask">Simpan Perubahan</button>
        </section>

        <section class="card">
          <div class="title-row">
            <h2>Sub-Task List</h2>
            <p class="progress">Progress: {{ progress }}%</p>
          </div>

          <div class="subtask-stats">
            <span class="stat-pill">Total: {{ totalSubTask }}</span>
            <span class="stat-pill done-pill">Selesai: {{ completedSubTask }}</span>
            <span class="stat-pill remain-pill">Tersisa: {{ remainingSubTask }}</span>
          </div>

          <div class="progress-track">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>

          <div v-if="totalSubTask === 0" class="empty-subtask">
            Belum ada sub-task. Tambahkan langkah kerja pertamamu di bawah.
          </div>

          <div v-else class="subtask-list">
            <div v-for="subTask in taskState.subtasks" :key="subTask.id" class="subtask-item">
              <div class="subtask-main">
                <input
                  class="subtask-checkbox"
                  type="checkbox"
                  :checked="subTask.done"
                  @change="toggleSubTask(subTask.id)"
                />
                <span class="subtask-content">
                  <span class="subtask-title" :class="{ done: subTask.done }">{{ subTask.title }}</span>
                </span>
              </div>
              <button class="btn-danger-ghost" @click="deleteSubTask(subTask.id)">Delete Sub-Task</button>
            </div>
          </div>

          <div class="add-subtask-row">
            <input v-model="newSubTask" type="text" placeholder="Tambah sub-task baru" @keyup.enter="addSubTask" />
            <button class="btn-primary" :disabled="!canAddSubTask" @click="addSubTask">Input Sub-Task</button>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<style scoped>
.detail-page {
  display: grid;
  gap: 20px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1,
h2 {
  margin: 0;
}

.state-card {
  display: grid;
  gap: 12px;
  max-width: 520px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-row {
  display: flex;
  gap: 8px;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.meta-grid label,
.field-block {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  color: #5f6875;
}

input,
textarea {
  width: 100%;
  border: 1px solid #d8dce5;
  border-radius: 8px;
  padding: 10px;
}

input:disabled,
textarea:disabled {
  background: #f7f8fb;
}

.field-block {
  margin-bottom: 12px;
}

.subtask-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.subtask-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eceff3;
  border-radius: 12px;
  padding: 12px;
  background: #fcfdff;
}

.subtask-main {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.subtask-checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.subtask-content {
  display: block;
  min-width: 0;
}

.subtask-title {
  display: block;
  color: #253041;
  font-weight: 500;
  line-height: 1.35;
  word-break: break-word;
}

.done {
  text-decoration: line-through;
  color: #7e8794;
}

.subtask-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-pill {
  font-size: 0.78rem;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #d7deea;
  color: #4c5870;
  background: #f7f9fd;
}

.done-pill {
  border-color: #b9e5ca;
  background: #edf9f1;
  color: #2f7f4c;
}

.remain-pill {
  border-color: #f2d0d3;
  background: #fff5f6;
  color: #a13e47;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: #edf1f7;
  border-radius: 999px;
  overflow: hidden;
  margin-top: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4a70a9, #66a2c9);
  border-radius: 999px;
  transition: width 0.2s ease;
}

.empty-subtask {
  margin-top: 14px;
  border: 1px dashed #ccd5e2;
  border-radius: 10px;
  padding: 12px;
  color: #647089;
  background: #fafcff;
}

.add-subtask-row {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.progress {
  margin: 0;
  color: #4a70a9;
  font-weight: 700;
}

.btn-primary,
.btn-outline,
.btn-danger,
.btn-danger-ghost,
.btn-back {
  border-radius: 8px;
  padding: 9px 12px;
  cursor: pointer;
}

.btn-primary {
  background: #4a70a9;
  color: #fff;
  border: 1px solid #4a70a9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline,
.btn-back {
  background: #fff;
  color: #4a70a9;
  border: 1px solid #4a70a9;
}

.btn-danger {
  background: #cd3842;
  color: #fff;
  border: 1px solid #cd3842;
}

.btn-danger-ghost {
  background: #fff;
  color: #cd3842;
  border: 1px solid #cd3842;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .subtask-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .btn-danger-ghost {
    width: 100%;
  }

  .add-subtask-row {
    grid-template-columns: 1fr;
  }
}
</style>
