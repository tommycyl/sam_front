/** localStorage key，与侧栏退出逻辑一致 */
const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(value) {
  localStorage.setItem(TOKEN_KEY, value)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated() {
  return Boolean(getToken())
}
