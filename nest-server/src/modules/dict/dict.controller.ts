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
import { RequireAuthority } from '../../common/authority.decorator'
import { OperationLog } from '../../common/operation-log.decorator'
import { LoginUser } from '../auth/auth.types'
import { DictService } from './dict.service'
import { dictTypeRequestSchema, dictDataRequestSchema, dictDataQuerySchema } from './dict.schema'

@Controller('api/system')
@UseGuards(PermissionGuard)
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Get('dict-types')
  @RequireAuthority('system:dict:list')
  async typePage(@Query() query: unknown) {
    const data = pageQuerySchema.parse(query)
    return ok(await this.dictService.typePage(data))
  }

  @Post('dict-types')
  @RequireAuthority('system:dict:add')
  @OperationLog('DictType', 'create')
  async createType(@Body() body: unknown, @Req() req: Request) {
    const data = dictTypeRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    const id = await this.dictService.createType(data, user?.userId ?? null)
    return ok(id)
  }

  @Put('dict-types/:id')
  @RequireAuthority('system:dict:edit')
  @OperationLog('DictType', 'update')
  async updateType(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const data = dictTypeRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    await this.dictService.updateType(Number(id), data, user?.userId ?? null)
    return okVoid()
  }

  @Delete('dict-types/:id')
  @RequireAuthority('system:dict:delete')
  @OperationLog('DictType', 'delete')
  async removeType(@Param('id') id: string) {
    await this.dictService.removeType(Number(id))
    return okVoid()
  }

  @Get('dict-data')
  @RequireAuthority('system:dict:list')
  async dataPage(@Query() query: unknown) {
    const data = dictDataQuerySchema.parse(query)
    return ok(await this.dictService.dataPage(data))
  }

  @Post('dict-data')
  @RequireAuthority('system:dict:add')
  @OperationLog('DictData', 'create')
  async createData(@Body() body: unknown, @Req() req: Request) {
    const data = dictDataRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    const id = await this.dictService.createData(data, user?.userId ?? null)
    return ok(id)
  }

  @Put('dict-data/:id')
  @RequireAuthority('system:dict:edit')
  @OperationLog('DictData', 'update')
  async updateData(@Param('id') id: string, @Body() body: unknown, @Req() req: Request) {
    const data = dictDataRequestSchema.parse(body)
    const user: LoginUser | undefined = (req as any).user
    await this.dictService.updateData(Number(id), data, user?.userId ?? null)
    return okVoid()
  }

  @Delete('dict-data/:id')
  @RequireAuthority('system:dict:delete')
  @OperationLog('DictData', 'delete')
  async removeData(@Param('id') id: string) {
    await this.dictService.removeData(Number(id))
    return okVoid()
  }
}
