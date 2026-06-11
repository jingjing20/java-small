import request from './request'
import type { MenuTreeNode } from './types'

export const getMenuTree = () =>
  request.get<unknown, MenuTreeNode[]>('/system/menus/tree')
