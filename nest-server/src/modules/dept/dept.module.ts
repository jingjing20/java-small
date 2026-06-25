import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { DeptService } from './dept.service'
import { DeptController } from './dept.controller'

@Module({
  providers: [PrismaService, DeptService],
  controllers: [DeptController],
})
export class DeptModule {}
