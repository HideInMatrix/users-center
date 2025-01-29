import {
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';
import { UserRole, UserStatus } from './user.enum'; // 你需要自己定义枚举文件

export class UsersDto {
  @IsOptional() // id 是自动生成的，创建时不需要传递
  public id: BigInt;

  @MinLength(2)
  @IsString()
  @IsOptional()
  public name: string;

  @IsEmail() // 验证邮箱格式
  @IsString()
  public email: string;

  @MinLength(6) // 假设密码长度最少6个字符
  @IsString()
  public password: string;

  @IsEnum(UserRole) // 验证角色字段
  @IsOptional()
  public role: UserRole = UserRole.USER; // 默认值为 USER

  @IsEnum(UserStatus) // 验证状态字段
  @IsOptional()
  public status: UserStatus = UserStatus.UNVERIFIED; // 默认值为 UNVERIFIED
}
