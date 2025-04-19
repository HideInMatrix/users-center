import {
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@/prismac/prisma.service';
import { UsersDto } from './users.dto';
import { genSalt, hash } from 'bcryptjs';
import { generateId } from '@/utils/snowflake-id';
import { VOUtils } from '@/utils/voUtils';
import { UserRole, UserStatus } from '@prisma/client';
import { ResultVO } from '@/vo/result.vo';
import { generateToken, getExpirationTime } from '@/utils/utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

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

      // 创建用户并同时创建验证记录（事务操作）
      const [user, verification] = await this.prisma.$transaction([
        this.prisma.users.create({
          data: {
            id: id,
            name,
            email,
            password: hashedPassword,
            status: UserStatus.UNVERIFIED,
            role: UserRole.USER,
          },
        }),
        this.prisma.verification.create({
          data: {
            identifier: email, // 使用邮箱作为标识符
            token: generateToken(),
            expires: getExpirationTime(24), // 24 小时后过期
          },
        }),
      ]);

      // Remove password from response
      const { password: _, ...result } = user;
      return VOUtils.success({...result,...verification});
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

  async verifyEmail(token: string): Promise<ResultVO<any>> {
    try {
      // 查找验证记录
      const verification = await this.prisma.verification.findUnique({
        where: { token },
      });
  
      if (!verification) {
        return VOUtils.error(400, '无效的验证链接');
      }
  
      // 检查是否过期
      if (verification.expires < new Date()) {
        return VOUtils.error(400, '链接已过期');
      }
  
      // 更新用户状态为已验证
      await this.prisma.users.update({
        where: { email: verification.identifier },
        data: { status: UserStatus.VERIFIED },
      });
  
      // 删除验证记录
      await this.prisma.verification.delete({
        where: { token },
      });
  
      return VOUtils.success({ message: '邮箱验证成功' });
    } catch (error) {
      return VOUtils.error(500, `邮箱验证失败: ${error.message}`);
    }
  }
  
}
