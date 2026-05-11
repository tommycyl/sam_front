import { get, post, put, del } from '@/utils/request'

export function fetchStudentList(params) {
  return get('/students', params)
}

export function fetchStudentDetail(id) {
  return get(`/students/${id}`)
}

/** 进入学生详情时：按截止日期将超时未完成任务标为延期，并返回最新详情（与 GET /students/:id 结构一致） */
export function reconcileStudentTaskDeadlines(id) {
  return post(`/students/${id}/reconcile-task-deadlines`)
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

export function createStudentTask(id, data) {
  return post(`/students/${id}/tasks`, data)
}

export function updateTask(taskId, data) {
  return put(`/tasks/${taskId}`, data)
}

export function deleteTask(taskId) {
  return del(`/tasks/${taskId}`)
}

export function updateTaskStatus(taskId, status) {
  return put(`/tasks/${taskId}/status`, { status })
}

/**
 * 学生列表「按任务」筛选：获取当前可用的全部任务名称（多选）
 *
 * 预留接口：GET /students/meta/task-names
 * 建议后端返回（经 request 拦截器解包后的 data）其一：
 * - { list: [{ id: string, name: string }] }
 * - [{ id, name }]
 * - string[]（将同时作为 id 与 name）
 *
 * 调用时可传 { silent: true, loading: false } 避免无后端时全局报错/loading
 */
export function fetchStudentTaskFilterOptions(config) {
  return get('/students/meta/task-names', undefined, config)
}

/**
 * 新增/编辑学生弹窗：可选 PM 列表（与后端角色/人员绑定）
 *
 * 预留接口：GET /students/meta/pm-options
 * 建议返回 data 其一：{ list: [{ id: string, name: string }] }、[{ id, name }]
 *
 * 调用时可传 { silent: true, loading: false } 避免无后端时全局报错/loading
 */
export function fetchStudentFormPmOptions(config) {
  return get('/students/meta/pm-options', undefined, config)
}

/**
 * 新增/编辑学生弹窗：可选 MENTOR 列表
 *
 * 预留接口：GET /students/meta/mentor-options
 * 建议返回 data 同上
 */
export function fetchStudentFormMentorOptions(config) {
  return get('/students/meta/mentor-options', undefined, config)
}

/**
 * 新增/编辑学生弹窗：可选「中台」老师列表
 *
 * 接口：GET /students/meta/midplatform-options
 */
export function fetchStudentFormMidPlatformOptions(config) {
  return get('/students/meta/midplatform-options', undefined, config)
}
