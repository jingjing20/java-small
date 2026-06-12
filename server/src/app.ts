import express from 'express'
import { authMiddleware } from './middleware/auth'
import { errorHandler } from './middleware/error-handler'
import { authRouter } from './modules/auth/auth.routes'
import { deptRouter } from './modules/dept/dept.routes'
import { dictRouter } from './modules/dict/dict.routes'
import { menuRouter } from './modules/menu/menu.routes'
import { operLogRouter } from './modules/oper-log/oper-log.routes'
import { roleRouter } from './modules/role/role.routes'
import { userRouter } from './modules/user/user.routes'

export function createApp() {
  const app = express()

  app.use(express.json())
  app.use(authMiddleware)
  app.use('/api/auth', authRouter)
  app.use('/api/system/depts', deptRouter)
  app.use('/api/system/menus', menuRouter)
  app.use('/api/system/roles', roleRouter)
  app.use('/api/system/users', userRouter)
  app.use('/api/system', dictRouter)
  app.use('/api/system/operation-logs', operLogRouter)
  app.use(errorHandler)

  return app
}
