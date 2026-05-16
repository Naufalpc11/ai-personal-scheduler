import { computed, reactive, readonly } from 'vue'
import { apiRequest } from '@/utils/api'

const STORAGE_KEY = 'ai_scheduler_auth'

function getStoredAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const storedAuth = getStoredAuth()

const state = reactive({
  rawTasks: [],
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  isLoading: false,
  error: null,
  hasLoaded: false
})

function setAuth(user, token) {
  state.user = user
  state.token = token
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
}

function clearAuth() {
  state.user = null
  state.token = null
  state.rawTasks = []
  state.hasLoaded = false
  localStorage.removeItem(STORAGE_KEY)
}

function toUiStatus(status) {
  if (status === 'done') return 'completed'
  return status
}

function toApiStatus(status) {
  if (status === 'completed') return 'done'
  return status
}

function toDateOnly(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function toTimeOnly(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function buildDuration(startIso, endIso) {
  if (!startIso || !endIso) return '-'
  const start = new Date(startIso)
  const end = new Date(endIso)
  const diffMinutes = Math.max(0, Math.round((end - start) / 60000))
  if (!diffMinutes) return '0 menit'
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  if (hours && minutes) return `${hours} jam ${minutes} menit`
  if (hours) return `${hours} jam`
  return `${minutes} menit`
}

function pickPrimarySchedule(task) {
  if (!task?.schedules?.length) return null
  return [...task.schedules].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0]
}

function mapSubtask(subtask) {
  return {
    id: subtask.id,
    title: subtask.title,
    completed: subtask.status === 'done',
    status: toUiStatus(subtask.status)
  }
}

function mapTask(task) {
  const primarySchedule = pickPrimarySchedule(task)
  return {
    id: task.id,
    title: task.title,
    description: task.description || '',
    date: primarySchedule ? toDateOnly(primarySchedule.startTime) : task.dueDate || null,
    startTime: primarySchedule ? toTimeOnly(primarySchedule.startTime) : '',
    endTime: primarySchedule ? toTimeOnly(primarySchedule.endTime) : '',
    duration: primarySchedule ? buildDuration(primarySchedule.startTime, primarySchedule.endTime) : '-',
    priority: 'medium',
    status: toUiStatus(task.status),
    category: 'General',
    color: 'blue',
    scheduleId: primarySchedule?.id || null,
    subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(mapSubtask) : []
  }
}

function toScheduleIso(date, time) {
  if (!date || !time) return null
  const local = new Date(`${date}T${time}:00`)
  return local.toISOString()
}

function toScheduleIsoRange(date, startTime, endTime) {
  const startIso = toScheduleIso(date, startTime)
  const endLocal = new Date(`${date}T${endTime}:00`)

  if (!startIso || Number.isNaN(endLocal.getTime())) {
    return { startIso, endIso: null }
  }

  const startLocal = new Date(`${date}T${startTime}:00`)
  let endIso = endLocal.toISOString()

  if (!Number.isNaN(startLocal.getTime()) && endLocal.getTime() <= startLocal.getTime()) {
    endLocal.setDate(endLocal.getDate() + 1)
    endIso = endLocal.toISOString()
  }

  return { startIso, endIso }
}

export const colorMap = {
  blue: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-400', badge: 'bg-blue-500', light: 'bg-blue-50' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', dot: 'bg-purple-400', badge: 'bg-purple-500', light: 'bg-purple-50' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', dot: 'bg-amber-400', badge: 'bg-amber-500', light: 'bg-amber-50' },
  green: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', dot: 'bg-green-400', badge: 'bg-green-500', light: 'bg-green-50' },
  red: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', dot: 'bg-red-400', badge: 'bg-red-500', light: 'bg-red-50' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700', dot: 'bg-pink-400', badge: 'bg-pink-500', light: 'bg-pink-50' }
}

