import { fetchTemplates } from '@/api/template'

/** localStorage：仅作为后端不可用时的兜底缓存 */
export const STUDENT_TASK_TEMPLATES_KEY = 'sam.studentTaskTemplates.v1'

/** 后端真正写入前的兜底默认（与默认模板对齐） */
export const DEFAULT_TEMPLATE_OPTIONS = [{ id: 'tpl-1', name: '标准申请流程' }]

/**
 * @returns {{ rules?: object, templates?: Array<{ id: string, name: string, steps?: unknown[] }> } | null}
 */
export function loadStudentTaskTemplatesPayload() {
  try {
    const raw = localStorage.getItem(STUDENT_TASK_TEMPLATES_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.templates) || !data.templates.length) return null
    return data
  } catch {
    return null
  }
}

export function persistStudentTaskTemplatesPayload(payload) {
  try {
    localStorage.setItem(STUDENT_TASK_TEMPLATES_KEY, JSON.stringify(payload))
  } catch {
    /* 忽略配额等错误 */
  }
}

function normalizePayload(payload) {
  if (!payload || typeof payload !== 'object') return null
  const templates = Array.isArray(payload.templates) ? payload.templates : []
  if (!templates.length) return null
  return {
    rules: payload.rules || {},
    templates: templates.map((t) => ({
      id: String(t.id ?? t.code ?? ''),
      name: String(t.name ?? t.id ?? '未命名模板'),
      steps: Array.isArray(t.steps)
        ? t.steps.map((s) => {
            let ownerRoles = []
            if (Array.isArray(s.ownerRoles) && s.ownerRoles.length) {
              ownerRoles = s.ownerRoles.map((x) => String(x).trim()).filter(Boolean)
            } else {
              const raw = String(s.ownerRole ?? 'PM')
              ownerRoles = raw
                .split(/[,|]/)
                .map((x) => x.trim())
                .filter(Boolean)
            }
            return {
              title: String(s.title ?? ''),
              ownerRoles,
              startDays: Number(s.startDays ?? 0),
              endDays: Number(s.endDays ?? 0),
              isLongTerm: Boolean(s.isLongTerm ?? s.is_long_term),
            }
          })
        : [],
    })),
  }
}

/** 从后端拉取最新模板，并落本地缓存；失败时返回本地缓存 */
export async function fetchStudentTaskTemplatesFromServer(config) {
  try {
    const data = await fetchTemplates({
      silent: true,
      loading: false,
      ...(config || {}),
    })
    const norm = normalizePayload(data)
    if (norm) {
      persistStudentTaskTemplatesPayload(norm)
      return norm
    }
  } catch {
    /* swallow，回退到本地 */
  }
  return loadStudentTaskTemplatesPayload()
}

/** 同步获取模板下拉项（不发请求；用于刚打开弹窗时即时渲染） */
export function getStudentTemplateSelectOptions() {
  const data = loadStudentTaskTemplatesPayload()
  if (data?.templates?.length) {
    return data.templates.map((t) => ({ id: String(t.id), name: String(t.name || t.id) }))
  }
  return [...DEFAULT_TEMPLATE_OPTIONS]
}

/** 从后端异步获取模板下拉项 */
export async function fetchStudentTemplateSelectOptions() {
  const data = await fetchStudentTaskTemplatesFromServer()
  if (data?.templates?.length) {
    return data.templates.map((t) => ({ id: String(t.id), name: String(t.name || t.id) }))
  }
  return [...DEFAULT_TEMPLATE_OPTIONS]
}
