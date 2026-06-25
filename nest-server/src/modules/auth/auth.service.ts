import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { BusinessException } from '../../common/errors'
import { EnvConfig } from '../../config/env'
import { PermissionService } from './permission.service'
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  LoginUser,
} from './auth.types'

const TOKEN_TYPE = 'Bearer'

@Injectable()
export class AuthService {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly jwtService: JwtService,
  ) {}

  async login(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.permissionService.loadUserByUsername(request.username)
    if (!user || !this.isEnabled(user) || !bcrypt.compareSync(request.password, user.password)) {
      throw new BusinessException('invalid username or password')
    }

    const token = this.jwtService.sign(
      { userId: user.userId },
      {
        secret: EnvConfig.jwtSecret,
        issuer: EnvConfig.jwtIssuer,
        subject: user.username,
        expiresIn: `${EnvConfig.jwtExpirationMinutes}m`,
      },
    )

    return { token, tokenType: TOKEN_TYPE }
  }

  me(reqUser: LoginUser | undefined): CurrentUserResponse {
    const user = this.permissionService.requireCurrentUser(reqUser)
    return {
      userId: user.userId,
      deptId: user.deptId,
      username: user.username,
      permissions: [...user.permissions],
    }
  }

  private isEnabled(user: LoginUser): boolean {
    return user.status === 1
  }
}
