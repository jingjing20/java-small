import { Router } from 'express'
import { z } from 'zod'
import { ok, okVoid } from '../../common/api-response'
import { validateBody } from '../../middleware/validate'
import * as authService from './auth.service'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const authRouter = Router()

authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    res.json(ok(result))
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', (req, res, next) => {
  try {
    const result = authService.me(req.user)
    res.json(ok(result))
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', (_req, res) => {
  res.json(okVoid())
})
