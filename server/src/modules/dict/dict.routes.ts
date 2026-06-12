import { Router } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { pageQuerySchema } from '../../common/page'
import { withOperationLog } from '../../middleware/operation-log'
import { requireAuthority } from '../../middleware/permission'
import { validateBody, validateQuery } from '../../middleware/validate'
import {
  dictDataQuerySchema,
  dictDataRequestSchema,
  dictTypeRequestSchema,
} from './dict.schema'
import * as dictService from './dict.service'

export const dictRouter = Router()

dictRouter.get(
  '/dict-types',
  requireAuthority('system:dict:list'),
  validateQuery(pageQuerySchema),
  async (req, res, next) => {
    try {
      res.json(ok(await dictService.typePage(req.validatedQuery as ReturnType<typeof pageQuerySchema.parse>)))
    } catch (error) {
      next(error)
    }
  },
)

dictRouter.post(
  '/dict-types',
  requireAuthority('system:dict:add'),
  validateBody(dictTypeRequestSchema),
  withOperationLog({ title: 'DictType', businessType: 'create' }, async (req, res) => {
    const id = await dictService.createType(req.body, req.user?.userId ?? null)
    res.json(ok(id))
  }),
)

dictRouter.put(
  '/dict-types/:id',
  requireAuthority('system:dict:edit'),
  validateBody(dictTypeRequestSchema),
  withOperationLog({ title: 'DictType', businessType: 'update' }, async (req, res) => {
    await dictService.updateType(Number(req.params.id), req.body, req.user?.userId ?? null)
    res.json(okVoid())
  }),
)

dictRouter.delete(
  '/dict-types/:id',
  requireAuthority('system:dict:delete'),
  withOperationLog({ title: 'DictType', businessType: 'delete' }, async (req, res) => {
    await dictService.removeType(Number(req.params.id))
    res.json(okVoid())
  }),
)

dictRouter.get(
  '/dict-data',
  requireAuthority('system:dict:list'),
  validateQuery(dictDataQuerySchema),
  async (req, res, next) => {
    try {
      res.json(ok(await dictService.dataPage(req.validatedQuery as ReturnType<typeof dictDataQuerySchema.parse>)))
    } catch (error) {
      next(error)
    }
  },
)

dictRouter.post(
  '/dict-data',
  requireAuthority('system:dict:add'),
  validateBody(dictDataRequestSchema),
  withOperationLog({ title: 'DictData', businessType: 'create' }, async (req, res) => {
    const id = await dictService.createData(req.body, req.user?.userId ?? null)
    res.json(ok(id))
  }),
)

dictRouter.put(
  '/dict-data/:id',
  requireAuthority('system:dict:edit'),
  validateBody(dictDataRequestSchema),
  withOperationLog({ title: 'DictData', businessType: 'update' }, async (req, res) => {
    await dictService.updateData(Number(req.params.id), req.body, req.user?.userId ?? null)
    res.json(okVoid())
  }),
)

dictRouter.delete(
  '/dict-data/:id',
  requireAuthority('system:dict:delete'),
  withOperationLog({ title: 'DictData', businessType: 'delete' }, async (req, res) => {
    await dictService.removeData(Number(req.params.id))
    res.json(okVoid())
  }),
)
