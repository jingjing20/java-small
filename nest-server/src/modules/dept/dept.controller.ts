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
  UseInterceptors,
} from '@nestjs/common'
import { Request } from 'express'
import { ok, okVoid } from '../../common/api-response'
import { PermissionGuard } from '../../common/permission.guard'
import { RequireAuthority, RequireAnyAuthority } from '../../common/authority.decorator'
import { OperationLog } from '../../common/operation-log.decorator'
import { OperationLogInterceptor } from '../../common/operation-log.interceptor'
import { LoginUser } from '../auth/auth.types'
import { DeptService } from './dept.service'
import { deptRequestSchema } from './dept.schema'

@Controller('api/system/depts')
@UseGuards(PermissionGuard)
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Get('tree')
  @RequireAnyAuthority('system:dept:list', 'system:user:add', 'system:user:edit')
  async tree() {
    return ok(await this.deptService.tree())
  }

  @Post()
  @RequireAuthority('system:dept:add')
  @OperationLog('Dept', 'create')
  async create(@Body() body: unknown, @Req() req: Request) {
    const data = deptRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    const id = await this.deptService.create(data, user?.userId ?? null)
    return ok(id)
  }

  @Put(':id')
  @RequireAuthority('system:dept:edit')
  @OperationLog('Dept', 'update')
  async update(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const data = deptRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    await this.deptService.update(Number(id), data, user?.userId ?? null)
    return okVoid()
  }

  @Delete(':id')
  @RequireAuthority('system:dept:delete')
  @OperationLog('Dept', 'delete')
  async remove(@Param('id') id: string) {
    await this.deptService.remove(Number(id))
    return okVoid()
  }
}
