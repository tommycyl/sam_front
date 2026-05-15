import { get } from '@/utils/request'

export function fetchDashboardStats() {
  return get('/dashboard/stats')
}
