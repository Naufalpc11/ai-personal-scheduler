<script setup>
import AppSidebar from '../components/AppSidebar.vue'
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="main-content">
      <header class="header-block card">
        <h1>Schedule</h1>
        <p>Halaman ini siap untuk integrasi kalender dan perencanaan jadwal otomatis.</p>
      </header>
    </main>
  </div>
</template>

<style scoped>
.header-block h1 {
  margin: 0 0 8px;
}

.header-block p {
  margin: 0;
  color: #6f7680;
}
</style>
