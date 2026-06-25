import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ok } from '../../common/api-response'
import { pageQuerySchema } from '../../common/page'
import { PermissionGuard } from '../../common/permission.guard'
import { RequireAuthority } from '../../common/authority.decorator'
import { OperLogService } from './oper-log.service'

@Controller('api/system/operation-logs')
@UseGuards(PermissionGuard)
export class OperLogController {
  constructor(private readonly operLogService: OperLogService) {}

  @Get()
  @RequireAuthority('system:operlog:list')
  async page(@Query() query: unknown) {
    const data = pageQuerySchema.parse(query)
    return ok(await this.operLogService.page(data))
  }
}
