import { get, post, put, del } from '@/utils/request'

export function fetchStudentList(params) {
  return get('/students', params)
}

export function fetchStudentDetail(id) {
  return get(`/students/${id}`)
}

export function createStudent(data) {
  return post('/students', data)
}

export function updateStudent(id, data) {
  return put(`/students/${id}`, data)
}

export function deleteStudent(id) {
  return del(`/students/${id}`)
}

export function fetchStudentTasks(id, params) {
  return get(`/students/${id}/tasks`, params)
}

export function updateTaskStatus(taskId, status) {
  return put(`/tasks/${taskId}/status`, { status })
}
