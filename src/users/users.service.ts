import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prismac/prisma.service';
import { UsersDto } from './users.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByUserEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async create(userDto: UsersDto) {
    const createdUser = await this.prisma.user.create({
      data: {
        email: userDto.email,
        name: userDto.name,
        password: userDto.password,
      },
    });

    return createdUser;
  }
}
