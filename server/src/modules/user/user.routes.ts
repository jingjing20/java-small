import { Router } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { withOperationLog } from '../../middleware/operation-log'
import { requireAuthority } from '../../middleware/permission'
import { validateBody, validateQuery } from '../../middleware/validate'
import {
  passwordResetSchema,
  userCreateSchema,
  userQuerySchema,
  userUpdateSchema,
} from './user.schema'
import * as userService from './user.service'

export const userRouter = Router()

userRouter.get(
  '/',
  requireAuthority('system:user:list'),
  validateQuery(userQuerySchema),
  async (req, res, next) => {
    try {
      res.json(ok(await userService.page(req.validatedQuery as ReturnType<typeof userQuerySchema.parse>)))
    } catch (error) {
      next(error)
    }
  },
)

userRouter.get(
  '/:id',
  requireAuthority('system:user:list'),
  async (req, res, next) => {
    try {
      res.json(ok(await userService.getDetail(Number(req.params.id))))
    } catch (error) {
      next(error)
    }
  },
)

userRouter.post(
  '/',
  requireAuthority('system:user:add'),
  validateBody(userCreateSchema),
  withOperationLog({ title: 'User', businessType: 'create' }, async (req, res) => {
    const id = await userService.create(req.body, req.user?.userId ?? null)
    res.json(ok(id))
  }),
)

userRouter.put(
  '/:id/password',
  requireAuthority('system:user:password'),
  validateBody(passwordResetSchema),
  withOperationLog({ title: 'User', businessType: 'resetPassword' }, async (req, res) => {
    await userService.resetPassword(Number(req.params.id), req.body)
    res.json(okVoid())
  }),
)

userRouter.put(
  '/:id',
  requireAuthority('system:user:edit'),
  validateBody(userUpdateSchema),
  withOperationLog({ title: 'User', businessType: 'update' }, async (req, res) => {
    await userService.update(Number(req.params.id), req.body, req.user?.userId ?? null)
    res.json(okVoid())
  }),
)

userRouter.delete(
  '/:id',
  requireAuthority('system:user:delete'),
  withOperationLog({ title: 'User', businessType: 'delete' }, async (req, res) => {
    await userService.remove(Number(req.params.id))
    res.json(okVoid())
  }),
)
