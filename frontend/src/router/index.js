import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TaskManagerView from '../views/TaskManagerView.vue'
import ScheduleView from '../views/ScheduleView.vue'
import AIInsightsView from '../views/AIInsightsView.vue'
import LoginView from '../views/LoginView.vue'
import TaskDetailView from '../views/TaskDetailView.vue'

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
        },
        {
            path: '/task/:taskId',
            name: 'task-detail',
            component: TaskDetailView
        },
        {
            path: '/register',
            name: 'register',
            component: () =>
                import ('../views/RegisterView.vue')
        }
    ]
})

export default router