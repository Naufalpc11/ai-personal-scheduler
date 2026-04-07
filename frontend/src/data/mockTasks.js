export const mockTasks = [
  {
    id: 'task-1',
    title: 'Review PR Github',
    date: '2026-04-07',
    time: '09:00 AM',
    duration: '1 jam',
    category: 'review',
    notes: 'Cek linting, test pass, dan comment pada 2 PR utama.',
    subtasks: [
      { id: 'sub-1', title: 'Baca deskripsi PR', done: true },
      { id: 'sub-2', title: 'Pull branch dan test lokal', done: false },
      { id: 'sub-3', title: 'Tulis feedback review', done: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Sync Backend API',
    date: '2026-04-07',
    time: '11:00 AM',
    duration: '1.5 jam',
    category: 'meeting',
    notes: 'Sinkronisasi endpoint task/subtask dan error contract.',
    subtasks: [
      { id: 'sub-4', title: 'Bahas payload create task', done: false },
      { id: 'sub-5', title: 'Verifikasi response schema', done: false }
    ]
  },
  {
    id: 'task-3',
    title: 'Kelas Pak Cahyo',
    date: '2026-04-08',
    time: '10:00 AM',
    duration: '2 jam',
    category: 'kelas',
    notes: 'Materi minggu ini: perancangan sistem berbasis AI.',
    subtasks: [
      { id: 'sub-6', title: 'Siapkan catatan', done: true },
      { id: 'sub-7', title: 'Kumpulkan tugas kelas', done: false }
    ]
  },
  {
    id: 'task-4',
    title: 'Client Meeting',
    date: '2026-04-10',
    time: '02:00 PM',
    duration: '1 jam',
    category: 'meeting',
    notes: 'Presentasi update progress dan next milestone.',
    subtasks: [
      { id: 'sub-8', title: 'Siapkan slide presentasi', done: false },
      { id: 'sub-9', title: 'Kirim agenda meeting', done: true }
    ]
  }
]

export function getTaskById(taskId) {
  return mockTasks.find((task) => task.id === taskId)
}
