import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prismac/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CleanupTasks {
  private readonly logger = new Logger(CleanupTasks.name);
  private readonly UNVERIFIED_EXPIRE_DAYS: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // 从环境变量读取配置（默认 2 天）
    this.UNVERIFIED_EXPIRE_DAYS = this.configService.get<number>(
      'UNVERIFIED_EXPIRE_DAYS',
      2,
    );
  }

  @Cron('0 3 * * *') // 每天凌晨3点执行
  async cleanExpiredData() {
    await this.cleanExpiredVerifications();
    await this.cleanUnverifiedUsers();
  }

  // 清理过期验证记录
  private async cleanExpiredVerifications() {
    try {
      const { count } = await this.prisma.verification.deleteMany({
        where: { expires: { lt: new Date() } },
      });
      this.logger.log(`清理过期验证记录: ${count} 条`);
    } catch (error) {
      this.logger.error('清理验证记录失败:', error.message);
    }
  }

  // 清理未激活用户
  private async cleanUnverifiedUsers() {
    try {
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() - this.UNVERIFIED_EXPIRE_DAYS);

      const { count } = await this.prisma.$transaction(async (tx) => {
        // 1. 删除未激活用户
        const deletedUsers = await tx.users.deleteMany({
          where: {
            status: 'UNVERIFIED',
            createdAt: { lt: expireDate },
          },
        });

        // 2. 级联删除关联的验证记录
        await tx.verification.deleteMany({
          where: {
            identifier: {
              in: (
                await tx.users.findMany({
                  where: {
                    status: 'UNVERIFIED',
                    createdAt: { lt: expireDate },
                  },
                  select: { email: true },
                })
              ).map((u:{email:string}) => u.email),
            },
          },
        });

        return deletedUsers;
      });

      this.logger.log(`清理未激活用户: ${count} 个`);
    } catch (error) {
      this.logger.error('清理未激活用户失败:', error.message);
    }
  }
}