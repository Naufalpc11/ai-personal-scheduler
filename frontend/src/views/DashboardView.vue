<script setup>
import AppSidebar from '../components/AppSidebar.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

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
/* MAIN CONTENT */
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

@media (max-width: 960px) {
  .stats-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>