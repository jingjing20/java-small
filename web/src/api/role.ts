import request from './request'
import type { PageResult, PageQuery, SysRole, RoleRequest } from './types'

export const getRoles = (params?: PageQuery) =>
  request.get<unknown, PageResult<SysRole>>('/system/roles', { params })

export const createRole = (data: RoleRequest) =>
  request.post<unknown, number>('/system/roles', data)

export const updateRole = (id: number, data: RoleRequest) =>
  request.put<unknown, null>(`/system/roles/${id}`, data)

export const deleteRole = (id: number) =>
  request.delete<unknown, null>(`/system/roles/${id}`)

export const getRoleMenuIds = (id: number) =>
  request.get<unknown, number[]>(`/system/roles/${id}/menus`)

export const updateRoleMenus = (id: number, menuIds: number[]) =>
  request.put<unknown, null>(`/system/roles/${id}/menus`, { menuIds })
