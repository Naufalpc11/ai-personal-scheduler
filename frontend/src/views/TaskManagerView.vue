<script setup>
import { computed, ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import { mockScheduleData } from '../data/mockSchedule'

const taskName = ref('')
const taskDate = ref('')
const taskTime = ref('')

const weekDayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const today = new Date()
const selectedDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const displayMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const monthLabel = computed(() => {
  return displayMonth.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const selectedDateKey = computed(() => {
  return toDateKey(selectedDate.value)
})

const selectedDateLabel = computed(() => {
  const formatted = selectedDate.value.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

const scheduleHeading = computed(() => {
  return selectedDateLabel.value
})

const selectedSchedule = computed(() => {
  return mockScheduleData.filter((item) => item.date === selectedDateKey.value)
})

const calendarCells = computed(() => {
  const year = displayMonth.value.getFullYear()
  const month = displayMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (firstDay.getDay() + 6) % 7
  const cells = []

  for (let i = 0; i < offset; i += 1) {
    cells.push({ key: `empty-${year}-${month}-${i}`, day: null })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(year, month, day)
    const isToday =
      current.getFullYear() === today.getFullYear() &&
      current.getMonth() === today.getMonth() &&
      current.getDate() === today.getDate()
    const isSelected =
      current.getFullYear() === selectedDate.value.getFullYear() &&
      current.getMonth() === selectedDate.value.getMonth() &&
      current.getDate() === selectedDate.value.getDate()

    cells.push({
      key: `${year}-${month}-${day}`,
      day,
      date: current,
      isToday,
      isSelected
    })
  }

  return cells
})

function previousMonth() {
  const prev = new Date(displayMonth.value)
  prev.setMonth(prev.getMonth() - 1)
  displayMonth.value = new Date(prev.getFullYear(), prev.getMonth(), 1)
}

function nextMonth() {
  const next = new Date(displayMonth.value)
  next.setMonth(next.getMonth() + 1)
  displayMonth.value = new Date(next.getFullYear(), next.getMonth(), 1)
}

function pickDate(cell) {
  if (!cell.date) {
    return
  }

  selectedDate.value = new Date(cell.date)
  taskDate.value = toDateKey(cell.date)
}

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="main-content">
      <header class="header">
        <h1>Task Manager</h1>
        <button class="btn-ai">✨ Generate with AI</button>
      </header>

      <div class="content-grid">
        <div class="left-column">
          <section class="card form-section">
            <h3>Buat Task Baru</h3>
            <form @submit.prevent>
              <div class="form-group">
                <label>Nama Task</label>
                <input type="text" v-model="taskName" placeholder="Masukkan judul task..." />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Tanggal</label>
                  <input type="date" v-model="taskDate" />
                </div>
                <div class="form-group">
                  <label>Waktu</label>
                  <input type="time" v-model="taskTime" />
                </div>
              </div>
              <button class="btn-primary">Buat Task</button>
            </form>
          </section>

          <section class="card list-section">
            <h3>Task Terbaru</h3>
            <div class="task-item">
              <div class="task-info">
                <strong>Kelas Pak Cahyo</strong>
                <p>10:00 - 11:00 AM</p>
              </div>
              <button class="btn-outline">Detail</button>
            </div>
            <div class="task-item">
              <div class="task-info">
                <strong>Beli Batagor</strong>
                <p>13:00 - 15:00 PM</p>
              </div>
              <button class="btn-outline">Detail</button>
            </div>
          </section>
        </div>

        <div class="right-column">
          <section class="card calendar-section">
            <div class="calendar-header">
              <h3>{{ monthLabel }}</h3>
              <div class="cal-nav">
                <button type="button" @click="previousMonth">&lt;</button>
                <button type="button" @click="nextMonth">&gt;</button>
              </div>
            </div>
            <div class="calendar-grid">
              <div v-for="weekDay in weekDayNames" :key="weekDay" class="cal-day-name">{{ weekDay }}</div>
              <button
                v-for="cell in calendarCells"
                :key="cell.key"
                type="button"
                class="cal-day"
                :class="{
                  'is-empty': !cell.day,
                  'active-day': cell.isSelected,
                  'today-outline': cell.isToday && !cell.isSelected
                }"
                :disabled="!cell.day"
                @click="pickDate(cell)"
              >
                {{ cell.day }}
              </button>
            </div>
          </section>

          <section class="card schedule-section">
            <h3>{{ scheduleHeading }}</h3>

            <div v-if="selectedSchedule.length === 0" class="empty-schedule">
              Tidak ada jadwal untuk tanggal ini.
            </div>

            <div v-for="item in selectedSchedule" :key="`${item.date}-${item.title}-${item.time}`" class="schedule-item">
              <div class="task-info">
                <strong>{{ item.title }}</strong>
                <p>{{ item.time }}</p>
              </div>
              <button class="btn-action">Detail</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}
.header h1 { font-size: 1.8rem; color: #000000; }
.btn-ai {
  background-color: #4A70A9;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

/* GRID LAYOUT */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  margin-bottom: 20px;
}
h3 { margin-bottom: 15px; color: #000000; font-size: 1.1rem; }

/* FORM STYLES */
.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}
.form-row {
  display: flex;
  gap: 15px;
}
.form-row .form-group { flex: 1; }
label { font-size: 0.85rem; color: #666; margin-bottom: 5px; }
input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
}
.btn-primary {
  width: 100%;
  padding: 12px;
  background-color: #4A70A9;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

/* LIST ITEMS */
.task-item, .schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 10px;
}
.task-info strong { display: block; color: #000000; font-size: 0.95rem; }
.task-info p { color: #888; font-size: 0.8rem; margin-top: 3px; }
.btn-outline {
  background: transparent;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-action {
  background: white;
  border: 1px solid #4A70A9;
  color: #4A70A9;
  padding: 6px 15px;
  border-radius: 6px;
  cursor: pointer;
}
.empty-schedule {
  border: 1px dashed #d4d9e2;
  border-radius: 10px;
  padding: 12px;
  color: #6a7280;
  background: #fafbfd;
  margin-bottom: 10px;
}

/* CALENDAR STYLES */
.calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.cal-nav button { background: none; border: 1px solid #eee; padding: 4px 10px; border-radius: 4px; cursor: pointer; margin-left: 5px; }
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  text-align: center;
}
.cal-day-name { font-size: 0.8rem; color: #888; margin-bottom: 5px; }
.cal-day {
  padding: 10px;
  font-size: 0.9rem;
  color: #555;
  border: 0;
  background: transparent;
  border-radius: 5px;
}

.cal-day:hover { background: #8FABD4; color: white; cursor: pointer; }
.active-day { background-color: #4A70A9; color: white; border-radius: 5px; }
.is-empty { visibility: hidden; pointer-events: none; }
.today-outline { outline: 1px solid #4A70A9; }

@media (max-width: 960px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>