import { formatDateTime } from '../../common/datetime'
import { pageSkip, toPageResult, type PageQuery, type PageResult } from '../../common/page'
import { prisma } from '../../lib/prisma'

export interface SysOperLogResponse {
  id: number
  title: string
  businessType: string
  method: string
  requestMethod: string
  requestUri: string
  operatorName: string
  operatorIp: string
  status: number
  errorMessage: string
  costMillis: number
  createTime: string
}

function toOperLogResponse(log: {
  id: bigint
  title: string | null
  businessType: string | null
  method: string | null
  requestMethod: string | null
  requestUri: string | null
  operatorName: string | null
  operatorIp: string | null
  status: number | null
  errorMessage: string | null
  costMillis: bigint | null
  createTime: Date | null
}): SysOperLogResponse {
  return {
    id: Number(log.id),
    title: log.title ?? '',
    businessType: log.businessType ?? '',
    method: log.method ?? '',
    requestMethod: log.requestMethod ?? '',
    requestUri: log.requestUri ?? '',
    operatorName: log.operatorName ?? '',
    operatorIp: log.operatorIp ?? '',
    status: log.status ?? 0,
    errorMessage: log.errorMessage ?? '',
    costMillis: log.costMillis !== null ? Number(log.costMillis) : 0,
    createTime: formatDateTime(log.createTime),
  }
}

export async function page(query: PageQuery): Promise<PageResult<SysOperLogResponse>> {
  const where = { deleted: 0 }
  const [total, records] = await Promise.all([
    prisma.sysOperLog.count({ where }),
    prisma.sysOperLog.findMany({
      where,
      orderBy: { createTime: 'desc' },
      skip: pageSkip(query.pageNum, query.pageSize),
      take: query.pageSize,
    }),
  ])
  return toPageResult(total, query.pageNum, query.pageSize, records.map(toOperLogResponse))
}
