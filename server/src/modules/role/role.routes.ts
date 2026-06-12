import { Router } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { pageQuerySchema } from '../../common/page'
import { withOperationLog } from '../../middleware/operation-log'
import { requireAnyAuthority, requireAuthority } from '../../middleware/permission'
import { validateBody, validateQuery } from '../../middleware/validate'
import { roleMenuUpdateSchema, roleRequestSchema } from './role.schema'
import * as roleService from './role.service'

export const roleRouter = Router()

roleRouter.get(
  '/',
  requireAnyAuthority('system:role:list', 'system:user:add', 'system:user:edit'),
  validateQuery(pageQuerySchema),
  async (req, res, next) => {
    try {
      res.json(ok(await roleService.page(req.validatedQuery as ReturnType<typeof pageQuerySchema.parse>)))
    } catch (error) {
      next(error)
    }
  },
)

roleRouter.post(
  '/',
  requireAuthority('system:role:add'),
  validateBody(roleRequestSchema),
  withOperationLog({ title: 'Role', businessType: 'create' }, async (req, res) => {
    const id = await roleService.create(req.body, req.user?.userId ?? null)
    res.json(ok(id))
  }),
)

roleRouter.put(
  '/:id',
  requireAuthority('system:role:edit'),
  validateBody(roleRequestSchema),
  withOperationLog({ title: 'Role', businessType: 'update' }, async (req, res) => {
    await roleService.update(Number(req.params.id), req.body, req.user?.userId ?? null)
    res.json(okVoid())
  }),
)

roleRouter.delete(
  '/:id',
  requireAuthority('system:role:delete'),
  withOperationLog({ title: 'Role', businessType: 'delete' }, async (req, res) => {
    await roleService.remove(Number(req.params.id))
    res.json(okVoid())
  }),
)

roleRouter.get(
  '/:id/menus',
  requireAuthority('system:role:menus'),
  async (req, res, next) => {
    try {
      res.json(ok(await roleService.getMenuIds(Number(req.params.id))))
    } catch (error) {
      next(error)
    }
  },
)

roleRouter.put(
  '/:id/menus',
  requireAuthority('system:role:menus'),
  validateBody(roleMenuUpdateSchema),
  withOperationLog({ title: 'Role', businessType: 'assignMenus' }, async (req, res) => {
    await roleService.updateMenus(Number(req.params.id), req.body)
    res.json(okVoid())
  }),
)
