import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, catchError, tap, throwError } from 'rxjs'
import { Request } from 'express'
import { PrismaService } from '../prisma.service'
import { OPERATION_LOG_KEY, OperationLogMeta } from './operation-log.decorator'
import { LoginUser } from '../modules/auth/auth.types'

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.getAllAndOverride<OperationLogMeta>(OPERATION_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!meta) {
      return next.handle()
    }

    const req = context.switchToHttp().getRequest<Request>()
    const start = Date.now()

    return next.handle().pipe(
      tap(() => this.recordLog(req, meta, 1, null, start)),
      catchError((err) => {
        const message = err instanceof Error ? err.message : 'unknown error'
        this.recordLog(req, meta, 0, message, start)
        return throwError(() => err)
      }),
    )
  }

  private async recordLog(
    req: Request,
    meta: OperationLogMeta,
    status: number,
    errorMessage: string | null,
    start: number,
  ) {
    const user: LoginUser | undefined = (req as any).user
    const now = new Date()
    try {
      await this.prisma.sysOperLog.create({
        data: {
          title: meta.title,
          businessType: meta.businessType,
          method: `${req.method} ${req.originalUrl}`,
          requestMethod: req.method,
          requestUri: req.originalUrl,
          operatorName: user?.username,
          operatorId: user ? BigInt(user.userId) : null,
          operatorIp: req.ip,
          status,
          errorMessage,
          costMillis: BigInt(Date.now() - start),
          createTime: now,
          updateTime: now,
          createBy: user ? BigInt(user.userId) : null,
          updateBy: user ? BigInt(user.userId) : null,
          deleted: 0,
        },
      })
    } catch (logError) {
      console.error('failed to record operation log', logError)
    }
  }
}
