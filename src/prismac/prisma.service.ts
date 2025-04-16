import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    for (let retries = 5; retries > 0; retries--) {
      try {
        await this.$connect();
        break;
      } catch (error) {
        if (retries === 1) {
          throw error;
        }
        await new Promise((res) => setTimeout(res, 5000)); // 5秒重试一次
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
