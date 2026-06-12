import { prisma } from '../../lib/prisma'
import { BusinessException, ErrorCode } from '../../common/errors'
import type { LoginUser } from './auth.types'

export async function loadUserByUsername(username: string): Promise<LoginUser | null> {
  const user = await prisma.sysUser.findFirst({
    where: { username, deleted: 0 },
  })
  if (!user) {
    return null
  }

  const permissions = await loadPermissions(user.id)
  return {
    userId: Number(user.id),
    deptId: user.deptId !== null ? Number(user.deptId) : null,
    username: user.username,
    password: user.password,
    status: user.status,
    permissions,
  }
}

export async function loadPermissions(userId: bigint): Promise<Set<string>> {
  const userRoles = await prisma.sysUserRole.findMany({
    where: { userId },
  })

  const roleIds = userRoles.map((item) => item.roleId)
  const permissions = new Set<string>()

  if (roleIds.length === 0) {
    return permissions
  }

  const roles = await prisma.sysRole.findMany({
    where: {
      id: { in: roleIds },
      deleted: 0,
      status: 1,
    },
  })

  for (const role of roles) {
    permissions.add(`ROLE_${role.roleCode}`)
  }

  const roleMenus = await prisma.sysRoleMenu.findMany({
    where: { roleId: { in: roleIds } },
  })

  const menuIds = [...new Set(roleMenus.map((item) => item.menuId))]
  if (menuIds.length === 0) {
    return permissions
  }

  const menus = await prisma.sysMenu.findMany({
    where: {
      id: { in: menuIds },
      deleted: 0,
    },
  })

  for (const menu of menus) {
    if (menu.permission) {
      permissions.add(menu.permission)
    }
  }

  return permissions
}

export function requireCurrentUser(reqUser: LoginUser | undefined): LoginUser {
  if (!reqUser) {
    throw new BusinessException(ErrorCode.UNAUTHORIZED)
  }
  return reqUser
}
