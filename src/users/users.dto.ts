import { IsOptional, IsString, MinLength } from 'class-validator';
export class UsersDto {
  public id: number;

  @MinLength(2)
  @IsString()
  @IsOptional()
  public name: string | null;

  @IsString()
  public email: string;

  @IsString()
  public password: string;
}
