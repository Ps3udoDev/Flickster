import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ROLES } from 'src/constants/roles';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  codePhone: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsString()
  imageURL: string;

  @IsOptional()
  @IsEnum(ROLES)
  role: ROLES;

  @IsBoolean()
  isActive: boolean;
}
