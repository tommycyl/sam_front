import { get } from '@/utils/request'

export function fetchDashboardStats() {
  return get('/dashboard/stats')
}

/** 近期延期风险任务，分页 */
export function fetchDashboardUrgentTasks(params) {
  return get('/dashboard/urgent-tasks', params)
}
