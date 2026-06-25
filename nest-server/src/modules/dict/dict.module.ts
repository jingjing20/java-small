import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { DictService } from './dict.service'
import { DictController } from './dict.controller'

@Module({
  providers: [PrismaService, DictService],
  controllers: [DictController],
})
export class DictModule {}
