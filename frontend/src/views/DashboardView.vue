<script setup>
import { RouterLink } from 'vue-router'
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
        <h1>Ringkasan Dasbor</h1>
        <p class="subtitle">Selamat datang, ini ringkasan jadwalmu hari ini.</p>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div>
            <h3>Total Task</h3>
            <p class="stat-number">12</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div>
            <h3>Selesai</h3>
            <p class="stat-number">8</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div>
            <h3>Tertunda</h3>
            <p class="stat-number">4</p>
          </div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-icon">✨</div>
          <div>
            <h3>Efisiensi AI</h3>
            <p class="stat-number">85%</p>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <section class="card focus-section">
          <h3>🎯 Fokus Utama Hari Ini</h3>
          <div class="focus-item">
            <div class="task-info">
              <strong>Selesaikan Frontend AI Scheduler</strong>
              <p>Deadline: 23:59 PM</p>
            </div>
            <span class="status-badge">Sedang Dikerjakan</span>
          </div>
        </section>

        <section class="card insight-section">
          <h3>💡 Rekomendasi AI</h3>
          <ul class="insight-list">
            <li>Berdasarkan pola kerjamu, sebaiknya kerjakan <strong>"Review PR"</strong> pada jam 10:00 pagi.</li>
            <li>Ada waktu kosong 2 jam siang ini, mau digunakan untuk *coding* fitur baru?</li>
          </ul>
          <button class="btn-outline-ai">Terapkan Rekomendasi</button>
        </section>
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
  background-color: #EFECE3; /* Beige background */
}

/* SIDEBAR STYLES (Sama dengan Task Manager) */
.sidebar {
  width: 250px;
  background-color: #1e1e2d;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.logo h2 { font-size: 1.2rem; margin-bottom: 40px; color: #fff; }
.menu { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.menu-item {
  color: #8b8b99;
  text-decoration: none;
  padding: 12px;
  border-radius: 8px;
  transition: 0.3s;
}
.menu-item:hover, .menu-item.active {
  background-color: #4A70A9; /* Biru Tua */
  color: white;
}
.user-profile { display: flex; align-items: center; gap: 12px; border-top: 1px solid #323248; padding-top: 20px; }
.avatar { width: 40px; height: 40px; background-color: #4A70A9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.user-info .name { font-size: 0.9rem; font-weight: bold; }
.user-info .role { font-size: 0.8rem; color: #8b8b99; }

/* MAIN CONTENT */
.main-content { flex: 1; padding: 30px; overflow-y: auto; }
.header { margin-bottom: 30px; }
.header h1 { font-size: 1.8rem; color: #000000; }
.subtitle { color: #666; margin-top: 5px; }

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.stat-card.highlight { background-color: #4A70A9; color: white; }
.stat-card.highlight h3 { color: #e0e0e0; }
.stat-icon { font-size: 2rem; }
.stat-card h3 { font-size: 0.9rem; color: #666; margin-bottom: 5px; }
.stat-number { font-size: 1.5rem; font-weight: bold; }

/* DUAL GRID */
.content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.card h3 { margin-bottom: 20px; color: #000; font-size: 1.2rem; border-bottom: 1px solid #eee; padding-bottom: 10px; }

/* FOCUS ITEM */
.focus-item { background: #f9f9fc; padding: 15px; border-radius: 10px; border-left: 4px solid #4A70A9; display: flex; justify-content: space-between; align-items: center; }
.task-info strong { display: block; color: #000; margin-bottom: 5px; }
.task-info p { color: #888; font-size: 0.85rem; }
.status-badge { background: #8FABD4; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }

/* INSIGHTS */
.insight-list { list-style: none; margin-bottom: 20px; }
.insight-list li { position: relative; padding-left: 20px; margin-bottom: 15px; color: #555; line-height: 1.5; }
.insight-list li::before { content: '✨'; position: absolute; left: 0; top: 0; font-size: 0.9rem; }
.btn-outline-ai { background: transparent; border: 1px solid #4A70A9; color: #4A70A9; padding: 10px 20px; border-radius: 20px; cursor: pointer; font-weight: bold; width: 100%; transition: 0.3s; }
.btn-outline-ai:hover { background: #4A70A9; color: white; }
</style>