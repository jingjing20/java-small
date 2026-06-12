import jwt from 'jsonwebtoken'
import { env } from '../../config/env'
import type { LoginUser } from './auth.types'

const USER_ID_CLAIM = 'userId'

export function createToken(user: LoginUser): string {
  return jwt.sign(
    { [USER_ID_CLAIM]: user.userId },
    env.jwtSecret,
    {
      issuer: env.jwtIssuer,
      subject: user.username,
      expiresIn: `${env.jwtExpirationMinutes}m`,
    },
  )
}

export function getUsername(token: string): string {
  const payload = parseClaims(token)
  if (!payload.sub) {
    throw new Error('invalid token')
  }
  return payload.sub
}

export function getUserId(token: string): number {
  const payload = parseClaims(token)
  const userId = payload[USER_ID_CLAIM]
  if (typeof userId !== 'number') {
    throw new Error('invalid token')
  }
  return userId
}

function parseClaims(token: string): jwt.JwtPayload {
  const payload = jwt.verify(token, env.jwtSecret, {
    issuer: env.jwtIssuer,
  })
  if (typeof payload === 'string') {
    throw new Error('invalid token')
  }
  return payload
}
