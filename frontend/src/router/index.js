import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TaskManagerView from '../views/TaskManagerView.vue'

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
        }
    ]
})

export default router