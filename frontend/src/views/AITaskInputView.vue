<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Bot, CalendarPlus, CheckCircle2, Clock, RotateCcw, Send, Sparkles, User } from 'lucide-vue-next'
import MainLayout from '@/components/layout/MainLayout.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAppStore } from '@/composables/useAppStore'
import { useRequireAuth } from '@/composables/useRequireAuth'

useRequireAuth()

const { addTask } = useAppStore()

const TODAY = '2026-04-21'
const EXAMPLE_PROMPTS = [
  'Besok jam 9 saya ada kelas AI selama 2 jam',
  'Senin depan meeting client dari pagi sampai siang',
  'Sore ini jam 4 belajar TypeScript 1.5 jam',
  'Jumat jam 14:00 ada review mingguan'
]

const messages = ref([
  {
    id: 1,
    role: 'ai',
    content: 'Halo! 👋 Saya AI Scheduler.\n\nCeritakan rencanamu - meeting, kelas, belajar, atau kegiatan apapun - dan saya akan otomatis membuat jadwal yang optimal untukmu!\n\nApa rencanamu hari ini?',
    tasks: [],
    saved: false
  }
])
const inputText = ref('')
const isTyping = ref(false)
const isSaving = ref(false)
const error = ref('')
const nextId = ref(2)
const scrollAnchor = ref(null)
const inputRef = ref(null)

const hasOnlyIntro = computed(() => messages.value.length === 1 && !isTyping.value)

const suggestionText = computed(() => 'Coba tanya:')

const categoryColors = {
  Meeting: 'bg-emerald-100 text-emerald-700',
  Kelas: 'bg-blue-100 text-blue-700',
  Belajar: 'bg-violet-100 text-violet-700',
  Review: 'bg-purple-100 text-purple-700',
  Personal: 'bg-amber-100 text-amber-700',
  Lainnya: 'bg-gray-100 text-gray-600'
}

function generateAIResponse(prompt) {
  const lower = prompt.toLowerCase()

  if (lower.includes('meeting') || lower.includes('rapat') || lower.includes('client')) {
    return {
      text: `Baik! Aku sudah menganalisis rencanamu tentang "${prompt.length > 50 ? `${prompt.slice(0, 50)}...` : prompt}".\n\nAku sarankan 3 task berikut agar meeting-mu berjalan lancar:`,
      tasks: [
        { title: 'Persiapan Materi Meeting', startTime: '08:00', endTime: '09:00', duration: '1 jam', category: 'Review', color: 'purple', selected: true },
        { title: 'Meeting / Rapat', startTime: '09:00', endTime: '11:00', duration: '2 jam', category: 'Meeting', color: 'green', selected: true },
        { title: 'Follow-up & Notulensi', startTime: '11:30', endTime: '12:00', duration: '30 menit', category: 'Review', color: 'blue', selected: false }
      ]
    }
  }

  if (lower.includes('kelas') || lower.includes('kuliah') || lower.includes('ai')) {
    return {
      text: 'Sip! Berdasarkan info kelasmu, aku siapkan jadwal yang efektif:',
      tasks: [
        { title: 'Sesi Kelas', startTime: '09:00', endTime: '11:00', duration: '2 jam', category: 'Kelas', color: 'blue', selected: true },
        { title: 'Review Catatan Setelah Kelas', startTime: '11:15', endTime: '12:00', duration: '45 menit', category: 'Belajar', color: 'purple', selected: true },
        { title: 'Kerjakan Tugas', startTime: '20:00', endTime: '21:30', duration: '1.5 jam', category: 'Belajar', color: 'amber', selected: false }
      ]
    }
  }

  if (lower.includes('belajar') || lower.includes('study') || lower.includes('typescript') || lower.includes('coding')) {
    return {
      text: 'Semangat belajarnya bagus! Aku buat sesi belajar yang terstruktur:',
      tasks: [
        { title: 'Sesi Belajar / Coding', startTime: '14:00', endTime: '16:00', duration: '2 jam', category: 'Belajar', color: 'blue', selected: true },
        { title: 'Istirahat Aktif (stretching)', startTime: '16:00', endTime: '16:15', duration: '15 menit', category: 'Personal', color: 'green', selected: true },
        { title: 'Review & Rangkuman', startTime: '16:15', endTime: '17:00', duration: '45 menit', category: 'Belajar', color: 'purple', selected: false }
      ]
    }
  }

  if (lower.includes('presentasi') || lower.includes('presentation')) {
    return {
      text: 'Presentasi penting nih! Aku siapkan rundown lengkapnya:',
      tasks: [
        { title: 'Finalisasi Slide Presentasi', startTime: '08:00', endTime: '09:30', duration: '1.5 jam', category: 'Review', color: 'purple', selected: true },
        { title: 'Gladi Resik / Latihan', startTime: '09:30', endTime: '10:00', duration: '30 menit', category: 'Personal', color: 'amber', selected: true },
        { title: 'Presentasi ke Klien', startTime: '10:00', endTime: '12:00', duration: '2 jam', category: 'Meeting', color: 'green', selected: true },
        { title: 'Follow-up Pasca Presentasi', startTime: '13:00', endTime: '13:30', duration: '30 menit', category: 'Review', color: 'blue', selected: false }
      ]
    }
  }

  const shortPrompt = prompt.length > 40 ? `${prompt.slice(0, 40)}...` : prompt
  return {
    text: 'Oke, aku pahami rencanamu! Berikut jadwal yang aku buat untuk kegiatanmu:',
    tasks: [
      { title: shortPrompt, startTime: '09:00', endTime: '11:00', duration: '2 jam', category: 'Lainnya', color: 'amber', selected: true },
      { title: 'Persiapan sebelumnya', startTime: '08:30', endTime: '09:00', duration: '30 menit', category: 'Personal', color: 'pink', selected: false },
      { title: 'Evaluasi & Catatan', startTime: '11:00', endTime: '11:30', duration: '30 menit', category: 'Review', color: 'blue', selected: false }
    ]
  }
}

