<template>
  <div class="min-h-screen bg-[#EBE7E0] flex flex-col items-center justify-center p-6" style="font-family: sans-serif;">
    
    <div class="text-center mb-8">
      <div class="bg-[#6495ED] rounded-[22px] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200/50 transform hover:scale-105 transition-transform duration-300" style="width: 64px; height: 64px;">
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 36px; height: 36px;" class="text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      <h1 class="text-4xl font-bold text-[#1A2B3C] tracking-tight">AI Scheduler</h1>
      <p class="text-gray-500 mt-2 text-lg">Kelola jadwalmu dengan kecerdasan buatan</p>
    </div>

    <div class="bg-white p-10 md:p-12 shadow-sm w-full max-w-[500px]" style="border-radius: 40px;">
      <h2 class="text-3xl font-bold mb-10 text-[#1A2B3C]">Daftar Akun Baru</h2>
      
      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 ml-1 text-left">Nama Lengkap</label>
          <input type="text" placeholder="Nama Anda" class="w-full px-6 py-4 border border-gray-200 focus:ring-4 focus:ring-blue-100/50 focus:border-[#6495ED] outline-none transition-all duration-300 placeholder:text-gray-300 text-gray-700" style="border-radius: 20px;" required>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 ml-1 text-left">Email</label>
          <input type="email" placeholder="nama@email.com" class="w-full px-6 py-4 border border-gray-200 focus:ring-4 focus:ring-blue-100/50 focus:border-[#6495ED] outline-none transition-all duration-300 placeholder:text-gray-300 text-gray-700" style="border-radius: 20px;" required>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 ml-1 text-left">Password</label>
          <input type="password" placeholder="••••••••" class="w-full px-6 py-4 border border-gray-200 focus:ring-4 focus:ring-blue-100/50 focus:border-[#6495ED] outline-none transition-all duration-300 placeholder:text-gray-300 text-gray-700" style="border-radius: 20px;" required>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2 ml-1 text-left">Konfirmasi Password</label>
          <input type="password" placeholder="••••••••" class="w-full px-6 py-4 border border-gray-200 focus:ring-4 focus:ring-blue-100/50 focus:border-[#6495ED] outline-none transition-all duration-300 placeholder:text-gray-300 text-gray-700" style="border-radius: 20px;" required>
        </div>

        <div class="flex items-center text-sm pt-1">
          <label class="flex items-center text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
            <input type="checkbox" class="mr-3 w-5 h-5 rounded-lg border-gray-300 text-[#6495ED] focus:ring-[#6495ED]" required>
            Saya setuju dengan <a href="#" class="text-[#6495ED] font-extrabold hover:underline ml-1">syarat dan ketentuan</a>
          </label>
        </div>

        <button type="submit" class="w-full bg-[#6495ED] text-white py-4.5 rounded-[20px] font-bold text-lg hover:bg-blue-600 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 mt-4 leading-none h-[64px]" style="border-radius: 20px;">
          Daftar
        </button>
      </form>

      <div class="text-center mt-10">
        <p class="text-gray-500 font-medium">
          Sudah punya akun? 
          <router-link to="/login" class="text-[#6495ED] font-extrabold hover:underline ml-1">Masuk sekarang</router-link>
        </p>
      </div>
    </div>
    
    <footer class="mt-16 text-gray-400 text-sm tracking-wide">
      © 2026 AI Scheduler. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
const handleRegister = () => {
  console.log('Mendaftarkan akun baru...');
  alert('Simulasi: Pendaftaran dikirim! Selanjutnya hubungkan ke API Backend.');
};
</script>