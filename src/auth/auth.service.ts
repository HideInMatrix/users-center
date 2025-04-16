import { UsersDto } from '@/users/users.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.middleware';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  createAccessToken(user: Partial<UsersDto>) {
    return this.jwtService.signAsync(user, {
      expiresIn: '1h', // 访问令牌有效期较短
    });
  }

  createRefreshToken(user: Partial<UsersDto>) {
    // 刷新令牌只包含必要信息，有效期更长
    return this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );
  }

  async login(user: Partial<UsersDto>) {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
