<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Bot, CheckCircle2, Clock, RotateCcw, Send, Sparkles, User } from 'lucide-vue-next'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAppStore } from '@/composables/useAppStore'
import { useRequireAuth } from '@/composables/useRequireAuth'
import { apiRequest } from '@/utils/api'

useRequireAuth()

const { token } = useAppStore()

const nowObj = new Date()
const TODAY = `${nowObj.getFullYear()}-${String(nowObj.getMonth() + 1).padStart(2, '0')}-${String(nowObj.getDate()).padStart(2, '0')}`

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
    content: 'Halo! 👋 Saya AI Scheduler.\n\nCeritakan rencanamu — meeting, kelas, belajar, atau kegiatan lain — dan saya akan langsung bantu buat jadwalnya.\n\nApa rencanamu hari ini?',
    tasks: [],
    saved: false
  }
])
const inputText = ref('')
const isTyping = ref(false)
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

function mapIsoToTime(iso) {
  if (typeof iso === 'string') {
    const match = iso.match(/T(\d{2}):(\d{2})/)
    if (match) return `${match[1]}:${match[2]}`
  }

  try {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

function calcDurationText(startIso, endIso) {
  try {
    const s = new Date(startIso)
    const e = new Date(endIso)
    const diff = Math.round((e - s) / 60000)
    if (diff <= 0) return '0 menit'
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    if (hours && minutes) return `${hours} jam ${minutes} menit`
    if (hours) return `${hours} jam`
    return `${minutes} menit`
  } catch {
    return '-'
  }
}

function mapIsoToDate(iso) {
  if (typeof iso === 'string') {
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})T/)
    if (match) return match[1]
  }

  try {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return TODAY
  }
}

function mapOutputToTasks(output) {
  if (Array.isArray(output.schedulePlan) && output.schedulePlan.length) {
    return output.schedulePlan.map((item) => ({
      title: item.subtaskTitle || item.reason || 'Task',
      date: mapIsoToDate(item.date || item.startTime),
      startTime: mapIsoToTime(item.startTime),
      endTime: mapIsoToTime(item.endTime),
      duration: calcDurationText(item.startTime, item.endTime),
      category: 'Lainnya',
      color: 'amber',
      selected: true
    }))
  }

  if (Array.isArray(output.subtasks) && output.subtasks.length) {
    return output.subtasks.map((st, idx) => ({
      title: st.title || `Subtask ${idx + 1}`,
      date: TODAY,
      startTime: '09:00',
      endTime: '10:00',
      duration: '1 jam',
      category: 'Lainnya',
      color: 'amber',
      selected: true
    }))
  }

  return []
}

async function scrollToBottom() {
  await nextTick()
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(messages, scrollToBottom, { deep: true })
watch(isTyping, scrollToBottom)

function extractLLM(obj) {
  if (!obj) return null
  if (typeof obj === 'string') {
    try {
      obj = JSON.parse(obj)
    } catch {
      return null
    }
  }

  if (typeof obj !== 'object') return null
  if (Array.isArray(obj.schedulePlan) || Array.isArray(obj.subtasks)) return obj

  for (const key in obj) {
    const found = extractLLM(obj[key])
    if (found) return found
  }

  return null
}

function handleSend(text = inputText.value) {
  const message = text.trim()
  if (!message || isTyping.value) return

  error.value = ''

  const userId = nextId.value++
  const aiId = nextId.value++

  messages.value.push({ id: userId, role: 'user', content: message })
  inputText.value = ''
  isTyping.value = true

  if (!token.value) {
    messages.value.push({ id: aiId, role: 'ai', content: 'Silakan login terlebih dahulu untuk menggunakan fitur AI.', tasks: [], saved: false })
    isTyping.value = false
    return
  }

  ;(async () => {
    try {
      const res = await apiRequest('/ai-execute', {
        method: 'POST',
        token: token.value,
        body: { userRequest: message }
      })

      console.log('=== RAW API RESPONSE ===', res)

      const output = extractLLM(res?.data?.ai?.output || res?.data?.output || res) || {}
      console.log('=== EXTRACTED LLM OUTPUT ===', output)

      const tasks = mapOutputToTasks(output)
      const humanMessage = output?.meta?.humanMessage || output?.meta?.refusalMessage
      const isRefusal = output?.intent === 'out_of_scope'

      messages.value.push({
        id: aiId,
        role: 'ai',
        content: humanMessage || (tasks.length > 0 ? 'Jadwalnya sudah aku simpan ke database.' : 'Sip, apa aja nih aktivitas yang mau aku jadwalkan buat kamu hari ini?'),
        tasks,
        saved: tasks.length > 0 && !isRefusal
      })
    } catch (err) {
      error.value = err?.message || 'Gagal menghubungi layanan AI.'
      messages.value.push({
        id: aiId,
        role: 'ai',
        content: 'Maaf, terjadi kesalahan saat menghubungi layanan AI.',
        tasks: [],
        saved: false
      })
    } finally {
      isTyping.value = false
    }
  })()
}

function handleReset() {
  messages.value = [
    {
      id: 1,
      role: 'ai',
      content: 'Halo! 👋 Saya AI Scheduler.\n\nCeritakan rencanamu — meeting, kelas, belajar, atau kegiatan lain — dan saya akan langsung bantu buat jadwalnya.\n\nApa rencanamu hari ini?',
      tasks: [],
      saved: false
    }
  ]
  inputText.value = ''
  isTyping.value = false
  nextId.value = 2
  inputRef.value?.focus()
}
</script>

<template>
  <MainLayout>
    <div class="mx-auto flex h-[calc(100dvh-150px)] max-w-4xl flex-col overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3 lg:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 shadow-sm">
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
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm" :class="message.role === 'ai' ? 'bg-linear-to-br from-amber-400 to-orange-500' : 'bg-linear-to-br from-blue-400 to-blue-600'">
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
                  class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle2 class="h-3.5 w-3.5 text-white" />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-gray-900">{{ task.title }}</p>
                    <div class="mt-0.5 flex items-center gap-1.5">
                      <Clock class="h-3 w-3 text-gray-400" />
                      <span class="text-xs text-gray-400">{{ task.startTime }} – {{ task.endTime }} · {{ task.duration }}</span>
                    </div>
                  </div>

                  <span class="shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium" :class="categoryColors[task.category] ?? 'bg-gray-100 text-gray-600'">{{ task.category }}</span>
                </div>

                <div class="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 class="h-4 w-4" />
                  Tersimpan ke jadwal!
                </div>
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="flex gap-3">
            <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 shadow-sm">
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
        <p class="mt-2 text-center text-xs text-gray-300">AI kini langsung memakai backend Gemini dan menyimpan jadwal otomatis.</p>
      </div>
    </div>
  </MainLayout>
</template>