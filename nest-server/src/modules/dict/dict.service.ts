import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { formatDateTime } from '../../common/datetime'
import { pageSkip, toPageResult, type PageQuery, type PageResult } from '../../common/page'
import { BusinessException } from '../../common/errors'
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

@Injectable()
export class DictService {
  constructor(private readonly prisma: PrismaService) {}

  async typePage(query: PageQuery): Promise<PageResult<SysDictTypeResponse>> {
    const where = { deleted: 0 }
    const [total, records] = await Promise.all([
      this.prisma.sysDictType.count({ where }),
      this.prisma.sysDictType.findMany({
        where,
        orderBy: { createTime: 'desc' },
        skip: pageSkip(query.pageNum, query.pageSize),
        take: query.pageSize,
      }),
    ])
    return toPageResult(total, query.pageNum, query.pageSize, records.map(toDictTypeResponse))
  }

  async createType(request: DictTypeRequest, operatorId: number | null): Promise<number> {
    await this.ensureDictTypeAvailable(request.dictType, null)
    const now = new Date()
    const type = await this.prisma.sysDictType.create({
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

  async updateType(id: number, request: DictTypeRequest, operatorId: number | null): Promise<void> {
    await this.requireType(id)
    await this.ensureDictTypeAvailable(request.dictType, id)
    await this.prisma.sysDictType.update({
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

  async removeType(id: number): Promise<void> {
    await this.requireType(id)
    const dataCount = await this.prisma.sysDictData.count({
      where: { dictTypeId: BigInt(id), deleted: 0 },
    })
    if (dataCount > 0) {
      throw new BusinessException('dict type has data')
    }
    await this.prisma.sysDictType.update({
      where: { id: BigInt(id) },
      data: { deleted: 1, updateTime: new Date() },
    })
  }

  async dataPage(query: DictDataQuery): Promise<PageResult<SysDictDataResponse>> {
    const where = {
      deleted: 0,
      ...(query.dictTypeId !== undefined ? { dictTypeId: BigInt(query.dictTypeId) } : {}),
    }
    const [total, records] = await Promise.all([
      this.prisma.sysDictData.count({ where }),
      this.prisma.sysDictData.findMany({
        where,
        orderBy: { sort: 'asc' },
        skip: pageSkip(query.pageNum, query.pageSize),
        take: query.pageSize,
      }),
    ])
    return toPageResult(total, query.pageNum, query.pageSize, records.map(toDictDataResponse))
  }

  async createData(request: DictDataRequest, operatorId: number | null): Promise<number> {
    await this.requireType(request.dictTypeId)
    const now = new Date()
    const data = await this.prisma.sysDictData.create({
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

  async updateData(id: number, request: DictDataRequest, operatorId: number | null): Promise<void> {
    const data = await this.requireData(id)
    if (Number(data.dictTypeId) !== request.dictTypeId) {
      throw new BusinessException('dict data type cannot be changed')
    }
    await this.prisma.sysDictData.update({
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

  async removeData(id: number): Promise<void> {
    await this.requireData(id)
    await this.prisma.sysDictData.update({
      where: { id: BigInt(id) },
      data: { deleted: 1, updateTime: new Date() },
    })
  }

  private async requireType(id: number) {
    const type = await this.prisma.sysDictType.findFirst({
      where: { id: BigInt(id), deleted: 0 },
    })
    if (!type) {
      throw new BusinessException('dict type not found')
    }
    return type
  }

  private async requireData(id: number) {
    const data = await this.prisma.sysDictData.findFirst({
      where: { id: BigInt(id), deleted: 0 },
    })
    if (!data) {
      throw new BusinessException('dict data not found')
    }
    return data
  }

  private async ensureDictTypeAvailable(dictType: string, ignoreId: number | null) {
    const existing = await this.prisma.sysDictType.findFirst({
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
}
