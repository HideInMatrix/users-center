import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '@/users/users.service';
import { LoginDto } from './login.dto';
import { compare } from 'bcryptjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '登录成功，返回访问令牌和刷新令牌' })
  @ApiResponse({ status: 401, description: '登录失败，凭据无效' })
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      // 查找用户
      const userResult = await this.userService.findByEmail(email);
      

      // 检查是否成功找到用户
      if (userResult.getCode() !== 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = userResult.getData();
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 验证密码
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 生成JWT令牌
      return this.authService.login({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      // 统一错误消息，防止用户枚举攻击
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiCookieAuth('refresh-token')
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: '刷新成功，返回新的访问令牌' })
  @ApiResponse({ status: 401, description: '刷新失败，令牌无效' })
  async refreshToken(@Body() { refresh_token }: { refresh_token: string }) {
    try {
      // 验证刷新令牌
      const payload = await this.authService.verifyRefreshToken(refresh_token);

      // 生成新的访问令牌
      // 确保 payload.sub 不为 undefined
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const userResult = await this.userService.findById(payload.sub);

      // 检查是否成功找到用户
      if (userResult.getCode() !== 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = userResult.getData();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 返回新的访问令牌
      return {
        access_token: await this.authService.createAccessToken({
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
