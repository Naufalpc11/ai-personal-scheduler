<template>
  <main class="login-page">
    <section class="login-card">
      <h1>Login</h1>
      <p>Halaman autentikasi siap dihubungkan ke backend auth.</p>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top, #f5f2ea 0%, #efece3 45%, #e8e5db 100%);
}

.login-card {
  width: min(440px, 92vw);
  padding: 28px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.login-card h1 {
  margin: 0 0 8px;
}

.login-card p {
  margin: 0;
  color: #6f7680;
}
</style>
