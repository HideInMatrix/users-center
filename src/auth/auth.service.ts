import { UsersDto } from '@/users/users.dto';
import { UserService } from '@/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { VOUtils } from 'utils/voUtils';
import { jwtConstants } from './constants';
import { encryptPassword } from 'utils/cryptogram';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   * @param createUserDto
   * @returns
   */
  async register(createUserDto: UsersDto) {
    const { name, email, password } = createUserDto;
    const existUser = await this.userService.findByUserEmail(email);
    if (existUser) {
      throw new BadRequestException('注册用户已经存在');
    }

    const hashPwd = encryptPassword(password); // 加密密码
    createUserDto.password = hashPwd;

    return this.userService.create(createUserDto);
  }

  async login(loginUserDto: UsersDto) {
    const existUser = await this.validateUser(loginUserDto);
    return VOUtils.success({
      userId: existUser.id,
      token: await this.jwtService.signAsync(existUser, {
        secret: jwtConstants.secret,
      }),
    });
  }

  /**
   * 校验登录用户
   * @param user
   * @returns
   */
  async validateUser(user: UsersDto) {
    const { email, password } = user;
    const existUser = await this.userService.findByUserEmail(email);
    if (!existUser) {
      throw new BadRequestException('用户不存在');
    }
    const { password: encryptPwd } = existUser;
    const isOk = encryptPassword(password) === encryptPwd;
    if (!isOk) {
      throw new BadRequestException('登录密码错误');
    }
    return existUser;
  }
}
