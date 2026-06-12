import { ROOT_PARENT_ID } from '../../common/constants'
import { buildTree } from '../../common/tree-utils'
import { BusinessException } from '../../common/errors'
import { prisma } from '../../lib/prisma'
import type { MenuRequest, MenuTreeNode } from './menu.schema'

function toTreeNode(menu: {
  id: bigint
  parentId: bigint
  menuName: string
  menuType: string
  path: string | null
  component: string | null
  permission: string | null
  icon: string | null
  sort: number | null
  visible: number
  status: number
}): MenuTreeNode {
  return {
    id: Number(menu.id),
    parentId: Number(menu.parentId),
    menuName: menu.menuName,
    menuType: menu.menuType,
    path: menu.path ?? undefined,
    component: menu.component ?? undefined,
    permission: menu.permission ?? undefined,
    icon: menu.icon ?? undefined,
    sort: menu.sort ?? undefined,
    visible: menu.visible,
    status: menu.status,
    children: [],
  }
}

function validateMenuRequest(request: MenuRequest) {
  if (request.menuType === 'B' && !request.permission) {
    throw new BusinessException('button menu requires permission')
  }
  if (request.menuType === 'C' && !request.path) {
    throw new BusinessException('page menu requires path')
  }
}

export async function tree(): Promise<MenuTreeNode[]> {
  const menus = await prisma.sysMenu.findMany({ where: { deleted: 0 } })
  const nodes = menus.map(toTreeNode)
  return buildTree(
    nodes,
    (node) => node.id,
    (node) => node.parentId,
    (node) => node.sort,
    (parent, child) => parent.children.push(child),
    ROOT_PARENT_ID,
  )
}

export async function create(request: MenuRequest, operatorId: number | null): Promise<number> {
  validateMenuRequest(request)
  const now = new Date()
  const menu = await prisma.sysMenu.create({
    data: {
      parentId: BigInt(request.parentId),
      menuName: request.menuName,
      menuType: request.menuType,
      path: request.path,
      component: request.component,
      permission: request.permission,
      icon: request.icon,
      sort: request.sort ?? 0,
      visible: request.visible,
      status: request.status,
      createTime: now,
      updateTime: now,
      createBy: operatorId !== null ? BigInt(operatorId) : null,
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
      deleted: 0,
    },
  })
  return Number(menu.id)
}

export async function update(id: number, request: MenuRequest, operatorId: number | null): Promise<void> {
  validateMenuRequest(request)
  await requireMenu(id)
  if (id === request.parentId) {
    throw new BusinessException('menu cannot be its own parent')
  }

  await prisma.sysMenu.update({
    where: { id: BigInt(id) },
    data: {
      parentId: BigInt(request.parentId),
      menuName: request.menuName,
      menuType: request.menuType,
      path: request.path,
      component: request.component,
      permission: request.permission,
      icon: request.icon,
      sort: request.sort ?? 0,
      visible: request.visible,
      status: request.status,
      updateTime: new Date(),
      updateBy: operatorId !== null ? BigInt(operatorId) : null,
    },
  })
}

export async function remove(id: number): Promise<void> {
  await requireMenu(id)
  const childCount = await prisma.sysMenu.count({
    where: { parentId: BigInt(id), deleted: 0 },
  })
  if (childCount > 0) {
    throw new BusinessException('menu has children')
  }
  await prisma.sysMenu.update({
    where: { id: BigInt(id) },
    data: { deleted: 1, updateTime: new Date() },
  })
}

async function requireMenu(id: number) {
  const menu = await prisma.sysMenu.findFirst({
    where: { id: BigInt(id), deleted: 0 },
  })
  if (!menu) {
    throw new BusinessException('menu not found')
  }
  return menu
}
