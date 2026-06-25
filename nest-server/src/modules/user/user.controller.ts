import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { PermissionGuard } from '../../common/permission.guard'
import { RequireAuthority } from '../../common/authority.decorator'
import { OperationLog } from '../../common/operation-log.decorator'
import { LoginUser } from '../auth/auth.types'
import { UserService } from './user.service'
import {
  passwordResetSchema,
  userCreateSchema,
  userQuerySchema,
  userUpdateSchema,
} from './user.schema'

@Controller('api/system/users')
@UseGuards(PermissionGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequireAuthority('system:user:list')
  async page(@Query() query: unknown) {
    const data = userQuerySchema.parse(query)
    return ok(await this.userService.page(data))
  }

  @Get(':id')
  @RequireAuthority('system:user:list')
  async getDetail(@Param('id') id: string) {
    return ok(await this.userService.getDetail(Number(id)))
  }

  @Post()
  @RequireAuthority('system:user:add')
  @OperationLog('User', 'create')
  async create(@Body() body: unknown, @Req() req: Request) {
    const data = userCreateSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    const id = await this.userService.create(data, user?.userId ?? null)
    return ok(id)
  }

  @Put(':id/password')
  @RequireAuthority('system:user:password')
  @OperationLog('User', 'resetPassword')
  async resetPassword(@Param('id') id: string, @Body() body: unknown) {
    const data = passwordResetSchema.parse(body)
    await this.userService.resetPassword(Number(id), data)
    return okVoid()
  }

  @Put(':id')
  @RequireAuthority('system:user:edit')
  @OperationLog('User', 'update')
  async update(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const data = userUpdateSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    await this.userService.update(Number(id), data, user?.userId ?? null)
    return okVoid()
  }

  @Delete(':id')
  @RequireAuthority('system:user:delete')
  @OperationLog('User', 'delete')
  async remove(@Param('id') id: string) {
    await this.userService.remove(Number(id))
    return okVoid()
  }
}
