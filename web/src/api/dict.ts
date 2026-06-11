import request from './request'
import type {
  PageResult,
  PageQuery,
  SysDictType,
  DictTypeRequest,
  SysDictData,
  DictDataRequest,
} from './types'

export const getDictTypes = (params?: PageQuery) =>
  request.get<unknown, PageResult<SysDictType>>('/system/dict-types', { params })

export const createDictType = (data: DictTypeRequest) =>
  request.post<unknown, number>('/system/dict-types', data)

export const getDictData = (params?: PageQuery & { dictTypeId?: number }) =>
  request.get<unknown, PageResult<SysDictData>>('/system/dict-data', { params })

export const createDictData = (data: DictDataRequest) =>
  request.post<unknown, number>('/system/dict-data', data)
