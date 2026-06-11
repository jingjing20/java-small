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
  request.post<unknown, number>('/system/dict-types', data, { successMessage: '新增成功' })

export const updateDictType = (id: number, data: DictTypeRequest) =>
  request.put<unknown, null>(`/system/dict-types/${id}`, data, { successMessage: '更新成功' })

export const deleteDictType = (id: number) =>
  request.delete<unknown, null>(`/system/dict-types/${id}`, { successMessage: '删除成功' })

export const getDictData = (params?: PageQuery & { dictTypeId?: number }) =>
  request.get<unknown, PageResult<SysDictData>>('/system/dict-data', { params })

export const createDictData = (data: DictDataRequest) =>
  request.post<unknown, number>('/system/dict-data', data, { successMessage: '新增成功' })

export const updateDictData = (id: number, data: DictDataRequest) =>
  request.put<unknown, null>(`/system/dict-data/${id}`, data, { successMessage: '更新成功' })

export const deleteDictData = (id: number) =>
  request.delete<unknown, null>(`/system/dict-data/${id}`, { successMessage: '删除成功' })
