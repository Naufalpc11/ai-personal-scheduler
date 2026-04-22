import { computed, reactive, readonly } from 'vue'

const TODAY = '2026-04-21'

const initialTasks = [
  {
    id: 1,
    title: 'Kelas Pak Cahyo',
    date: TODAY,
    startTime: '09:00',
    endTime: '11:00',
    duration: '2 jam',
    notes: 'Perancangan sistem berbasis AI. Kumpulkan tugas sebelum kelas dimulai.',
    category: 'Kelas',
    color: 'blue',
    subtasks: [
      { id: 1, title: 'Siapkan catatan', completed: true },
      { id: 2, title: 'Kumpulkan tugas kelas', completed: false }
    ]
  },
  {
    id: 2,
    title: 'Review PR Github',
    date: TODAY,
    startTime: '11:30',
    endTime: '12:30',
    duration: '1 jam',
    notes: 'Review pull request dari tim untuk fitur authentication baru.',
    category: 'Review',
    color: 'purple',
    subtasks: []
  },
  {
    id: 3,
    title: 'Beli Batagor',
    date: TODAY,
    startTime: '13:00',
    endTime: '14:30',
    duration: '1.5 jam',
    notes: 'Beli batagor di warung Bu Siti. Jangan lupa uang cash.',
    category: 'Personal',
    color: 'amber',
    subtasks: []
  },
  {
    id: 4,
    title: 'Sprint Planning Meeting',
    date: TODAY,
    startTime: '15:00',
    endTime: '17:00',
    duration: '2 jam',
    notes: 'Sprint planning untuk minggu depan bersama seluruh tim dev.',
    category: 'Meeting',
    color: 'green',
    subtasks: [
      { id: 1, title: 'Siapkan backlog items', completed: false },
      { id: 2, title: 'Review velocity sprint lalu', completed: false }
    ]
  },
  {
    id: 5,
    title: 'Client Presentation',
    date: '2026-04-22',
    startTime: '10:00',
    endTime: '12:00',
    duration: '2 jam',
    notes: 'Presentasi proposal sistem AI ke klien baru dari Jakarta.',
    category: 'Meeting',
    color: 'green',
    subtasks: []
  },
  {
    id: 6,
    title: 'Belajar TypeScript',
    date: '2026-04-22',
    startTime: '14:00',
    endTime: '16:00',
    duration: '2 jam',
    notes: 'Lanjut belajar advanced TypeScript patterns.',
    category: 'Belajar',
    color: 'blue',
    subtasks: []
  }
]

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? task.notes ?? '',
    date: task.date,
    startTime: task.startTime,
    endTime: task.endTime,
    priority: task.priority ?? 'medium',
    status: task.status ?? 'pending',
    category: task.category ?? 'General',
    color: task.color ?? 'blue',
    subtasks: task.subtasks ?? []
  }
}

function getSavedUser() {
  try {
    const saved = localStorage.getItem('ai_scheduler_user')
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

const state = reactive({
  tasks: initialTasks.map((task) => normalizeTask(task)),
  user: getSavedUser()
})

export const colorMap = {
  blue: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', dot: 'bg-blue-400', badge: 'bg-blue-500', light: 'bg-blue-50' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', dot: 'bg-purple-400', badge: 'bg-purple-500', light: 'bg-purple-50' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700', dot: 'bg-amber-400', badge: 'bg-amber-500', light: 'bg-amber-50' },
  green: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', dot: 'bg-green-400', badge: 'bg-green-500', light: 'bg-green-50' },
  red: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', dot: 'bg-red-400', badge: 'bg-red-500', light: 'bg-red-50' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-400', text: 'text-pink-700', dot: 'bg-pink-400', badge: 'bg-pink-500', light: 'bg-pink-50' }
}

export function useAppStore() {
  const tasks = computed(() => state.tasks)
  const user = computed(() => state.user)

  function addTask(task) {
    state.tasks.push(normalizeTask({ ...task, id: Date.now() }))
  }

  function updateTask(id, updates) {
    state.tasks = state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task))
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((task) => task.id !== id)
  }

  function addSubtask(taskId, title) {
    state.tasks = state.tasks.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      return {
        ...task,
        subtasks: [
          ...task.subtasks,
          { id: Date.now(), title, completed: false }
        ]
      }
    })
  }

  function updateSubtask(taskId, subtaskId, title) {
    state.tasks = state.tasks.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      return {
        ...task,
        subtasks: task.subtasks.map((subtask) => (
          subtask.id === subtaskId ? { ...subtask, title } : subtask
        ))
      }
    })
  }

  function toggleSubtask(taskId, subtaskId) {
    state.tasks = state.tasks.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      return {
        ...task,
        subtasks: task.subtasks.map((subtask) => (
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        ))
      }
    })
  }

  function deleteSubtask(taskId, subtaskId) {
    state.tasks = state.tasks.map((task) => {
      if (task.id !== taskId) {
        return task
      }

      return {
        ...task,
        subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId)
      }
    })
  }

  function login(name, email) {
    const payload = { name, email }
    localStorage.setItem('ai_scheduler_user', JSON.stringify(payload))
    state.user = payload
  }

  function logout() {
    localStorage.removeItem('ai_scheduler_user')
    state.user = null
  }

  return {
    state: readonly(state),
    tasks,
    user,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtask,
    deleteSubtask,
    login,
    logout
  }
}
