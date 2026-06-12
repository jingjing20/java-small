import bcrypt from 'bcryptjs'
import { pageSkip, toPageResult, type PageResult } from '../../common/page'
import { BusinessException } from '../../common/errors'
import { prisma } from '../../lib/prisma'
import type {
  PasswordResetRequest,
  UserCreateRequest,
  UserDetailResponse,
  UserQuery,
  UserUpdateRequest,
} from './user.schema'

function toUserResponse(
  user: {
    id: bigint
    deptId: bigint | null
    username: string
    nickname: string
    email: string | null
    phone: string | null
    status: number
    remark: string | null
  },
  roleIds: number[] | null,
): UserDetailResponse {
  return {
    id: Number(user.id),
    deptId: user.deptId !== null ? Number(user.deptId) : null,
    username: user.username,
    nickname: user.nickname,
    email: user.email ?? '',
    phone: user.phone ?? '',
    status: user.status,
    remark: user.remark ?? '',
    roleIds,
  }
}

export async function page(query: UserQuery): Promise<PageResult<UserDetailResponse>> {
  const where = {
    deleted: 0,
    ...(query.username ? { username: { contains: query.username } } : {}),
    ...(query.phone ? { phone: { contains: query.phone } } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
  }

  const [total, records] = await Promise.all([
    prisma.sysUser.count({ where }),
    prisma.sysUser.findMany({
      where,
      orderBy: { createTime: 'desc' },
      skip: pageSkip(query.pageNum, query.pageSize),
      take: query.pageSize,
    }),
  ])

  return toPageResult(
    total,
    query.pageNum,
    query.pageSize,
    records.map((user) => toUserResponse(user, null)),
  )
}

export async function getDetail(id: number): Promise<UserDetailResponse> {
  const user = await requireUser(id)
  const userRoles = await prisma.sysUserRole.findMany({ where: { userId: BigInt(id) } })
  const roleIds = userRoles.map((item) => Number(item.roleId))
  return toUserResponse(user, roleIds)
}

export async function create(request: UserCreateRequest, operatorId: number | null): Promise<number> {
  await ensureUsernameAvailable(request.username, null)
  const now = new Date()
  const user = await prisma.sysUser.create({
    data: {
      deptId: request.deptId !== undefined ? BigInt(request.deptId) : null,
      username: request.username,
      nickname: request.nickname,
      password: bcrypt.hashSync(request.password, 10),
      email: request.email || null,
      phone: request.phone || null,
      status: request.status,
      remark: request.remark,
      createTime: now,
      updateTime: now,
      createBy: operatorId !== null ? BigInt(operatorId) : null,
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
      deleted: 0,
    },
  })
  await replaceRoles(Number(user.id), request.roleIds)
  return Number(user.id)
}

export async function update(id: number, request: UserUpdateRequest, operatorId: number | null): Promise<void> {
  await requireUser(id)
  await prisma.sysUser.update({
    where: { id: BigInt(id) },
    data: {
      deptId: request.deptId !== undefined ? BigInt(request.deptId) : null,
      nickname: request.nickname,
      email: request.email || null,
      phone: request.phone || null,
      status: request.status,
      remark: request.remark,
      updateTime: new Date(),
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
    },
  })
  await replaceRoles(id, request.roleIds)
}

export async function remove(id: number): Promise<void> {
  const user = await requireUser(id)
  await prisma.sysUser.update({
    where: { id: BigInt(id) },
    data: { username: `${user.username}:${user.id}`, updateTime: new Date() },
  })
  await prisma.sysUserRole.deleteMany({ where: { userId: BigInt(id) } })
  await prisma.sysUser.update({
    where: { id: BigInt(id) },
    data: { deleted: 1, updateTime: new Date() },
  })
}

export async function resetPassword(id: number, request: PasswordResetRequest): Promise<void> {
  await requireUser(id)
  await prisma.sysUser.update({
    where: { id: BigInt(id) },
    data: {
      password: bcrypt.hashSync(request.password, 10),
      updateTime: new Date(),
    },
  })
}

async function replaceRoles(userId: number, roleIds: number[] | undefined) {
  await prisma.sysUserRole.deleteMany({ where: { userId: BigInt(userId) } })
  if (!roleIds || roleIds.length === 0) {
    return
  }
  const uniqueRoleIds = [...new Set(roleIds)]
  await prisma.sysUserRole.createMany({
    data: uniqueRoleIds.map((roleId) => ({
      userId: BigInt(userId),
      roleId: BigInt(roleId),
    })),
  })
}

async function requireUser(id: number) {
  const user = await prisma.sysUser.findFirst({
    where: { id: BigInt(id), deleted: 0 },
  })
  if (!user) {
    throw new BusinessException('user not found')
  }
  return user
}

async function ensureUsernameAvailable(username: string, ignoreId: number | null) {
  const user = await prisma.sysUser.findFirst({
    where: {
      username,
      deleted: 0,
      ...(ignoreId !== null ? { id: { not: BigInt(ignoreId) } } : {}),
    },
  })
  if (user) {
    throw new BusinessException('username already exists')
  }
}
