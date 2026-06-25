import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'
import { fail } from './api-response'
import { ErrorCode } from './errors'
import { EnvConfig } from '../config/env'
import { PermissionService } from '../modules/auth/permission.service'

export const IS_PUBLIC = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC, true)

const BEARER_PREFIX = 'Bearer '

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const req = context.switchToHttp().getRequest<Request>()
    const token = this.resolveToken(req)

    if (!token) {
      this.sendUnauthorized(context)
      return false
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: EnvConfig.jwtSecret,
        issuer: EnvConfig.jwtIssuer,
      })
      const username = payload.sub as string
      const user = await this.permissionService.loadUserByUsername(username)
      if (!user || user.status !== 1) {
        this.sendUnauthorized(context)
        return false
      }
      ;(req as any).user = user
    } catch {
      this.sendUnauthorized(context)
      return false
    }

    return true
  }

  private resolveToken(req: Request): string | null {
    const authorization = req.headers.authorization
    if (!authorization || !authorization.startsWith(BEARER_PREFIX)) {
      return null
    }
    return authorization.slice(BEARER_PREFIX.length)
  }

  private sendUnauthorized(context: ExecutionContext) {
    const res = context.switchToHttp().getResponse()
    res.status(401).json(fail(ErrorCode.UNAUTHORIZED, 'unauthorized'))
  }
}
