import { z } from 'zod'

export const roleRequestSchema = z.object({
  roleCode: z.string().min(1),
  roleName: z.string().min(1),
  sort: z.number().optional(),
  status: z.number(),
  remark: z.string().optional(),
})

export const roleMenuUpdateSchema = z.object({
  menuIds: z.array(z.number()),
})

export type RoleRequest = z.infer<typeof roleRequestSchema>
export type RoleMenuUpdateRequest = z.infer<typeof roleMenuUpdateSchema>

export interface SysRoleResponse {
  id: number
  roleCode: string
  roleName: string
  sort: number
  status: number
  remark: string
  createTime: string
}
