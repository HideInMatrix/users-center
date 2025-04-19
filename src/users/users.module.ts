import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { PrismaService } from '@/prismac/prisma.service';
import { MailService } from '@/mail/mail.service';
import { MailModule } from '@/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MailModule,ConfigModule],
  controllers: [UsersController],
  providers: [UserService, PrismaService,MailService],
  exports: [UserService],
})
export class UsersModule {}
