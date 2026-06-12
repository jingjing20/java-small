import type { NextFunction, Request, Response } from 'express'
import { fail } from '../common/api-response'
import { ErrorCode } from '../common/errors'
import { getUsername } from '../modules/auth/jwt.service'
import { loadUserByUsername } from '../modules/auth/permission.service'

const BEARER_PREFIX = 'Bearer '

function resolveToken(req: Request): string | null {
  const authorization = req.headers.authorization
  if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
    return null
  }
  return authorization.slice(BEARER_PREFIX.length)
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    next()
    return
  }

  const token = resolveToken(req)
  if (token) {
    try {
      const username = getUsername(token)
      const user = await loadUserByUsername(username)
      if (user && user.status === 1) {
        req.user = user
      }
    } catch {
      req.user = undefined
    }
  }

  if (!req.user) {
    res.status(401).json(fail(ErrorCode.UNAUTHORIZED, 'unauthorized'))
    return
  }

  next()
}
