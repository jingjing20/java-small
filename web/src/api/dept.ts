import request from './request'
import type { DeptTreeNode } from './types'

export const getDeptTree = () =>
  request.get<unknown, DeptTreeNode[]>('/system/depts/tree')
