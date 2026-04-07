<script setup>
const handleLogin = async () => {
  // TODO: Implement login logic
  console.log('Login handler called');
};
</script>

<template>
  <div class="min-h-screen bg-[#EBE7E0] flex flex-col items-center justify-center p-6" style="font-family: sans-serif;">
    
    <div class="text-center mb-10">
      <div class="bg-[#6495ED] rounded-[20px] flex items-center justify-center mx-auto mb-5 shadow-lg" style="width: 64px; height: 64px;">
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 36px;" class="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-[#1A2B3C]">AI Scheduler</h1>
      <p class="text-gray-500 mt-2 text-lg">Kelola jadwalmu dengan kecerdasan buatan</p>
    </div>

    <div class="bg-white p-10 md:p-12 shadow-sm w-full max-w-[480px]" style="border-radius: 40px;">
      <h2 class="text-3xl font-bold mb-10 text-[#1A2B3C]">Masuk</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input type="email" placeholder="nama@email.com" class="w-full px-6 py-4 border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all" style="border-radius: 20px;">
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input type="password" placeholder="••••••••" class="w-full px-6 py-4 border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition-all" style="border-radius: 20px;">
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center text-gray-500">
            <input type="checkbox" class="mr-2 w-4 h-4"> Ingat saya
          </label>
          <a href="#" class="text-[#6495ED] font-bold">Lupa password?</a>
        </div>

        <button type="submit" class="w-full bg-[#6495ED] text-white py-4 font-bold text-lg hover:bg-blue-600 transition-all shadow-lg" style="border-radius: 20px; margin-top: 20px;">
          Masuk
        </button>
      </form>

      <p class="text-center mt-10 text-gray-500">
        Belum punya akun? 
        <router-link to="/register" class="text-[#6495ED] font-extrabold hover:underline">Daftar sekarang</router-link>
      </p>
    </div>
    
    <footer class="mt-16 text-gray-400 text-sm">
      © 2026 AI Scheduler. All rights reserved.
    </footer>
  </div>
</template>