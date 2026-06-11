import request from './request'
import type { PageResult, PageQuery, SysRole, RoleRequest } from './types'

export const getRoles = (params?: PageQuery) =>
  request.get<unknown, PageResult<SysRole>>('/system/roles', { params })

export const createRole = (data: RoleRequest) =>
  request.post<unknown, number>('/system/roles', data, { successMessage: '新增成功' })

export const updateRole = (id: number, data: RoleRequest) =>
  request.put<unknown, null>(`/system/roles/${id}`, data, { successMessage: '更新成功' })

export const deleteRole = (id: number) =>
  request.delete<unknown, null>(`/system/roles/${id}`, { successMessage: '删除成功' })

export const getRoleMenuIds = (id: number) =>
  request.get<unknown, number[]>(`/system/roles/${id}/menus`)

export const updateRoleMenus = (id: number, menuIds: number[]) =>
  request.put<unknown, null>(`/system/roles/${id}/menus`, { menuIds }, { successMessage: '菜单分配成功' })
