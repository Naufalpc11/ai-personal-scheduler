import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from './useAppStore'

export function useRequireAuth() {
  const router = useRouter()
  const { user } = useAppStore()

  watchEffect(() => {
    if (!user.value) {
      router.replace('/login')
    }
  })
}
