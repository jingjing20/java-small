import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'
import { ZodError } from 'zod'
import { fail } from './api-response'
import { BusinessException, ErrorCode } from './errors'
import { EnvConfig } from '../config/env'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    if (exception instanceof BusinessException) {
      const status =
        exception.code === ErrorCode.UNAUTHORIZED
          ? 401
          : exception.code === ErrorCode.FORBIDDEN
            ? 403
            : 400
      console.warn('business error:', exception.message)
      res.status(status).json(fail(exception.code, exception.message))
      return
    }

    if (exception instanceof ZodError) {
      const message = exception.issues
        .map((issue) => `${issue.path.join('.')} ${issue.message}`)
        .join(', ')
      console.warn('validation error:', message)
      res.status(400).json(fail(ErrorCode.BAD_REQUEST, message))
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      res.status(status).json(fail(status, exception.message))
      return
    }

    console.error('unhandled error', exception)
    res.status(500).json(fail(ErrorCode.SYSTEM_ERROR, resolveMessage(exception, 'system error')))
  }
}

function resolveMessage(error: unknown, fallback: string): string {
  if (EnvConfig.isProd) {
    return fallback
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
