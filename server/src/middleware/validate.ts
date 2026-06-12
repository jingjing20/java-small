import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { BusinessException, ErrorCode } from '../common/errors'

function formatZodError(error: { issues: { path: (string | number)[]; message: string }[] }): string {
  return error.issues
    .map((issue) => `${issue.path.join('.')} ${issue.message}`)
    .join(', ')
}

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      next(new BusinessException(ErrorCode.BAD_REQUEST, formatZodError(result.error)))
      return
    }
    req.body = result.data
    next()
  }
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
      next(new BusinessException(ErrorCode.BAD_REQUEST, formatZodError(result.error)))
      return
    }
    ;(req as Request & { validatedQuery: T }).validatedQuery = result.data
    next()
  }
}
