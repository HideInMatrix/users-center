import { IsString, MinLength } from 'class-validator';
export class UsersDto {
  public id: string;

  @MinLength(2)
  @IsString()
  public name: string;
  @IsString()
  public email: string;
}
