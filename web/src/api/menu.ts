import request from './request'
import type { MenuRequest, MenuTreeNode } from './types'

export const getMenuTree = () =>
  request.get<unknown, MenuTreeNode[]>('/system/menus/tree')

export const createMenu = (data: MenuRequest) =>
  request.post<unknown, number>('/system/menus', data, { successMessage: '新增成功' })

export const updateMenu = (id: number, data: MenuRequest) =>
  request.put<unknown, null>(`/system/menus/${id}`, data, { successMessage: '更新成功' })

export const deleteMenu = (id: number) =>
  request.delete<unknown, null>(`/system/menus/${id}`, { successMessage: '删除成功' })
