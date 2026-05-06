<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BrainCircuit, CalendarCheck, Eye, EyeOff, Lock, Mail, Sparkles, Zap } from 'lucide-vue-next'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAppStore } from '@/composables/useAppStore'

const router = useRouter()
const { login } = useAppStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const isLoading = ref(false)

const features = [
  { icon: BrainCircuit, color: 'text-blue-500', bg: 'bg-blue-50', label: 'AI Cerdas' },
  { icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Jadwal Otomatis' },
  { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Super Cepat' }
]

async function handleLogin() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Email dan password harus diisi.'
    return
  }

  isLoading.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err?.message || 'Login gagal.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Masuk" subtitle="Kelola jadwalmu dengan kecerdasan buatan">
    <template #logo>
      <Sparkles class="h-8 w-8 text-white" />
    </template>

    <p class="mb-4 text-sm text-gray-400">Selamat datang kembali!</p>

    <div class="mb-4 flex items-center justify-center gap-2">
      <div v-for="feature in features" :key="feature.label" :class="`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 ${feature.bg}`">
        <component :is="feature.icon" :class="`h-3.5 w-3.5 ${feature.color}`" />
        <span :class="`text-xs font-medium ${feature.color}`">{{ feature.label }}</span>
      </div>
    </div>

    <div v-if="error" class="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
      {{ error }}
    </div>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <div class="relative">
          <Mail class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="email"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm transition focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="nama@email.com"
            type="email"
          >
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
        <div class="relative">
          <Lock class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-11 text-sm transition focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••"
          >
          <button class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button" @click="showPassword = !showPassword">
            <EyeOff v-if="showPassword" class="h-4 w-4" />
            <Eye v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label class="flex cursor-pointer items-center gap-2">
          <input class="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-400" type="checkbox">
          <span class="text-sm text-gray-600">Ingat saya</span>
        </label>
        <button class="text-sm text-blue-500 hover:text-blue-600 hover:underline" type="button">Lupa password?</button>
      </div>

      <AppButton class-name="w-full py-3" :disabled="isLoading" type="submit">
        <span v-if="!isLoading">Masuk</span>
        <span v-else class="inline-flex items-center gap-2">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Memproses...
        </span>
      </AppButton>
    </form>

    <div class="mt-5 text-center">
      <p class="text-sm text-gray-500">
        Belum punya akun?
        <router-link class="font-semibold text-blue-500 hover:underline" to="/register">Daftar sekarang</router-link>
      </p>
    </div>
  </AuthLayout>
</template>
