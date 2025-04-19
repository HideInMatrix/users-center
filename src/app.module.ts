import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupTasks } from './tasks/cleanup.task';
import { PrismaService } from './prismac/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    MailModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // 时间窗口（秒）
          limit: 3, // 允许的请求次数
        }
      ]
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // 全局启用
    },
    CleanupTasks,
    PrismaService,
    ConfigService
  ],
})
export class AppModule { }
