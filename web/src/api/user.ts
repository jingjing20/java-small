import request from './request'
import type {
  PageResult,
  SysUser,
  UserQuery,
  UserCreateRequest,
  UserUpdateRequest,
} from './types'

export const getUsers = (params: UserQuery) =>
  request.get<unknown, PageResult<SysUser>>('/system/users', { params })

export const createUser = (data: UserCreateRequest) =>
  request.post<unknown, number>('/system/users', data)

export const updateUser = (id: number, data: UserUpdateRequest) =>
  request.put<unknown, null>(`/system/users/${id}`, data)

export const deleteUser = (id: number) =>
  request.delete<unknown, null>(`/system/users/${id}`)

export const resetPassword = (id: number, password: string) =>
  request.put<unknown, null>(`/system/users/${id}/password`, { password })
