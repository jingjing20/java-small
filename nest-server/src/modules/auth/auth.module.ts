import { Module } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { PermissionService } from './permission.service'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  providers: [PrismaService, PermissionService, AuthService],
  controllers: [AuthController],
  exports: [PermissionService],
})
export class AuthModule {}
