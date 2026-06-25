import { z } from 'zod'

export interface PageResult<T> {
  total: number
  pageNum: number
  pageSize: number
  records: T[]
}

export const pageQuerySchema = z.object({
  pageNum: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export type PageQuery = z.infer<typeof pageQuerySchema>

export function toPageResult<T>(
  total: number,
  pageNum: number,
  pageSize: number,
  records: T[],
): PageResult<T> {
  return { total, pageNum, pageSize, records }
}

export function pageSkip(pageNum: number, pageSize: number): number {
  return (pageNum - 1) * pageSize
}
