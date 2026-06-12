import { z } from 'zod'

export const menuRequestSchema = z.object({
  parentId: z.number(),
  menuName: z.string().min(1),
  menuType: z.string().min(1),
  path: z.string().optional(),
  component: z.string().optional(),
  permission: z.string().optional(),
  icon: z.string().optional(),
  sort: z.number().optional(),
  visible: z.number(),
  status: z.number(),
})

export type MenuRequest = z.infer<typeof menuRequestSchema>

export interface MenuTreeNode {
  id: number
  parentId: number
  menuName: string
  menuType: string
  path?: string
  component?: string
  permission?: string
  icon?: string
  sort?: number
  visible?: number
  status?: number
  children: MenuTreeNode[]
}
