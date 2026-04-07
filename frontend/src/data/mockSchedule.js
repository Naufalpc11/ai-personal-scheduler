export const mockScheduleData = [
  // Monday, April 7, 2026
  { taskId: 'task-1', date: '2026-04-07', title: 'Review PR Github', time: '09:00 AM', category: 'review' },
  { taskId: 'task-2', date: '2026-04-07', title: 'Sync Backend API', time: '11:00 AM', category: 'meeting' },
  { taskId: null, date: '2026-04-07', title: 'Lunch Break', time: '12:30 PM', category: 'personal' },

  // Tuesday, April 8, 2026
  { taskId: 'task-3', date: '2026-04-08', title: 'Kelas Pak Cahyo', time: '10:00 AM', category: 'kelas' },
  { taskId: null, date: '2026-04-08', title: 'Beli Batagor', time: '01:00 PM', category: 'personal' },

  // Wednesday, April 9, 2026
  { taskId: null, date: '2026-04-09', title: 'Client Meeting Prep', time: '08:30 AM', category: 'meeting' },
  { taskId: null, date: '2026-04-09', title: 'Code Review Session', time: '02:00 PM', category: 'review' },

  // Thursday, April 10, 2026
  { taskId: 'task-4', date: '2026-04-10', title: 'Client Meeting', time: '02:00 PM', category: 'meeting' },

  // Friday, April 11, 2026
  { taskId: null, date: '2026-04-11', title: 'Weekly Standup', time: '09:30 AM', category: 'meeting' },
  { taskId: null, date: '2026-04-11', title: 'Sprint Planning', time: '03:00 PM', category: 'meeting' },

  // Saturday, April 12, 2026
  { taskId: null, date: '2026-04-12', title: 'Grocery Shopping', time: '10:00 AM', category: 'personal' },

  // Sunday, April 13, 2026
  { taskId: null, date: '2026-04-13', title: 'Preparation for Week', time: '04:00 PM', category: 'personal' }
]

export const eventCategories = {
  kelas: { label: 'Kelas', color: '#5b8dbe', bgColor: '#ecf4ff' },
  review: { label: 'Review', color: '#8d74d6', bgColor: '#f4efff' },
  meeting: { label: 'Meeting', color: '#4bb679', bgColor: '#e9f9f1' },
  personal: { label: 'Personal', color: '#e3a340', bgColor: '#fff8e9' }
}

export function getScheduleByDate(dateString) {
  return mockScheduleData.filter((item) => item.date === dateString)
}
