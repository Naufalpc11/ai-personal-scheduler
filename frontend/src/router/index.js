import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import TaskManagerView from '@/views/TaskManagerView.vue'
import ScheduleView from '@/views/ScheduleView.vue'
import AITaskInputView from '@/views/AITaskInputView.vue'
import TaskDetailView from '@/views/TaskDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/task-manager', name: 'task-manager', component: TaskManagerView },
    { path: '/schedule', name: 'schedule', component: ScheduleView },
    { path: '/ai-generate', name: 'ai-generate', component: AITaskInputView },
    { path: '/ai-insights', redirect: '/ai-generate' },
    { path: '/task/:taskId', name: 'task-detail', component: TaskDetailView }
  ]
})

export default router
