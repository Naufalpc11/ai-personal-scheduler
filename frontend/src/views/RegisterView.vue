<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-vue-next'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAppStore } from '@/composables/useAppStore'

const router = useRouter()
const { register } = useAppStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Password dan konfirmasi password tidak cocok.'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password minimal 6 karakter.'
    return
  }

  try {
    await register(name.value, email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err?.message || 'Register gagal.'
  }
}
</script>

<template>
  <AuthLayout title="Daftar Akun Baru" subtitle="Buat akun dan mulai kelola jadwalmu">
    <template #logo>
      <Sparkles class="h-8 w-8 text-white" />
    </template>

    <p class="mb-5 text-sm text-gray-400">Gratis selamanya!</p>

    <div v-if="error" class="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
      {{ error }}
    </div>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <div class="relative">
          <User class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input v-model="name" class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Nama kamu" type="text">
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <div class="relative">
          <Mail class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input v-model="email" class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="nama@email.com" type="email">
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
        <div class="relative">
          <Lock class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input v-model="password" :type="showPassword ? 'text' : 'password'" class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Min. 6 karakter">
          <button class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button" @click="showPassword = !showPassword">
            <EyeOff v-if="showPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Konfirmasi Password</label>
        <div class="relative">
          <Lock class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Ulangi password">
        </div>
      </div>

      <label class="flex cursor-pointer items-start gap-2.5">
        <input class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400" required type="checkbox">
        <span class="text-sm text-gray-600">Saya setuju dengan <span class="text-blue-500">syarat dan ketentuan</span></span>
      </label>

      <AppButton class-name="w-full py-3" type="submit">Daftar Sekarang</AppButton>
    </form>

    <div class="mt-5 text-center">
      <p class="text-sm text-gray-500">
        Sudah punya akun?
        <router-link class="font-semibold text-blue-500 hover:underline" to="/login">Masuk sekarang</router-link>
      </p>
    </div>
  </AuthLayout>
</template>
