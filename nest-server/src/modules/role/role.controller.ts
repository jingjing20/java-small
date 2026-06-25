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
import { pageQuerySchema } from '../../common/page'
import { PermissionGuard } from '../../common/permission.guard'
import { RequireAuthority, RequireAnyAuthority } from '../../common/authority.decorator'
import { OperationLog } from '../../common/operation-log.decorator'
import { LoginUser } from '../auth/auth.types'
import { RoleService } from './role.service'
import { roleRequestSchema, roleMenuUpdateSchema } from './role.schema'

@Controller('api/system/roles')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequireAnyAuthority('system:role:list', 'system:user:add', 'system:user:edit')
  async page(@Query() query: unknown) {
    const data = pageQuerySchema.parse(query)
    return ok(await this.roleService.page(data))
  }

  @Post()
  @RequireAuthority('system:role:add')
  @OperationLog('Role', 'create')
  async create(@Body() body: unknown, @Req() req: Request) {
    const data = roleRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    const id = await this.roleService.create(data, user?.userId ?? null)
    return ok(id)
  }

  @Put(':id')
  @RequireAuthority('system:role:edit')
  @OperationLog('Role', 'update')
  async update(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const data = roleRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    await this.roleService.update(Number(id), data, user?.userId ?? null)
    return okVoid()
  }

  @Delete(':id')
  @RequireAuthority('system:role:delete')
  @OperationLog('Role', 'delete')
  async remove(@Param('id') id: string) {
    await this.roleService.remove(Number(id))
    return okVoid()
  }

  @Get(':id/menus')
  @RequireAuthority('system:role:menus')
  async getMenuIds(@Param('id') id: string) {
    return ok(await this.roleService.getMenuIds(Number(id)))
  }

  @Put(':id/menus')
  @RequireAuthority('system:role:menus')
  @OperationLog('Role', 'assignMenus')
  async updateMenus(@Param('id') id: string, @Body() body: unknown) {
    const data = roleMenuUpdateSchema.parse(body)
    await this.roleService.updateMenus(Number(id), data)
    return okVoid()
  }
}
