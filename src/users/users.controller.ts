import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './users.service';
import { User as UserModel } from '@prisma/client';
import { UsersDto } from './users.dto';
import { VOUtils } from '@/utils/voUtils';

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async signupUser(@Body() userData: UsersDto): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Post('update')
  async updateUser(@Body() userData: UsersDto): Promise<VOUtils> {
    return this.userService.updateUser({
      where: { id: Number.parseInt(userData.id) },
      data: { name: userData.name, email: userData.email },
    });
  }
}
