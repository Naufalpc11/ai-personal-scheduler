import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TaskManagerView from '../views/TaskManagerView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import AIInsightsView from '../views/AIInsightsView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'dashboard',
            component: DashboardView
        },
        {
            path: '/task-manager',
            name: 'task-manager',
            component: TaskManagerView
        },
        {
            path: '/schedule',
            name: 'schedule',
            component: ScheduleView
        },
        {
            path: '/ai-insights',
            name: 'ai-insights',
            component: AIInsightsView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView
        }
    ]
})

export default router