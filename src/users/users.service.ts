import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prismac/prisma.service';
import { UsersDto } from './users.dto';
import { genSalt, hash } from 'bcryptjs';
import { generateId } from '@/utils/snowflake-id';
import { VOUtils } from '@/utils/voUtils';
import { UserRole, UserStatus } from '@prisma/client';
import { ResultVO } from '@/vo/result.vo';
import { replacer } from '@/utils/utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: UsersDto): Promise<ResultVO<any>> {
    try {
      const { name, email, password } = createUserDto;

      // Check if user exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        return VOUtils.error(400, '邮箱已存在');
      }

      // Hash password
      const salt = await genSalt();
      const hashedPassword = await hash(password, salt);

      // Generate snowflake ID using generateId function
      const id = BigInt(generateId());

      // Create user - always use USER role regardless of what was passed in
      const user = await this.prisma.users.create({
        data: {
          id: id,
          name,
          email,
          password: hashedPassword,
          status: UserStatus.UNVERIFIED,
          role: UserRole.USER, // 强制使用USER角色，忽略传入的role值
        },
      });

      // Remove password from response
      const { password: _, ...result } = user;
      return VOUtils.success(result);
    } catch (error) {
      return VOUtils.error(500, `创建用户失败: ${error.message}`);
    }
  }

  async findByEmail(email: string): Promise<ResultVO<any>> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return VOUtils.error(404, '用户不存在');
      }

      return VOUtils.success(user);
    } catch (error) {
      return VOUtils.error(500, `查询用户失败: ${error.message}`);
    }
  }

  async findById(id: string): Promise<ResultVO<any>> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id: BigInt(id) },
      });

      if (!user) {
        return VOUtils.error(404, '用户不存在');
      }

      // Remove password from response
      const { password, ...result } = user;
      return VOUtils.success(result);
    } catch (error) {
      return VOUtils.error(500, `查询用户失败: ${error.message}`);
    }
  }

  async updateUserStatus(
    email: string,
    status: UserStatus,
  ): Promise<ResultVO<any>> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return VOUtils.error(404, '用户不存在');
      }

      const updatedUser = await this.prisma.users.update({
        where: { email },
        data: { status },
      });

      return VOUtils.success(updatedUser);
    } catch (error) {
      return VOUtils.error(500, `更新用户状态失败: ${error.message}`);
    }
  }

  async updateUserRole(email: string, role: UserRole): Promise<ResultVO<any>> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
      });

      if (!user) {
        return VOUtils.error(404, '用户不存在');
      }

      const updatedUser = await this.prisma.users.update({
        where: { email },
        data: { role },
      });

      // Remove password from response
      const { password, ...result } = updatedUser;
      return VOUtils.success(result);
    } catch (error) {
      return VOUtils.error(500, `更新用户角色失败: ${error.message}`);
    }
  }
}
