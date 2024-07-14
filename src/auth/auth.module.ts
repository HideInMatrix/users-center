import { Module } from '@nestjs/common';

import { PrismaService } from '@/prismac/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '@/users/users.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '600s' },
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, UserService],
  exports: [],
})
export class AuthModule {}
