import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PrismaService } from './prisma.service'
import { EnvConfig } from './config/env'
import { GlobalExceptionFilter } from './common/exception.filter'
import { AuthGuard } from './common/auth.guard'
import { OperationLogInterceptor } from './common/operation-log.interceptor'
import { AuthModule } from './modules/auth/auth.module'
import { DeptModule } from './modules/dept/dept.module'
import { DictModule } from './modules/dict/dict.module'
import { MenuModule } from './modules/menu/menu.module'
import { RoleModule } from './modules/role/role.module'
import { UserModule } from './modules/user/user.module'
import { OperLogModule } from './modules/oper-log/oper-log.module'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: EnvConfig.jwtSecret,
      signOptions: {
        issuer: EnvConfig.jwtIssuer,
        expiresIn: `${EnvConfig.jwtExpirationMinutes}m`,
      },
    }),
    AuthModule,
    DeptModule,
    DictModule,
    MenuModule,
    RoleModule,
    UserModule,
    OperLogModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, prisma: PrismaService) =>
        new OperationLogInterceptor(reflector, prisma),
      inject: [Reflector, PrismaService],
    },
  ],
})
export class AppModule {}
