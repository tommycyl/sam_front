/** localStorage key，与侧栏退出逻辑一致 */
const TOKEN_KEY = 'token'
const PROFILE_KEY = 'user_profile'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(value) {
  localStorage.setItem(TOKEN_KEY, value)
}

/** 登录后写入的 /auth/profile 数据，避免每个页面重复请求 */
export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setCachedProfile(profile) {
  if (profile == null) {
    localStorage.removeItem(PROFILE_KEY)
    return
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearCachedProfile() {
  localStorage.removeItem(PROFILE_KEY)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  clearCachedProfile()
}

export function isAuthenticated() {
  return Boolean(getToken())
}
