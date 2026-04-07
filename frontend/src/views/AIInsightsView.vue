<script setup>
import { ref } from 'vue'
import AppSidebar from '../components/AppSidebar.vue'

const inputText = ref('')
const isGenerated = ref(false)

const generatedTasks = [
  { id: 1, title: 'Persiapan meeting', completed: false },
  { id: 2, title: 'Review dokumen', completed: false },
  { id: 3, title: 'Follow up email', completed: false }
]

const schedulePreview = [
  { time: '09:00 - 10:30', task: 'Persiapan meeting', category: 'blue' },
  { time: '10:30 - 11:30', task: 'Review dokumen', category: 'purple' },
  { time: '11:30 - 12:00', task: 'Follow up email', category: 'green' }
]

function handleGenerate() {
  if (inputText.value.trim()) {
    isGenerated.value = true
  }
}

function scheduleClass(category) {
  if (category === 'purple') {
    return 'preview-purple'
  }
  if (category === 'green') {
    return 'preview-green'
  }
  return 'preview-blue'
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="main-content">
      <section class="ai-page">
        <header class="page-header">
          <h1>Generate Task dengan AI</h1>
          <p>Biarkan AI membantu mengatur jadwalmu secara otomatis</p>
        </header>

        <section class="card input-card">
          <div class="section-title">
            <span class="sparkle">✦</span>
            <h2>Input Natural Language</h2>
          </div>

          <div class="input-stack">
            <textarea
              v-model="inputText"
              placeholder="Contoh: Besok jam 9 saya ada urusan 3 jam"
            ></textarea>

            <button class="generate-btn" @click="handleGenerate">
              <span>✦</span>
              <span>Generate Schedule</span>
            </button>
          </div>
        </section>

        <section v-if="isGenerated" class="output-grid">
          <article class="card output-card">
            <h3>Task Breakdown</h3>
            <label v-for="task in generatedTasks" :key="task.id" class="task-item">
              <input type="checkbox" :checked="task.completed" readonly />
              <span>{{ task.title }}</span>
            </label>
          </article>

          <article class="card output-card">
            <h3>Preview Jadwal</h3>

            <div class="preview-list">
              <div
                v-for="item in schedulePreview"
                :key="`${item.time}-${item.task}`"
                class="preview-item"
                :class="scheduleClass(item.category)"
              >
                <p class="preview-time">{{ item.time }}</p>
                <p class="preview-task">{{ item.task }}</p>
              </div>
            </div>

            <button class="save-btn">Konfirmasi &amp; Simpan</button>
          </article>
        </section>

        <section class="sample-card">
          <h3>Contoh Input:</h3>
          <ul>
            <li>"Besok jam 9 saya ada urusan 3 jam"</li>
            <li>"Senin depan meeting client dari pagi sampai siang"</li>
            <li>"Setiap hari Jumat jam 2 sore ada review mingguan"</li>
          </ul>
        </section>
      </section>
    </main>
  </div>
</template>

<style scoped>
.ai-page {
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.page-header p {
  margin: 0;
  color: var(--color-muted);
}

.input-card {
  padding: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.sparkle {
  color: var(--color-primary);
  font-size: 1.2rem;
}

.section-title h2 {
  margin: 0;
  font-size: 1.2rem;
}

.input-stack {
  display: grid;
  gap: 12px;
}

textarea {
  width: 100%;
  min-height: 128px;
  border: 1px solid #e2e6ed;
  border-radius: 12px;
  padding: 12px 14px;
  resize: vertical;
  outline: none;
}

textarea:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 112, 169, 0.2);
}

.generate-btn {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 12px 14px;
  color: #fff;
  background: var(--color-primary);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.generate-btn:hover {
  background: #3f6397;
}

.output-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.output-card {
  display: grid;
  gap: 10px;
}

.output-card h3 {
  margin: 0 0 8px;
}

.task-item {
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid #edf0f4;
  border-radius: 12px;
  padding: 10px;
  background: #fafbfd;
}

.task-item input {
  accent-color: var(--color-primary);
}

.preview-list {
  display: grid;
  gap: 10px;
}

.preview-item {
  border-left: 4px solid;
  border-radius: 10px;
  padding: 10px 12px;
}

.preview-time {
  margin: 0 0 4px;
  color: #5f6875;
  font-size: 0.85rem;
}

.preview-task {
  margin: 0;
  font-weight: 700;
}

.preview-blue {
  background: #ecf4ff;
  border-left-color: #5b8dbe;
}

.preview-purple {
  background: #f4efff;
  border-left-color: #8d74d6;
}

.preview-green {
  background: #e9f9f1;
  border-left-color: #4bb679;
}

.save-btn {
  margin-top: 4px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 11px 14px;
  background: #37a95c;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  background: #2f944f;
}

.sample-card {
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid #d7e6ff;
  background: #eef5ff;
}

.sample-card h3 {
  margin: 0 0 10px;
}

.sample-card ul {
  margin: 0;
  padding-left: 18px;
  color: #3e4d66;
  display: grid;
  gap: 8px;
}

@media (max-width: 960px) {
  .output-grid {
    grid-template-columns: 1fr;
  }
}
</style>
