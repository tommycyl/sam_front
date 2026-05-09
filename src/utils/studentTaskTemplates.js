/** localStorage：与「设置模板」弹窗保存的数据结构一致 */
export const STUDENT_TASK_TEMPLATES_KEY = 'sam.studentTaskTemplates.v1'

/** 未保存过模板时，新增学生下拉的默认项（与模板弹窗初始「标准申请流程」id 对齐） */
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

/** 供新增/编辑学生等处的下拉：{ id, name }[] */
export function getStudentTemplateSelectOptions() {
  const data = loadStudentTaskTemplatesPayload()
  if (data?.templates?.length) {
    return data.templates.map((t) => ({ id: String(t.id), name: String(t.name || t.id) }))
  }
  return [...DEFAULT_TEMPLATE_OPTIONS]
}
