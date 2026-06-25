import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { fail } from './api-response'
import { ErrorCode } from './errors'
import {
  REQUIRE_AUTHORITY_KEY,
  REQUIRE_ANY_AUTHORITY_KEY,
} from './authority.decorator'
import { LoginUser } from '../modules/auth/auth.types'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const authority = this.reflector.getAllAndOverride<string>(REQUIRE_AUTHORITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    const anyAuthorities = this.reflector.getAllAndOverride<string[]>(REQUIRE_ANY_AUTHORITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!authority && !anyAuthorities) {
      return true
    }

    const req = context.switchToHttp().getRequest<Request>()
    const user: LoginUser | undefined = (req as any).user

    if (authority) {
      if (!user?.permissions.has(authority)) {
        this.sendForbidden(context)
        return false
      }
    }

    if (anyAuthorities) {
      const hasAny = anyAuthorities.some((a) => user?.permissions.has(a))
      if (!hasAny) {
        this.sendForbidden(context)
        return false
      }
    }

    return true
  }

  private sendForbidden(context: ExecutionContext) {
    const res = context.switchToHttp().getResponse()
    res.status(403).json(fail(ErrorCode.FORBIDDEN, 'forbidden'))
  }
}
