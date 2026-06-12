import bcrypt from 'bcryptjs'
import { BusinessException } from '../../common/errors'
import { createToken } from './jwt.service'
import { loadUserByUsername, requireCurrentUser } from './permission.service'
import type { CurrentUserResponse, LoginRequest, LoginResponse } from './auth.types'
import type { LoginUser } from './auth.types'

const TOKEN_TYPE = 'Bearer'

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const user = await loadUserByUsername(request.username)
  if (!user || !isEnabled(user) || !bcrypt.compareSync(request.password, user.password)) {
    throw new BusinessException('invalid username or password')
  }

  return {
    token: createToken(user),
    tokenType: TOKEN_TYPE,
  }
}

export function me(reqUser: LoginUser | undefined): CurrentUserResponse {
  const user = requireCurrentUser(reqUser)
  return {
    userId: user.userId,
    deptId: user.deptId,
    username: user.username,
    permissions: [...user.permissions],
  }
}

function isEnabled(user: LoginUser): boolean {
  return user.status === 1
}
