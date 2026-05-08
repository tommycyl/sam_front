import { createRouter, createWebHistory } from 'vue-router'

const StudentList = () => import('@/views/StudentList.vue')
const StudentDetail = () => import('@/views/StudentDetail.vue')
const TeacherList = () => import('@/views/TeacherList.vue')
const TeacherDetail = () => import('@/views/TeacherDetail.vue')
const Settings = () => import('@/views/Settings.vue')

const routes = [
  { path: '/', redirect: '/students' },
  { path: '/students', name: 'StudentList', component: StudentList },
  { path: '/students/:id', name: 'StudentDetail', component: StudentDetail, props: true },
  { path: '/teachers', name: 'TeacherList', component: TeacherList },
  { path: '/teachers/:id', name: 'TeacherDetail', component: TeacherDetail, props: true },
  { path: '/settings', name: 'Settings', component: Settings },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
