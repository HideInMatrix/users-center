import { Body, Controller, Post, Get, Param, UseGuards, Put } from '@nestjs/common';
import { UserService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/auth/roles.decorator';
import { RolesGuard } from '@/auth/roles.guard';
import { UserRole } from '@prisma/client';
import { UsersDto } from './users.dto';
import { ResponseDto } from '@/vo/response.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' }) // 该接口的描述
  @ApiBody({ type: UsersDto }) // 请求体类型
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: ResponseDto,
  }) // 成功响应的描述
  @ApiResponse({
    status: 400,
    description: 'User already exists.',
    type: ResponseDto,
  }) // 错误响应的描述
  async register(@Body() userDto: UsersDto) {
    return this.userService.create(userDto);
  }

  @Get('find-by-email/:email')
  @ApiOperation({ summary: 'Find user by email' })
  @ApiResponse({ status: 200, description: 'User found.', type: ResponseDto })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
    type: ResponseDto,
  })
  async findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @Put('update-role/:email')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({ status: 200, description: 'User role updated.', type: ResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden.', type: ResponseDto })
  @ApiResponse({ status: 404, description: 'User not found.', type: ResponseDto })
  async updateUserRole(
    @Param('email') email: string,
    @Body('role') role: UserRole,
  ) {
    return this.userService.updateUserRole(email, role);
  }
}
