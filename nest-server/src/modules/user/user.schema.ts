import { z } from 'zod'
import { pageQuerySchema } from '../../common/page'

const phoneSchema = z.string().regex(/^$|^1[3-9]\d{9}$/, 'invalid phone number').optional()
const emailSchema = z.string().regex(/^$|.+@.+\..+/, 'invalid email').optional()

export const userQuerySchema = pageQuerySchema.extend({
  username: z.string().optional(),
  phone: z.string().optional(),
  status: z.coerce.number().optional(),
})

export const userCreateSchema = z.object({
  deptId: z.number().optional(),
  username: z.string().min(1),
  nickname: z.string().min(1),
  password: z.string().min(6).max(32),
  email: emailSchema,
  phone: phoneSchema,
  status: z.number(),
  remark: z.string().optional(),
  roleIds: z.array(z.number()).optional(),
})

export const userUpdateSchema = z.object({
  deptId: z.number().optional(),
  nickname: z.string().min(1),
  email: emailSchema,
  phone: phoneSchema,
  status: z.number(),
  remark: z.string().optional(),
  roleIds: z.array(z.number()).optional(),
})

export const passwordResetSchema = z.object({
  password: z.string().min(6).max(32),
})

export type UserQuery = z.infer<typeof userQuerySchema>
export type UserCreateRequest = z.infer<typeof userCreateSchema>
export type UserUpdateRequest = z.infer<typeof userUpdateSchema>
export type PasswordResetRequest = z.infer<typeof passwordResetSchema>

export interface UserDetailResponse {
  id: number
  deptId: number | null
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  remark: string
  roleIds: number[] | null
}
