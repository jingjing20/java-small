import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { OperLogService } from './oper-log.service'
import { OperLogController } from './oper-log.controller'

@Module({
  providers: [PrismaService, OperLogService],
  controllers: [OperLogController],
})
export class OperLogModule {}
