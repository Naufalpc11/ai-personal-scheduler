<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const taskName = ref('')
const taskDate = ref('')
const taskTime = ref('')
</script>

<template>
  <div class="dashboard-container">
    <aside class="sidebar">
      <div class="logo">
        <h2>AI Scheduler</h2>
      </div>
      <nav class="menu">
  <RouterLink to="/" class="menu-item" exact-active-class="active">Dashboard</RouterLink>
  
  <RouterLink to="/task-manager" class="menu-item" active-class="active">Task Manager</RouterLink>
  <a href="#" class="menu-item">Schedule</a>
  <a href="#" class="menu-item">AI Insights</a>
</nav>
      <div class="user-profile">
        <div class="avatar">Z</div>
        <div class="user-info">
          <p class="name">Zee</p>
          <p class="role">Admin</p>
        </div>
      </div>
    </aside>

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
              <h3>April 2026</h3>
              <div class="cal-nav">
                <button>&lt;</button>
                <button>&gt;</button>
              </div>
            </div>
            <div class="calendar-grid">
              <div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div><div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div><div class="cal-day-name">Su</div>
              <span v-for="n in 30" :key="n" class="cal-day" :class="{'active-day': n === 14}">{{ n }}</span>
            </div>
          </section>

          <section class="card schedule-section">
            <h3>Jadwal Hari Ini</h3>
            <div class="schedule-item">
              <div class="task-info">
                <strong>Review PR Github</strong>
                <p>09:00 AM</p>
              </div>
              <button class="btn-action">Mulai</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* RESET & FONT BASE */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #EFECE3;
}

.sidebar {
  width: 250px;
  background-color: #1e1e2d;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.logo h2 {
  font-size: 1.2rem;
  margin-bottom: 40px;
  color: #fff;
}
.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-item {
  color: #8b8b99;
  text-decoration: none;
  padding: 12px;
  border-radius: 8px;
  transition: 0.3s;
}
.menu-item:hover, .menu-item.active {
  background-color: #4A70A9;
  color: white;
}
.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #323248;
  padding-top: 20px;
}
.avatar {
  width: 40px;
  height: 40px;
  background-color: #4A70A9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.user-info .name { font-size: 0.9rem; font-weight: bold; }
.user-info .role { font-size: 0.8rem; color: #8b8b99; }


.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}
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
  border-radius: 5px;
}

.cal-day:hover { background: #8FABD4; color: white; cursor: pointer; }
.active-day { background-color: #4A70A9; color: white; border-radius: 5px; }
</style>