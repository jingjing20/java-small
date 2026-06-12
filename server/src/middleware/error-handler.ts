import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { fail } from '../common/api-response'
import { BusinessException, ErrorCode } from '../common/errors'
import { env } from '../config/env'

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof BusinessException) {
    const status = error.code === ErrorCode.UNAUTHORIZED
      ? 401
      : error.code === ErrorCode.FORBIDDEN
        ? 403
        : 400
    console.warn('business error:', error.message)
    res.status(status).json(fail(error.code, error.message))
    return
  }

  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join(', ')
    console.warn('validation error:', message)
    res.status(400).json(fail(ErrorCode.BAD_REQUEST, message))
    return
  }

  console.error('unhandled error', error)
  res.status(500).json(
    fail(ErrorCode.SYSTEM_ERROR, resolveMessage(error, 'system error')),
  )
}

function resolveMessage(error: unknown, fallback: string): string {
  if (env.isProd) {
    return fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
