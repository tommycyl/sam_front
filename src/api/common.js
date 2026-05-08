import { get, post, upload } from '@/utils/request'

export function login(data) {
  return post('/auth/login', data)
}

export function logout() {
  return post('/auth/logout')
}

export function getProfile() {
  return get('/auth/profile')
}

export function uploadFile(file, extra = {}) {
  return upload('/common/upload', file, extra)
}

export function getDictionary(type) {
  return get('/common/dict', { type })
}