async function scrollToBottom() {
  await nextTick()
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(messages, scrollToBottom, { deep: true })
watch(isTyping, scrollToBottom)

function handleSend(text = inputText.value) {
  const message = text.trim()
  if (!message || isTyping.value) return

  const userId = nextId.value++
  const aiId = nextId.value++

  messages.value.push({ id: userId, role: 'user', content: message })
  inputText.value = ''
  isTyping.value = true

  const delay = 900 + Math.random() * 500
  window.setTimeout(() => {
    const response = generateAIResponse(message)
    messages.value.push({
      id: aiId,
      role: 'ai',
      content: response.text,
      tasks: response.tasks,
      saved: false
    })
    isTyping.value = false
  }, delay)
}

function toggleTask(messageId, taskIndex) {
  messages.value = messages.value.map((message) => {
    if (message.id !== messageId || !message.tasks) return message

    return {
      ...message,
      tasks: message.tasks.map((task, index) => (
        index === taskIndex ? { ...task, selected: !task.selected } : task
      ))
    }
  })
}

async function saveTasksFromMessage(messageId) {
  const message = messages.value.find((item) => item.id === messageId)
  if (!message?.tasks) return

  const selectedTasks = message.tasks.filter((task) => task.selected)
  if (!selectedTasks.length) return
  error.value = ''
  isSaving.value = true

  try {
    for (const task of selectedTasks) {
      await addTask({
        title: task.title,
        date: TODAY,
        startTime: task.startTime,
        endTime: task.endTime,
        duration: task.duration,
        category: task.category,
        color: task.color,
        description: 'Dibuat oleh AI Scheduler'
      })
    }
  } catch (err) {
    error.value = err?.message || 'Gagal menyimpan task AI.'
    isSaving.value = false
    return
  }

  messages.value = messages.value.map((item) => (
    item.id === messageId ? { ...item, saved: true } : item
  ))

  window.setTimeout(() => {
    messages.value.push({
      id: nextId.value++,
      role: 'ai',
      content: `✅ Berhasil! **${selectedTasks.length} task** telah ditambahkan ke jadwalmu.\n\nApakah ada rencana lain yang ingin saya bantu susun jadwalnya?`,
      tasks: [],
      saved: false
    })
  }, 250)
  isSaving.value = false
}

function handleReset() {
  messages.value = [
    {
      id: 1,
      role: 'ai',
      content: 'Halo! 👋 Saya AI Scheduler.\n\nCeritakan rencanamu - meeting, kelas, belajar, atau kegiatan apapun - dan saya akan otomatis membuat jadwal yang optimal untukmu!\n\nApa rencanamu hari ini?',
      tasks: [],
      saved: false
    }
  ]
  inputText.value = ''
  isTyping.value = false
  nextId.value = 2
  inputRef.value?.focus()
}

function canSave(message) {
  return Boolean(message.tasks?.some((task) => task.selected)) && !message.saved
}
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex h-[calc(100dvh-150px)] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 lg:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
            <Sparkles class="h-5 w-5 text-white" />
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900">AI Scheduler</p>
            <div class="flex items-center gap-1.5">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span class="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>

        <button class="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700" type="button" @click="handleReset">
          <RotateCcw class="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div v-if="error" class="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500 lg:px-6">
        {{ error }}
      </div>

      <div class="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 lg:px-6">
        <div class="space-y-4">
          <div v-for="message in messages" :key="message.id" class="flex gap-3" :class="message.role === 'user' ? 'flex-row-reverse' : 'flex-row'">
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm" :class="message.role === 'ai' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-blue-600'">
              <Bot v-if="message.role === 'ai'" class="h-4 w-4 text-white" />
              <User v-else class="h-4 w-4 text-white" />
            </div>

            <div class="flex max-w-[85%] flex-col gap-2" :class="message.role === 'user' ? 'items-end' : 'items-start'">
              <div class="whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed" :class="message.role === 'user' ? 'rounded-tr-sm bg-blue-500 text-white' : 'rounded-tl-sm border border-gray-100 bg-white text-gray-800 shadow-sm'">
                {{ message.content }}
              </div>

              <div v-if="message.role === 'ai' && message.tasks?.length" class="w-full space-y-2">
                <div
                  v-for="(task, index) in message.tasks"
                  :key="index"
                  class="flex items-center gap-3 rounded-xl border p-3 transition-all"
                  :class="[
                    message.saved ? 'cursor-default border-gray-100 bg-white opacity-75' : task.selected ? 'cursor-pointer border-blue-200 bg-blue-50 hover:bg-blue-100' : 'cursor-pointer border-gray-100 bg-white hover:bg-gray-50'
                  ]"
                  @click="!message.saved && toggleTask(message.id, index)"
                >
                  <div v-if="!message.saved" class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2" :class="task.selected ? 'border-transparent bg-blue-500' : 'border-gray-300'">
                    <CheckCircle2 v-if="task.selected" class="h-3.5 w-3.5 text-white" />
                  </div>
                  <div v-else class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle2 class="h-3.5 w-3.5 text-white" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium" :class="task.selected || message.saved ? 'text-gray-900' : 'text-gray-500'">{{ task.title }}</p>
                    <div class="mt-0.5 flex items-center gap-1.5">
                      <Clock class="h-3 w-3 text-gray-400" />
                      <span class="text-xs text-gray-400">{{ task.startTime }} – {{ task.endTime }} · {{ task.duration }}</span>
                    </div>
                  </div>

                  <span class="shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium" :class="categoryColors[task.category] ?? 'bg-gray-100 text-gray-600'">{{ task.category }}</span>
                </div>

                <button
                  v-if="!message.saved"
                  class="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  :disabled="!canSave(message) || isSaving"
                  @click="saveTasksFromMessage(message.id)"
                >
                  <CalendarPlus v-if="!isSaving" class="h-4 w-4" />
                  <span v-if="!isSaving">Simpan ke Jadwal ({{ message.tasks?.filter((task) => task.selected).length ?? 0 }} task)</span>
                  <span v-else class="inline-flex items-center gap-2">
                    <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </span>
                </button>

                <div v-else class="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 class="h-4 w-4" />
                  Tersimpan ke jadwal!
                </div>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="flex gap-3">
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
              <Bot class="h-4 w-4 text-white" />
            </div>
            <div class="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <span class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 0ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 150ms" />
              <span class="h-2 w-2 animate-bounce rounded-full bg-gray-300" style="animation-delay: 300ms" />
            </div>
          </div>

          <div ref="scrollAnchor" />
        </div>
      </div>

      <div v-if="hasOnlyIntro" class="border-t border-gray-100 bg-white px-4 py-3 lg:px-6">
        <p class="mb-2 text-xs font-medium text-gray-400">💡 {{ suggestionText }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="(prompt, index) in EXAMPLE_PROMPTS"
            :key="index"
            class="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
            type="button"
            @click="handleSend(prompt)"
          >
            {{ prompt }}
          </button>
        </div>
      </div>

      <div class="border-t border-gray-100 bg-white px-4 py-3 lg:px-6">
        <div class="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 transition-all focus-within:border-blue-300 focus-within:bg-white">
          <input
            ref="inputRef"
            v-model="inputText"
            class="flex-1 bg-transparent py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            placeholder="Ceritakan rencanamu..."
            type="text"
            @keyup.enter="handleSend()"
          >
          <button
            class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            :disabled="!inputText.trim() || isTyping"
            @click="handleSend()"
          >
            <Send class="h-4 w-4" />
          </button>
        </div>
        <p class="mt-2 text-center text-xs text-gray-300">AI ini menggunakan simulasi • Tekan Enter untuk kirim</p>
      </div>
    </div>
  </MainLayout>
</template>