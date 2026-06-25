import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { formatDateTime } from '../../common/datetime'
import { pageSkip, toPageResult, type PageQuery, type PageResult } from '../../common/page'
import { BusinessException } from '../../common/errors'
import type { RoleMenuUpdateRequest, RoleRequest, SysRoleResponse } from './role.schema'

function toRoleResponse(role: {
  id: bigint
  roleCode: string
  roleName: string
  sort: number | null
  status: number
  remark: string | null
  createTime: Date | null
}): SysRoleResponse {
  return {
    id: Number(role.id),
    roleCode: role.roleCode,
    roleName: role.roleName,
    sort: role.sort ?? 0,
    status: role.status,
    remark: role.remark ?? '',
    createTime: formatDateTime(role.createTime),
  }
}

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async page(query: PageQuery): Promise<PageResult<SysRoleResponse>> {
    const where = { deleted: 0 }
    const [total, records] = await Promise.all([
      this.prisma.sysRole.count({ where }),
      this.prisma.sysRole.findMany({
        where,
        orderBy: { sort: 'asc' },
        skip: pageSkip(query.pageNum, query.pageSize),
        take: query.pageSize,
      }),
    ])
    return toPageResult(total, query.pageNum, query.pageSize, records.map(toRoleResponse))
  }

  async create(request: RoleRequest, operatorId: number | null): Promise<number> {
    await this.ensureRoleCodeAvailable(request.roleCode, null)
    const now = new Date()
    const role = await this.prisma.sysRole.create({
      data: {
        roleCode: request.roleCode,
        roleName: request.roleName,
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
    return Number(role.id)
  }

  async update(id: number, request: RoleRequest, operatorId: number | null): Promise<void> {
    await this.requireRole(id)
    await this.ensureRoleCodeAvailable(request.roleCode, id)
    await this.prisma.sysRole.update({
      where: { id: BigInt(id) },
      data: {
        roleCode: request.roleCode,
        roleName: request.roleName,
        sort: request.sort ?? 0,
        status: request.status,
        remark: request.remark,
        updateTime: new Date(),
        updateBy: operatorId !== null ? BigInt(operatorId) : null,
      },
    })
  }

  async remove(id: number): Promise<void> {
    const role = await this.requireRole(id)
    await this.prisma.sysRole.update({
      where: { id: BigInt(id) },
      data: { roleCode: `${role.roleCode}:${role.id}`, updateTime: new Date() },
    })
    await this.prisma.sysRoleMenu.deleteMany({ where: { roleId: BigInt(id) } })
    await this.prisma.sysUserRole.deleteMany({ where: { roleId: BigInt(id) } })
    await this.prisma.sysRole.update({
      where: { id: BigInt(id) },
      data: { deleted: 1, updateTime: new Date() },
    })
  }

  async getMenuIds(roleId: number): Promise<number[]> {
    await this.requireRole(roleId)
    const roleMenus = await this.prisma.sysRoleMenu.findMany({ where: { roleId: BigInt(roleId) } })
    return roleMenus.map((item) => Number(item.menuId))
  }

  async updateMenus(roleId: number, request: RoleMenuUpdateRequest): Promise<void> {
    await this.requireRole(roleId)
    await this.prisma.sysRoleMenu.deleteMany({ where: { roleId: BigInt(roleId) } })
    const menuIds = [...new Set(request.menuIds)]
    if (menuIds.length > 0) {
      await this.prisma.sysRoleMenu.createMany({
        data: menuIds.map((menuId) => ({
          roleId: BigInt(roleId),
          menuId: BigInt(menuId),
        })),
      })
    }
  }

  private async requireRole(id: number) {
    const role = await this.prisma.sysRole.findFirst({
      where: { id: BigInt(id), deleted: 0 },
    })
    if (!role) {
      throw new BusinessException('role not found')
    }
    return role
  }

  private async ensureRoleCodeAvailable(roleCode: string, ignoreId: number | null) {
    const role = await this.prisma.sysRole.findFirst({
      where: {
        roleCode,
        deleted: 0,
        ...(ignoreId !== null ? { id: { not: BigInt(ignoreId) } } : {}),
      },
    })
    if (role) {
      throw new BusinessException('role code already exists')
    }
  }
}
