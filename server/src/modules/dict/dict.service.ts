import { formatDateTime } from '../../common/datetime'
import { pageSkip, toPageResult, type PageQuery, type PageResult } from '../../common/page'
import { BusinessException } from '../../common/errors'
import { prisma } from '../../lib/prisma'
import type {
  DictDataQuery,
  DictDataRequest,
  DictTypeRequest,
  SysDictDataResponse,
  SysDictTypeResponse,
} from './dict.schema'

function toDictTypeResponse(type: {
  id: bigint
  dictName: string
  dictType: string
  status: number
  remark: string | null
  createTime: Date | null
}): SysDictTypeResponse {
  return {
    id: Number(type.id),
    dictName: type.dictName,
    dictType: type.dictType,
    status: type.status,
    remark: type.remark ?? '',
    createTime: formatDateTime(type.createTime),
  }
}

function toDictDataResponse(data: {
  id: bigint
  dictTypeId: bigint
  dictLabel: string
  dictValue: string
  sort: number | null
  status: number
  remark: string | null
  createTime: Date | null
}): SysDictDataResponse {
  return {
    id: Number(data.id),
    dictTypeId: Number(data.dictTypeId),
    dictLabel: data.dictLabel,
    dictValue: data.dictValue,
    sort: data.sort ?? 0,
    status: data.status,
    remark: data.remark ?? '',
    createTime: formatDateTime(data.createTime),
  }
}

export async function typePage(query: PageQuery): Promise<PageResult<SysDictTypeResponse>> {
  const where = { deleted: 0 }
  const [total, records] = await Promise.all([
    prisma.sysDictType.count({ where }),
    prisma.sysDictType.findMany({
      where,
      orderBy: { createTime: 'desc' },
      skip: pageSkip(query.pageNum, query.pageSize),
      take: query.pageSize,
    }),
  ])
  return toPageResult(total, query.pageNum, query.pageSize, records.map(toDictTypeResponse))
}

export async function createType(request: DictTypeRequest, operatorId: number | null): Promise<number> {
  await ensureDictTypeAvailable(request.dictType, null)
  const now = new Date()
  const type = await prisma.sysDictType.create({
    data: {
      dictName: request.dictName,
      dictType: request.dictType,
      status: request.status,
      remark: request.remark,
      createTime: now,
      updateTime: now,
      createBy: operatorId !== null ? BigInt(operatorId) : null,
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
      deleted: 0,
    },
  })
  return Number(type.id)
}

export async function updateType(id: number, request: DictTypeRequest, operatorId: number | null): Promise<void> {
  await requireType(id)
  await ensureDictTypeAvailable(request.dictType, id)
  await prisma.sysDictType.update({
    where: { id: BigInt(id) },
    data: {
      dictName: request.dictName,
      dictType: request.dictType,
      status: request.status,
      remark: request.remark,
      updateTime: new Date(),
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
    },
  })
}

export async function removeType(id: number): Promise<void> {
  await requireType(id)
  const dataCount = await prisma.sysDictData.count({
    where: { dictTypeId: BigInt(id), deleted: 0 },
  })
  if (dataCount > 0) {
    throw new BusinessException('dict type has data')
  }
  await prisma.sysDictType.update({
    where: { id: BigInt(id) },
    data: { deleted: 1, updateTime: new Date() },
  })
}

export async function dataPage(query: DictDataQuery): Promise<PageResult<SysDictDataResponse>> {
  const where = {
    deleted: 0,
    ...(query.dictTypeId !== undefined ? { dictTypeId: BigInt(query.dictTypeId) } : {}),
  }
  const [total, records] = await Promise.all([
    prisma.sysDictData.count({ where }),
    prisma.sysDictData.findMany({
      where,
      orderBy: { sort: 'asc' },
      skip: pageSkip(query.pageNum, query.pageSize),
      take: query.pageSize,
    }),
  ])
  return toPageResult(total, query.pageNum, query.pageSize, records.map(toDictDataResponse))
}

export async function createData(request: DictDataRequest, operatorId: number | null): Promise<number> {
  await requireType(request.dictTypeId)
  const now = new Date()
  const data = await prisma.sysDictData.create({
    data: {
      dictTypeId: BigInt(request.dictTypeId),
      dictLabel: request.dictLabel,
      dictValue: request.dictValue,
      sort: request.sort ?? 0,
      status: request.status,
      remark: request.remark,
      createTime: now,
      updateTime: now,
      createBy: operatorId !== null ? BigInt(operatorId) : null,
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
      deleted: 0,
    },
  })
  return Number(data.id)
}

export async function updateData(id: number, request: DictDataRequest, operatorId: number | null): Promise<void> {
  const data = await requireData(id)
  if (Number(data.dictTypeId) !== request.dictTypeId) {
    throw new BusinessException('dict data type cannot be changed')
  }
  await prisma.sysDictData.update({
    where: { id: BigInt(id) },
    data: {
      dictLabel: request.dictLabel,
      dictValue: request.dictValue,
      sort: request.sort ?? 0,
      status: request.status,
      remark: request.remark,
      updateTime: new Date(),
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
    },
  })
}

export async function removeData(id: number): Promise<void> {
  await requireData(id)
  await prisma.sysDictData.update({
    where: { id: BigInt(id) },
    data: { deleted: 1, updateTime: new Date() },
  })
}

async function requireType(id: number) {
  const type = await prisma.sysDictType.findFirst({
    where: { id: BigInt(id), deleted: 0 },
  })
  if (!type) {
    throw new BusinessException('dict type not found')
  }
  return type
}

async function requireData(id: number) {
  const data = await prisma.sysDictData.findFirst({
    where: { id: BigInt(id), deleted: 0 },
  })
  if (!data) {
    throw new BusinessException('dict data not found')
  }
  return data
}

async function ensureDictTypeAvailable(dictType: string, ignoreId: number | null) {
  const existing = await prisma.sysDictType.findFirst({
    where: {
      dictType,
      deleted: 0,
      ...(ignoreId !== null ? { id: { not: BigInt(ignoreId) } } : {}),
    },
  })
  if (existing) {
    throw new BusinessException('dict type already exists')
  }
}
