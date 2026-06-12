import { formatDateTime } from '../../common/datetime'
import { pageSkip, toPageResult, type PageQuery, type PageResult } from '../../common/page'
import { BusinessException } from '../../common/errors'
import { prisma } from '../../lib/prisma'
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

export async function page(query: PageQuery): Promise<PageResult<SysRoleResponse>> {
  const where = { deleted: 0 }
  const [total, records] = await Promise.all([
    prisma.sysRole.count({ where }),
    prisma.sysRole.findMany({
      where,
      orderBy: { sort: 'asc' },
      skip: pageSkip(query.pageNum, query.pageSize),
      take: query.pageSize,
    }),
  ])
  return toPageResult(total, query.pageNum, query.pageSize, records.map(toRoleResponse))
}

export async function create(request: RoleRequest, operatorId: number | null): Promise<number> {
  await ensureRoleCodeAvailable(request.roleCode, null)
  const now = new Date()
  const role = await prisma.sysRole.create({
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

export async function update(id: number, request: RoleRequest, operatorId: number | null): Promise<void> {
  await requireRole(id)
  await ensureRoleCodeAvailable(request.roleCode, id)
  await prisma.sysRole.update({
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

export async function remove(id: number): Promise<void> {
  const role = await requireRole(id)
  await prisma.sysRole.update({
    where: { id: BigInt(id) },
    data: { roleCode: `${role.roleCode}:${role.id}`, updateTime: new Date() },
  })
  await prisma.sysRoleMenu.deleteMany({ where: { roleId: BigInt(id) } })
  await prisma.sysUserRole.deleteMany({ where: { roleId: BigInt(id) } })
  await prisma.sysRole.update({
    where: { id: BigInt(id) },
    data: { deleted: 1, updateTime: new Date() },
  })
}

export async function getMenuIds(roleId: number): Promise<number[]> {
  await requireRole(roleId)
  const roleMenus = await prisma.sysRoleMenu.findMany({ where: { roleId: BigInt(roleId) } })
  return roleMenus.map((item) => Number(item.menuId))
}

export async function updateMenus(roleId: number, request: RoleMenuUpdateRequest): Promise<void> {
  await requireRole(roleId)
  await prisma.sysRoleMenu.deleteMany({ where: { roleId: BigInt(roleId) } })
  const menuIds = [...new Set(request.menuIds)]
  if (menuIds.length > 0) {
    await prisma.sysRoleMenu.createMany({
      data: menuIds.map((menuId) => ({
        roleId: BigInt(roleId),
        menuId: BigInt(menuId),
      })),
    })
  }
}

async function requireRole(id: number) {
  const role = await prisma.sysRole.findFirst({
    where: { id: BigInt(id), deleted: 0 },
  })
  if (!role) {
    throw new BusinessException('role not found')
  }
  return role
}

async function ensureRoleCodeAvailable(roleCode: string, ignoreId: number | null) {
  const role = await prisma.sysRole.findFirst({
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
