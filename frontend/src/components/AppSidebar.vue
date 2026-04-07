<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>AI Scheduler</h2>
    </div>

    <nav class="menu">
      <RouterLink to="/" class="menu-item" exact-active-class="active">Dashboard</RouterLink>
      <RouterLink to="/task-manager" class="menu-item" active-class="active">Task Manager</RouterLink>
      <RouterLink to="/schedule" class="menu-item" active-class="active">Schedule</RouterLink>
      <RouterLink to="/ai-insights" class="menu-item" active-class="active">AI Insights</RouterLink>
    </nav>

    <div class="user-profile">
      <div class="avatar">Z</div>
      <div class="user-info">
        <p class="name">Zee</p>
        <p class="role">Admin</p>
      </div>
    </div>
  </aside>
</template>
