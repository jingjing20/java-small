import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma.service'
import { BusinessException, ErrorCode } from '../../common/errors'
import { LoginUser } from './auth.types'
import { EnvConfig } from '../../config/env'

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loadUserByUsername(username: string): Promise<LoginUser | null> {
    const user = await this.prisma.sysUser.findFirst({
      where: { username, deleted: 0 },
    })
    if (!user) {
      return null
    }

    const permissions = await this.loadPermissions(user.id)
    return {
      userId: Number(user.id),
      deptId: user.deptId !== null ? Number(user.deptId) : null,
      username: user.username,
      password: user.password,
      status: user.status,
      permissions,
    }
  }

  async loadPermissions(userId: bigint): Promise<Set<string>> {
    const userRoles = await this.prisma.sysUserRole.findMany({ where: { userId } })
    const roleIds = userRoles.map((item) => item.roleId)
    const permissions = new Set<string>()

    if (roleIds.length === 0) {
      return permissions
    }

    const roles = await this.prisma.sysRole.findMany({
      where: { id: { in: roleIds }, deleted: 0, status: 1 },
    })

    for (const role of roles) {
      permissions.add(`ROLE_${role.roleCode}`)
    }

    const roleMenus = await this.prisma.sysRoleMenu.findMany({
      where: { roleId: { in: roleIds } },
    })

    const menuIds = [...new Set(roleMenus.map((item) => item.menuId))]
    if (menuIds.length === 0) {
      return permissions
    }

    const menus = await this.prisma.sysMenu.findMany({
      where: { id: { in: menuIds }, deleted: 0 },
    })

    for (const menu of menus) {
      if (menu.permission) {
        permissions.add(menu.permission)
      }
    }

    return permissions
  }

  getUsername(token: string): string {
    const payload = this.jwtService.verify(token, {
      secret: EnvConfig.jwtSecret,
      issuer: EnvConfig.jwtIssuer,
    })
    if (!payload.sub) {
      throw new Error('invalid token')
    }
    return payload.sub as string
  }

  requireCurrentUser(user: LoginUser | undefined): LoginUser {
    if (!user) {
      throw new BusinessException(ErrorCode.UNAUTHORIZED)
    }
    return user
  }
}
