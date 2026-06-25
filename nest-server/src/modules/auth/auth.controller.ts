import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { z } from 'zod'
import { Request } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { Public } from '../../common/auth.guard'
import { PermissionGuard } from '../../common/permission.guard'
import { AuthService } from './auth.service'
import { LoginUser } from './auth.types'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

@Controller('api/auth')
@UseGuards(PermissionGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: unknown) {
    const data = loginSchema.parse(body) as import('./auth.types').LoginRequest
    const result = await this.authService.login(data)
    return ok(result)
  }

  @Get('me')
  me(@Req() req: Request) {
    const user: LoginUser | undefined = (req as any).user
    const result = this.authService.me(user)
    return ok(result)
  }

  @Post('logout')
  logout() {
    return okVoid()
  }
}
