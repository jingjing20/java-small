import { z } from 'zod'

export const deptRequestSchema = z.object({
  parentId: z.number(),
  deptName: z.string().min(1),
  sort: z.number().optional(),
  leader: z.string().optional(),
  phone: z.string().optional(),
  status: z.number(),
})

export type DeptRequest = z.infer<typeof deptRequestSchema>

export interface DeptTreeNode {
  id: number
  parentId: number
  deptName: string
  sort?: number
  leader?: string
  phone?: string
  status?: number
  children: DeptTreeNode[]
}
