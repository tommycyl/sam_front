import axios from 'axios'
import { reactive, ref } from 'vue'

/**
 * 全局 loading 计数 + Toast 消息状态
 * 用 reactive / ref 暴露给 App.vue，可在任意组件直接使用
 */
export const globalLoading = ref(false)
export const globalMessage = reactive({
  show: false,
  type: 'info', // 'info' | 'success' | 'error' | 'warning'
  text: '',
  _timer: null,
})

let pendingCount = 0
function startLoading() {
  pendingCount++
  globalLoading.value = true
}
function endLoading() {
  pendingCount = Math.max(0, pendingCount - 1)
  if (pendingCount === 0) globalLoading.value = false
}

/**
 * 全局消息提示
 */
export function showMessage(text, type = 'info', duration = 2400) {
  if (globalMessage._timer) clearTimeout(globalMessage._timer)
  globalMessage.text = text
  globalMessage.type = type
  globalMessage.show = true
  globalMessage._timer = setTimeout(() => {
    globalMessage.show = false
  }, duration)
}

/**
 * 创建 axios 实例
 */
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
})

/**
 * 请求拦截：自动注入 token、控制全局 loading
 */
service.interceptors.request.use(
  (config) => {
    if (config.loading !== false) startLoading()

    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    endLoading()
    return Promise.reject(error)
  },
)

/**
 * 响应拦截：统一返回业务数据；统一错误提示
 * 约定后端返回结构: { code: number, message: string, data: any }
 *   - code === 0 / 200 视为成功
 *   - 其它 code 视为业务错误，弹出 message 并 reject
 */
service.interceptors.response.use(
  (response) => {
    if (response.config.loading !== false) endLoading()

    const res = response.data
    // 非 JSON（如二进制下载）直接返回原始 response
    if (response.config.responseType === 'blob') return response

    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 0 || res.code === 200) {
        return res.data
      }
      const msg = res.message || `请求失败 (code: ${res.code})`
      if (response.config.silent !== true) showMessage(msg, 'error')

      if (res.code === 401 || res.code === 403) {
        localStorage.removeItem('token')
      }
      return Promise.reject(new Error(msg))
    }

    return res
  },
  (error) => {
    endLoading()

    let msg = '网络异常，请稍后重试'
    if (error.response) {
      const status = error.response.status
      if (status === 401) msg = '未登录或登录已失效'
      else if (status === 403) msg = '无权限访问该资源'
      else if (status === 404) msg = '请求资源不存在'
      else if (status >= 500) msg = '服务器异常，请稍后重试'
      else msg = error.response.data?.message || `请求失败 (${status})`
    } else if (error.code === 'ECONNABORTED') {
      msg = '请求超时'
    }

    if (error.config?.silent !== true) showMessage(msg, 'error')
    return Promise.reject(error)
  },
)

/**
 * 简易封装 GET / POST / PUT / DELETE / 上传 / 下载
 */
export function get(url, params, config = {}) {
  return service.get(url, { params, ...config })
}

export function post(url, data, config = {}) {
  return service.post(url, data, config)
}

export function put(url, data, config = {}) {
  return service.put(url, data, config)
}

export function del(url, config = {}) {
  return service.delete(url, config)
}

export function upload(url, file, extraData = {}, config = {}) {
  const form = new FormData()
  form.append('file', file)
  Object.entries(extraData).forEach(([k, v]) => form.append(k, v))
  return service.post(url, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  })
}

export async function download(url, params, filename = 'download') {
  const res = await service.get(url, {
    params,
    responseType: 'blob',
    loading: false,
  })
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export default service
