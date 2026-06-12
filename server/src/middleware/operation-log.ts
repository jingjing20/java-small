import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

interface OperationLogOptions {
  title: string
  businessType: string
}

async function recordLog(
  req: Request,
  options: OperationLogOptions,
  status: number,
  errorMessage: string | null,
  start: number,
) {
  const now = new Date()
  await prisma.sysOperLog.create({
    data: {
      title: options.title,
      businessType: options.businessType,
      method: `${req.method} ${req.originalUrl}`,
      requestMethod: req.method,
      requestUri: req.originalUrl,
      operatorName: req.user?.username,
      operatorId: req.user ? BigInt(req.user.userId) : null,
      operatorIp: req.ip,
      status,
      errorMessage,
      costMillis: BigInt(Date.now() - start),
      createTime: now,
      updateTime: now,
      createBy: req.user ? BigInt(req.user.userId) : null,
      updateBy: req.user ? BigInt(req.user.userId) : null,
      deleted: 0,
    },
  })
}

export function withOperationLog(
  options: OperationLogOptions,
  handler: (req: Request, res: Response) => Promise<void>,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now()
    let status = 1
    let errorMessage: string | null = null

    try {
      await handler(req, res)
    } catch (error) {
      status = 0
      errorMessage = error instanceof Error ? error.message : 'unknown error'
      next(error)
      return
    } finally {
      try {
        await recordLog(req, options, status, errorMessage, start)
      } catch (logError) {
        console.error('failed to record operation log', logError)
      }
    }
  }
}
