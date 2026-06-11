import request from './request'
import type {
  PageResult,
  SysUser,
  UserDetail,
  UserQuery,
  UserCreateRequest,
  UserUpdateRequest,
} from './types'

export const getUsers = (params: UserQuery) =>
  request.get<unknown, PageResult<SysUser>>('/system/users', { params })

export const getUserDetail = (id: number) =>
  request.get<unknown, UserDetail>(`/system/users/${id}`)

export const createUser = (data: UserCreateRequest) =>
  request.post<unknown, number>('/system/users', data, { successMessage: '新增成功' })

export const updateUser = (id: number, data: UserUpdateRequest) =>
  request.put<unknown, null>(`/system/users/${id}`, data, { successMessage: '更新成功' })

export const deleteUser = (id: number) =>
  request.delete<unknown, null>(`/system/users/${id}`, { successMessage: '删除成功' })

export const resetPassword = (id: number, password: string) =>
  request.put<unknown, null>(`/system/users/${id}/password`, { password }, { successMessage: '密码重置成功' })
