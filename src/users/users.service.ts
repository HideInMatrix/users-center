import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UsersDto } from './users.dto';
import { generateId } from 'utils/snowflake-id';
import { replacer } from 'utils';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByUserEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: { email: email },
    });

    return JSON.parse(JSON.stringify(user, replacer));
  }

  async create(userDto: UsersDto) {
    const createdUser = await this.prisma.users.create({
      data: {
        id: generateId(),
        email: userDto.email,
        name: userDto.name,
        password: userDto.password,
      },
    });

    return JSON.parse(JSON.stringify(createdUser, replacer));
  }
}
