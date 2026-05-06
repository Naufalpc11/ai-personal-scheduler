import { watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from './useAppStore'

export function useRequireAuth() {
  const router = useRouter()
  const { user, token, fetchTasks, state } = useAppStore()

  watchEffect(() => {
    if (!user.value || !token.value) {
      router.replace('/login')
      return
    }

    if (!state.hasLoaded && !state.isLoading) {
      fetchTasks()
    }
  })
}
