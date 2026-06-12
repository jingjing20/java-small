import type { NextFunction, Request, Response } from 'express'
import { fail } from '../common/api-response'
import { ErrorCode } from '../common/errors'

export function requireAuthority(authority: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.permissions.has(authority)) {
      res.status(403).json(fail(ErrorCode.FORBIDDEN, 'forbidden'))
      return
    }
    next()
  }
}

export function requireAnyAuthority(...authorities: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const hasAuthority = authorities.some((authority) => req.user?.permissions.has(authority))
    if (!hasAuthority) {
      res.status(403).json(fail(ErrorCode.FORBIDDEN, 'forbidden'))
      return
    }
    next()
  }
}
