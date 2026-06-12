import { config } from 'dotenv'

config({ quiet: true })

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required env: ${key}`)
  }
  return value
}

export const env = {
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtIssuer: requireEnv('JWT_ISSUER'),
  jwtExpirationMinutes: Number(process.env.JWT_EXPIRATION_MINUTES ?? 120),
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
}
