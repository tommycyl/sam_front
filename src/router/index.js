import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/utils/auth'

const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const StudentList = () => import('@/views/StudentList.vue')
const StudentDetail = () => import('@/views/StudentDetail.vue')
const TeacherList = () => import('@/views/TeacherList.vue')
const TeacherDetail = () => import('@/views/TeacherDetail.vue')
const Settings = () => import('@/views/Settings.vue')

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { public: true } },
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/students', name: 'StudentList', component: StudentList },
  { path: '/students/:id', name: 'StudentDetail', component: StudentDetail, props: true },
  { path: '/teachers', name: 'TeacherList', component: TeacherList },
  { path: '/teachers/:id', name: 'TeacherDetail', component: TeacherDetail, props: true },
  { path: '/settings', name: 'Settings', component: Settings },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.public) {
    if (to.name === 'Login' && isAuthenticated()) {
      return { path: '/dashboard' }
    }
    return true
  }
  if (!isAuthenticated()) {
    const q = to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : {}
    return { path: '/login', query: q }
  }
  return true
})

export default router
