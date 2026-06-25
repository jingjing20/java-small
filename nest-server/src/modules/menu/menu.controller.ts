import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { PermissionGuard } from '../../common/permission.guard'
import { RequireAuthority, RequireAnyAuthority } from '../../common/authority.decorator'
import { OperationLog } from '../../common/operation-log.decorator'
import { LoginUser } from '../auth/auth.types'
import { MenuService } from './menu.service'
import { menuRequestSchema } from './menu.schema'

@Controller('api/system/menus')
@UseGuards(PermissionGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('tree')
  @RequireAnyAuthority('system:menu:list', 'system:role:menus')
  async tree() {
    return ok(await this.menuService.tree())
  }

  @Post()
  @RequireAuthority('system:menu:add')
  @OperationLog('Menu', 'create')
  async create(@Body() body: unknown, @Req() req: Request) {
    const data = menuRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    const id = await this.menuService.create(data, user?.userId ?? null)
    return ok(id)
  }

  @Put(':id')
  @RequireAuthority('system:menu:edit')
  @OperationLog('Menu', 'update')
  async update(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const data = menuRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    await this.menuService.update(Number(id), data, user?.userId ?? null)
    return okVoid()
  }

  @Delete(':id')
  @RequireAuthority('system:menu:delete')
  @OperationLog('Menu', 'delete')
  async remove(@Param('id') id: string) {
    await this.menuService.remove(Number(id))
    return okVoid()
  }
}
