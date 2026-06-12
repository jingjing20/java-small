import { Router } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { withOperationLog } from '../../middleware/operation-log'
import { requireAnyAuthority, requireAuthority } from '../../middleware/permission'
import { validateBody } from '../../middleware/validate'
import { deptRequestSchema } from './dept.schema'
import * as deptService from './dept.service'

export const deptRouter = Router()

deptRouter.get(
  '/tree',
  requireAnyAuthority('system:dept:list', 'system:user:add', 'system:user:edit'),
  async (_req, res, next) => {
    try {
      const result = await deptService.tree()
      res.json(ok(result))
    } catch (error) {
      next(error)
    }
  },
)

deptRouter.post(
  '/',
  requireAuthority('system:dept:add'),
  validateBody(deptRequestSchema),
  withOperationLog({ title: 'Dept', businessType: 'create' }, async (req, res) => {
    const id = await deptService.create(req.body, req.user?.userId ?? null)
    res.json(ok(id))
  }),
)

deptRouter.put(
  '/:id',
  requireAuthority('system:dept:edit'),
  validateBody(deptRequestSchema),
  withOperationLog({ title: 'Dept', businessType: 'update' }, async (req, res) => {
    const id = Number(req.params.id)
    await deptService.update(id, req.body, req.user?.userId ?? null)
    res.json(okVoid())
  }),
)

deptRouter.delete(
  '/:id',
  requireAuthority('system:dept:delete'),
  withOperationLog({ title: 'Dept', businessType: 'delete' }, async (req, res) => {
    const id = Number(req.params.id)
    await deptService.remove(id)
    res.json(okVoid())
  }),
)
