import { z } from 'zod'
import { pageQuerySchema } from '../../common/page'

export const dictTypeRequestSchema = z.object({
  dictName: z.string().min(1),
  dictType: z.string().min(1),
  status: z.number(),
  remark: z.string().optional(),
})

export const dictDataRequestSchema = z.object({
  dictTypeId: z.number(),
  dictLabel: z.string().min(1),
  dictValue: z.string().min(1),
  sort: z.number().optional(),
  status: z.number(),
  remark: z.string().optional(),
})

export const dictDataQuerySchema = pageQuerySchema.extend({
  dictTypeId: z.coerce.number().optional(),
})

export type DictTypeRequest = z.infer<typeof dictTypeRequestSchema>
export type DictDataRequest = z.infer<typeof dictDataRequestSchema>
export type DictDataQuery = z.infer<typeof dictDataQuerySchema>

export interface SysDictTypeResponse {
  id: number
  dictName: string
  dictType: string
  status: number
  remark: string
  createTime: string
}

export interface SysDictDataResponse {
  id: number
  dictTypeId: number
  dictLabel: string
  dictValue: string
  sort: number
  status: number
  remark: string
  createTime: string
}
