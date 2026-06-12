import { Router } from 'express'
import { ok } from '../../common/api-response'
import { pageQuerySchema } from '../../common/page'
import { requireAuthority } from '../../middleware/permission'
import { validateQuery } from '../../middleware/validate'
import * as operLogService from './oper-log.service'

export const operLogRouter = Router()

operLogRouter.get(
  '/',
  requireAuthority('system:operlog:list'),
  validateQuery(pageQuerySchema),
  async (req, res, next) => {
    try {
      res.json(ok(await operLogService.page(req.validatedQuery as ReturnType<typeof pageQuerySchema.parse>)))
    } catch (error) {
      next(error)
    }
  },
)
