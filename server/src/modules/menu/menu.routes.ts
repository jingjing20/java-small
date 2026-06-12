import { Router } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { withOperationLog } from '../../middleware/operation-log'
import { requireAnyAuthority, requireAuthority } from '../../middleware/permission'
import { validateBody } from '../../middleware/validate'
import { menuRequestSchema } from './menu.schema'
import * as menuService from './menu.service'

export const menuRouter = Router()

menuRouter.get(
  '/tree',
  requireAnyAuthority('system:menu:list', 'system:role:menus'),
  async (_req, res, next) => {
    try {
      res.json(ok(await menuService.tree()))
    } catch (error) {
      next(error)
    }
  },
)

menuRouter.post(
  '/',
  requireAuthority('system:menu:add'),
  validateBody(menuRequestSchema),
  withOperationLog({ title: 'Menu', businessType: 'create' }, async (req, res) => {
    const id = await menuService.create(req.body, req.user?.userId ?? null)
    res.json(ok(id))
  }),
)

menuRouter.put(
  '/:id',
  requireAuthority('system:menu:edit'),
  validateBody(menuRequestSchema),
  withOperationLog({ title: 'Menu', businessType: 'update' }, async (req, res) => {
    await menuService.update(Number(req.params.id), req.body, req.user?.userId ?? null)
    res.json(okVoid())
  }),
)

menuRouter.delete(
  '/:id',
  requireAuthority('system:menu:delete'),
  withOperationLog({ title: 'Menu', businessType: 'delete' }, async (req, res) => {
    await menuService.remove(Number(req.params.id))
    res.json(okVoid())
  }),
)
