import { get, post, put, del } from '@/utils/request'

/** 拉取所有模板及全局规则：{ templates, rules } */
export function fetchTemplates(config) {
  return get('/templates', undefined, config)
}

/** 批量保存：与「设置模板」弹窗的 payload 完全一致 { rules, templates } */
export function syncTemplates(data) {
  return post('/templates/sync', data)
}

export function fetchTemplate(id) {
  return get(`/templates/${id}`)
}

export function createTemplate(data) {
  return post('/templates', data)
}

export function updateTemplate(id, data) {
  return put(`/templates/${id}`, data)
}

export function deleteTemplate(id) {
  return del(`/templates/${id}`)
}