export function useAppStore() {
  const tasks = computed(() => state.rawTasks.map(mapTask))
  const user = computed(() => state.user)
  const token = computed(() => state.token)

  async function fetchTasks() {
    if (!state.token) return
    state.isLoading = true
    state.error = null

    try {
      const response = await apiRequest('/tasks', { token: state.token })
      state.rawTasks = response.data || []
      state.hasLoaded = true
    } catch (error) {
      state.error = error.message
    } finally {
      state.isLoading = false
    }
  }

  async function addTask(task) {
    if (!state.token) return null
    state.error = null

    try {
      const taskPayload = {
        title: task.title,
        description: task.description || '',
        status: toApiStatus(task.status || 'pending'),
        dueDate: task.date || null
      }
      const created = await apiRequest('/tasks', {
        method: 'POST',
        token: state.token,
        body: taskPayload
      })

      const taskId = created.data?.id
      const { startIso, endIso } = toScheduleIsoRange(task.date, task.startTime, task.endTime)

      if (taskId && startIso && endIso) {
        await apiRequest('/schedule', {
          method: 'POST',
          token: state.token,
          body: {
            taskId,
            startTime: startIso,
            endTime: endIso
          }
        })
      }

      await fetchTasks()
      return created.data
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function updateTask(id, updates) {
    if (!state.token) return null
    state.error = null

    const payload = {}
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.status !== undefined) payload.status = toApiStatus(updates.status)
    if (updates.date !== undefined) payload.dueDate = updates.date

    try {
      await apiRequest(`/tasks/${id}`, {
        method: 'PUT',
        token: state.token,
        body: payload
      })

      if (updates.startTime || updates.endTime || updates.date) {
        const task = tasks.value.find((item) => item.id === id)
        const scheduleId = task?.scheduleId
        const date = updates.date || task?.date
        const start = updates.startTime || task?.startTime
        const end = updates.endTime || task?.endTime
        const { startIso, endIso } = toScheduleIsoRange(date, start, end)

        if (scheduleId && startIso && endIso) {
          await apiRequest(`/schedule/${scheduleId}`, {
            method: 'PUT',
            token: state.token,
            body: {
              startTime: startIso,
              endTime: endIso
            }
          })
        }
      }

      await fetchTasks()
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function deleteTask(id) {
    if (!state.token) return
    state.error = null

    try {
      await apiRequest(`/tasks/${id}`, { method: 'DELETE', token: state.token })
      await fetchTasks()
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function addSubtask(taskId, title) {
    if (!state.token) return
    state.error = null

    try {
      await apiRequest(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        token: state.token,
        body: { title, status: 'pending' }
      })
      await fetchTasks()
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function updateSubtask(taskId, subtaskId, title) {
    if (!state.token) return
    state.error = null

    try {
      await apiRequest(`/subtasks/${subtaskId}`, {
        method: 'PUT',
        token: state.token,
        body: { title }
      })
      await fetchTasks()
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function toggleSubtask(taskId, subtaskId) {
    if (!state.token) return
    state.error = null

    const task = tasks.value.find((item) => item.id === taskId)
    const subtask = task?.subtasks?.find((item) => item.id === subtaskId)
    const nextStatus = subtask?.completed ? 'pending' : 'done'

    try {
      await apiRequest(`/subtasks/${subtaskId}`, {
        method: 'PUT',
        token: state.token,
        body: { status: nextStatus }
      })
      await fetchTasks()
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function deleteSubtask(taskId, subtaskId) {
    if (!state.token) return
    state.error = null

    try {
      await apiRequest(`/subtasks/${subtaskId}`, { method: 'DELETE', token: state.token })
      await fetchTasks()
    } catch (error) {
      state.error = error.message
      throw error
    }
  }

  async function register(name, email, password) {
    state.error = null
    const response = await apiRequest('/register', {
      method: 'POST',
      body: { name, email, password }
    })
    setAuth(response.data.user, response.data.token)
    await fetchTasks()
    return response.data
  }

  async function login(email, password) {
    state.error = null
    const response = await apiRequest('/login', {
      method: 'POST',
      body: { email, password }
    })
    setAuth(response.data.user, response.data.token)
    await fetchTasks()
    return response.data
  }

  function logout() {
    clearAuth()
  }

  return {
    state: readonly(state),
    tasks,
    user,
    token,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtask,
    deleteSubtask,
    register,
    login,
    logout
  }
}
