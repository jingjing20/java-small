import { SetMetadata } from '@nestjs/common'

export const REQUIRE_AUTHORITY_KEY = 'requireAuthority'
export const REQUIRE_ANY_AUTHORITY_KEY = 'requireAnyAuthority'

export const RequireAuthority = (authority: string) =>
  SetMetadata(REQUIRE_AUTHORITY_KEY, authority)

export const RequireAnyAuthority = (...authorities: string[]) =>
  SetMetadata(REQUIRE_ANY_AUTHORITY_KEY, authorities)
