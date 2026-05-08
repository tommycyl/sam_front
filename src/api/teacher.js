import { get, post, put, del } from '@/utils/request'

export function fetchTeacherList(params) {
  return get('/teachers', params)
}

export function fetchTeacherDetail(id) {
  return get(`/teachers/${id}`)
}

export function createTeacher(data) {
  return post('/teachers', data)
}

export function updateTeacher(id, data) {
  return put(`/teachers/${id}`, data)
}

export function deleteTeacher(id) {
  return del(`/teachers/${id}`)
}

export function fetchTeacherStudents(id, params) {
  return get(`/teachers/${id}/students`, params)
}

export function fetchTeacherTasks(id, params) {
  return get(`/teachers/${id}/tasks`, params)
}
