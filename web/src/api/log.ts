import request from './request'
import type { PageResult, PageQuery, SysOperLog } from './types'

export const getOperLogs = (params?: PageQuery) =>
  request.get<unknown, PageResult<SysOperLog>>('/system/operation-logs', { params })
