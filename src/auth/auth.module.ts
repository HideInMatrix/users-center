import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtMiddleware } from './jwt.middleware';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: JwtMiddleware,
      useFactory: () => {
        return new JwtMiddleware({
          secret: process.env.JWT_SECRET || 'your-secret-key',
        });
      },
    },
  ],
  exports: [AuthService, JwtMiddleware],
})
export class AuthModule {}
