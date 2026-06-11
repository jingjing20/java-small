import request from './request'
import type { DeptRequest, DeptTreeNode } from './types'

export const getDeptTree = () =>
  request.get<unknown, DeptTreeNode[]>('/system/depts/tree')

export const createDept = (data: DeptRequest) =>
  request.post<unknown, number>('/system/depts', data, { successMessage: '新增成功' })

export const updateDept = (id: number, data: DeptRequest) =>
  request.put<unknown, null>(`/system/depts/${id}`, data, { successMessage: '更新成功' })

export const deleteDept = (id: number) =>
  request.delete<unknown, null>(`/system/depts/${id}`, { successMessage: '删除成功' })
