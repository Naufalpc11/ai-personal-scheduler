<script setup>
import { computed, ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const hours = Array.from({ length: 13 }, (_, i) => i + 8)

const displayedDate = ref(new Date(2026, 3, 1))

const events = ref([
  { day: 0, start: 9, duration: 2, title: 'Kelas Pak Cahyo', category: 'kelas' },
  { day: 0, start: 14, duration: 1, title: 'Review PR Github', category: 'review' },
  { day: 2, start: 10, duration: 3, title: 'Client Meeting', category: 'meeting' },
  { day: 4, start: 13, duration: 2, title: 'Beli Batagor', category: 'personal' }
])

const monthLabel = computed(() =>
  displayedDate.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
)

const eventClassMap = {
  kelas: 'event-kelas',
  review: 'event-review',
  meeting: 'event-meeting',
  personal: 'event-personal'
}

const legendItems = [
  { key: 'kelas', label: 'Kelas' },
  { key: 'review', label: 'Review' },
  { key: 'meeting', label: 'Meeting' },
  { key: 'personal', label: 'Personal' }
]

function prevMonth() {
  const date = new Date(displayedDate.value)
  date.setMonth(date.getMonth() - 1)
  displayedDate.value = date
}

function nextMonth() {
  const date = new Date(displayedDate.value)
  date.setMonth(date.getMonth() + 1)
  displayedDate.value = date
}

function resetToToday() {
  const now = new Date()
  displayedDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
}

function eventsAt(dayIndex, hour) {
  return events.value.filter((event) => event.day === dayIndex && event.start === hour)
}

function eventHeight(duration) {
  return `${duration * 80 - 8}px`
}

function eventClass(category) {
  return eventClassMap[category] || 'event-kelas'
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="main-content">
      <section class="schedule-page">
        <header class="page-header">
          <div>
            <h1>Schedule</h1>
            <p>{{ monthLabel }}</p>
          </div>

          <div class="header-actions">
            <button class="ghost-btn" @click="prevMonth" aria-label="Previous month">&lt;</button>
            <button class="ghost-btn" @click="resetToToday">Today</button>
            <button class="ghost-btn" @click="nextMonth" aria-label="Next month">&gt;</button>
          </div>
        </header>

        <section class="calendar-card">
          <div class="calendar-header-grid">
            <div class="time-header">Time</div>
            <div v-for="day in days" :key="day" class="day-header">
              {{ day }}
            </div>
          </div>

          <div class="calendar-body">
            <div v-for="hour in hours" :key="hour" class="hour-row">
              <div class="time-cell">{{ hour }}:00</div>

              <div
                v-for="(day, dayIndex) in days"
                :key="`${hour}-${day}`"
                class="slot-cell"
              >
                <div
                  v-for="event in eventsAt(dayIndex, hour)"
                  :key="`${event.title}-${hour}-${dayIndex}`"
                  class="event-block"
                  :class="eventClass(event.category)"
                  :style="{ height: eventHeight(event.duration) }"
                >
                  {{ event.title }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="legend-row">
          <div v-for="item in legendItems" :key="item.key" class="legend-item">
            <span class="legend-dot" :class="eventClass(item.key)"></span>
            <span>{{ item.label }}</span>
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<style scoped>
.schedule-page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.page-header p {
  margin: 0;
  color: var(--color-muted);
  text-transform: capitalize;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.ghost-btn {
  padding: 10px 16px;
  border: 1px solid #d5d8df;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.ghost-btn:hover {
  background: #f2f5fb;
}

.calendar-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid #eceff3;
}

.calendar-header-grid,
.hour-row {
  display: grid;
  grid-template-columns: 110px repeat(7, minmax(120px, 1fr));
}

.calendar-header-grid {
  border-bottom: 1px solid #e5e8ee;
}

.time-header,
.day-header {
  padding: 14px;
  font-size: 0.88rem;
  font-weight: 700;
  border-right: 1px solid #eceff3;
}

.day-header:last-child {
  border-right: 0;
}

.time-header {
  color: #616a76;
}

.hour-row {
  border-bottom: 1px solid #f2f4f8;
}

.hour-row:last-child {
  border-bottom: 0;
}

.time-cell {
  padding: 14px;
  background: #fafbfd;
  color: #616a76;
  border-right: 1px solid #eceff3;
  font-size: 0.85rem;
}

.slot-cell {
  position: relative;
  min-height: 80px;
  border-right: 1px solid #f2f4f8;
  padding: 4px;
}

.slot-cell:last-child {
  border-right: 0;
}

.slot-cell:hover {
  background: #f8fbff;
}

.event-block {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 8px;
  border-radius: 10px;
  color: #fff;
  padding: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  box-shadow: 0 8px 16px rgba(13, 21, 34, 0.16);
  z-index: 2;
}

.event-kelas {
  background: #5b8dbe;
}

.event-review {
  background: #8d74d6;
}

.event-meeting {
  background: #4bb679;
}

.event-personal {
  background: #e3a340;
}

.legend-row {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5a6472;
  font-size: 0.9rem;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 5px;
}

@media (max-width: 1200px) {
  .calendar-card {
    overflow-x: auto;
  }

  .calendar-header-grid,
  .hour-row {
    min-width: 980px;
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
}
</style>
