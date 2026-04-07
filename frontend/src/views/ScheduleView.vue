<script setup>
import { computed, ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'
import { mockScheduleData } from '../data/mockSchedule'

const hours = Array.from({ length: 13 }, (_, i) => i + 8)

const today = new Date()
const displayedMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const displayedWeekIndex = ref(1)

const firstWeekOffset = computed(() => {
  return (new Date(displayedMonth.value.getFullYear(), displayedMonth.value.getMonth(), 1).getDay() + 6) % 7
})

const monthLabel = computed(() =>
  displayedMonth.value.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  })
)

const daysInDisplayedMonth = computed(() => {
  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})

const totalWeeksInMonth = computed(() => {
  return Math.ceil((firstWeekOffset.value + daysInDisplayedMonth.value) / 7)
})

function getWeekIndexForDate(date) {
  const offset = (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7
  return Math.floor((offset + date.getDate() - 1) / 7) + 1
}

if (
  today.getFullYear() === displayedMonth.value.getFullYear() &&
  today.getMonth() === displayedMonth.value.getMonth()
) {
  displayedWeekIndex.value = getWeekIndexForDate(today)
}

const weekInfo = computed(() => {
  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  const gridStartDate = new Date(year, month, 1 - firstWeekOffset.value)
  const weekStartDate = new Date(gridStartDate)
  weekStartDate.setDate(gridStartDate.getDate() + (displayedWeekIndex.value - 1) * 7)

  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekStartDate.getDate() + 6)

  return {
    weekStartDate,
    weekEndDate
  }
})

const weekDays = computed(() => {
  const result = []
  const month = displayedMonth.value.getMonth()
  const weekStart = weekInfo.value.weekStartDate

  for (let i = 0; i < 7; i += 1) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const inCurrentMonth = date.getMonth() === month

    result.push({
      key: `${toDateKey(date)}-${i}`,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      weekdayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      inCurrentMonth
    })
  }

  return result
})

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

// Transform mock data: date string + time -> day index + hour + duration
const processedEvents = computed(() => {
  const result = []
  const weekStartKey = toDateKey(weekInfo.value.weekStartDate)
  const weekEndKey = toDateKey(weekInfo.value.weekEndDate)

  mockScheduleData.forEach((item) => {
    if (item.date >= weekStartKey && item.date <= weekEndKey) {
      const hour = parseHour(item.time)
      result.push({
        date: item.date,
        start: hour,
        duration: 1,
        title: item.title,
        category: item.category || 'kelas'
      })
    }
  })

  return result
})

function previousMonth() {
  if (displayedWeekIndex.value > 1) {
    displayedWeekIndex.value -= 1
    return
  }

  const prevMonth = new Date(displayedMonth.value)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  displayedMonth.value = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1)
  displayedWeekIndex.value = totalWeeksInMonth.value
}

function nextMonth() {
  if (displayedWeekIndex.value < totalWeeksInMonth.value) {
    displayedWeekIndex.value += 1
    return
  }

  const nextMonth = new Date(displayedMonth.value)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  displayedMonth.value = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)
  displayedWeekIndex.value = 1
}

function eventsAt(dateKey, hour) {
  if (!dateKey) {
    return []
  }

  return processedEvents.value.filter((event) => event.date === dateKey && event.start === hour)
}

function eventHeight(duration) {
  return `${duration * 80 - 8}px`
}

function eventClass(category) {
  return eventClassMap[category] || 'event-kelas'
}

function parseHour(timeText) {
  const [clock, period] = timeText.split(' ')
  const [hourText] = clock.split(':')
  let hour = parseInt(hourText, 10)

  if (period === 'PM' && hour !== 12) {
    hour += 12
  }

  if (period === 'AM' && hour === 12) {
    hour = 0
  }

  return hour
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
      <section class="schedule-page">
        <header class="page-header">
          <div>
            <h1>Schedule</h1>
            <p>Minggu ke-{{ displayedWeekIndex }} dari {{ totalWeeksInMonth }} - {{ monthLabel }}</p>
          </div>

          <div class="header-actions">
            <button class="ghost-btn" @click="previousMonth" aria-label="Previous month">&lt;</button>

            <button class="ghost-btn" @click="nextMonth" aria-label="Next month">&gt;</button>
          </div>
        </header>

        <section class="calendar-card">
          <div class="calendar-header-grid">
            <div class="time-header">Time</div>
            <div v-for="day in weekDays" :key="day.key" class="day-header">
              <span class="day-name">{{ day.weekdayLabel }}</span>
              <span class="day-date" :class="{ 'date-muted': !day.inCurrentMonth }">{{ day.dayNumber }}</span>
            </div>
          </div>

          <div class="calendar-body">
            <div v-for="hour in hours" :key="hour" class="hour-row">
              <div class="time-cell">{{ hour }}:00</div>

              <div
                v-for="day in weekDays"
                :key="`${hour}-${day.key}`"
                class="slot-cell"
                :class="{ 'slot-empty': !day.inCurrentMonth }"
              >
                <div
                  v-for="event in eventsAt(day.dateKey, hour)"
                  :key="`${event.title}-${hour}-${day.dateKey}`"
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

.day-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.day-name {
  font-size: 0.78rem;
  color: #616a76;
}

.day-date {
  font-size: 0.95rem;
  color: #1b2430;
}

.date-muted {
  color: #9ca6b5;
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

.slot-empty {
  background: #fafbfd;
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
