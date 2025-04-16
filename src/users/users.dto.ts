import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
export class UsersDto {
  public id: string;

  @ApiProperty({ description: "User's full name", example: 'John Doe' })
  @IsOptional()
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  public name: string;

  @ApiProperty({
    description: "User's email address",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @ApiProperty({
    description: "User's password (min 8 characters)",
    example: 'Password123',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  public password: string;

  @ApiProperty({
    description: "User's role",
    example: 'USER',
    default: 'USER'
  })
  public role: UserRole = UserRole.USER
}
