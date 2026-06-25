import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { ROOT_PARENT_ID } from '../../common/constants'
import { buildTree } from '../../common/tree-utils'
import { BusinessException } from '../../common/errors'
import type { DeptRequest, DeptTreeNode } from './dept.schema'

function toTreeNode(dept: {
  id: bigint
  parentId: bigint
  deptName: string
  sort: number | null
  leader: string | null
  phone: string | null
  status: number
}): DeptTreeNode {
  return {
    id: Number(dept.id),
    parentId: Number(dept.parentId),
    deptName: dept.deptName,
    sort: dept.sort ?? undefined,
    leader: dept.leader ?? undefined,
    phone: dept.phone ?? undefined,
    status: dept.status,
    children: [],
  }
}

@Injectable()
export class DeptService {
  constructor(private readonly prisma: PrismaService) {}

  async tree(): Promise<DeptTreeNode[]> {
    const depts = await this.prisma.sysDept.findMany({ where: { deleted: 0 } })
    const nodes = depts.map(toTreeNode)
    return buildTree(
      nodes,
      (node) => node.id,
      (node) => node.parentId,
      (node) => node.sort,
      (parent, child) => parent.children.push(child),
      ROOT_PARENT_ID,
    )
  }

  async create(request: DeptRequest, operatorId: number | null): Promise<number> {
    const now = new Date()
    const dept = await this.prisma.sysDept.create({
      data: {
        parentId: BigInt(request.parentId),
        deptName: request.deptName,
        sort: request.sort ?? 0,
        leader: request.leader,
        phone: request.phone,
        status: request.status,
        createTime: now,
        updateTime: now,
        createBy: operatorId !== null ? BigInt(operatorId) : null,
        updateBy: operatorId !== null ? BigInt(operatorId) : null,
        deleted: 0,
      },
    })
    return Number(dept.id)
  }

  async update(id: number, request: DeptRequest, operatorId: number | null): Promise<void> {
    await this.requireDept(id)
    if (id === request.parentId) {
      throw new BusinessException('dept cannot be its own parent')
    }
    await this.prisma.sysDept.update({
      where: { id: BigInt(id) },
      data: {
        parentId: BigInt(request.parentId),
        deptName: request.deptName,
        sort: request.sort ?? 0,
        leader: request.leader,
        phone: request.phone,
        status: request.status,
        updateTime: new Date(),
        updateBy: operatorId !== null ? BigInt(operatorId) : null,
      },
    })
  }

  async remove(id: number): Promise<void> {
    await this.requireDept(id)
    const childCount = await this.prisma.sysDept.count({
      where: { parentId: BigInt(id), deleted: 0 },
    })
    if (childCount > 0) {
      throw new BusinessException('dept has children')
    }
    const userCount = await this.prisma.sysUser.count({
      where: { deptId: BigInt(id), deleted: 0 },
    })
    if (userCount > 0) {
      throw new BusinessException('dept has users')
    }
    await this.prisma.sysDept.update({
      where: { id: BigInt(id) },
      data: { deleted: 1, updateTime: new Date() },
    })
  }

  private async requireDept(id: number) {
    const dept = await this.prisma.sysDept.findFirst({
      where: { id: BigInt(id), deleted: 0 },
    })
    if (!dept) {
      throw new BusinessException('dept not found')
    }
    return dept
  }
}
