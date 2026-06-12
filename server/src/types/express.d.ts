import type { LoginUser } from '../modules/auth/auth.types'

declare global {
  namespace Express {
    interface Request {
      user?: LoginUser
      validatedQuery?: unknown
    }
  }
}

export {}
