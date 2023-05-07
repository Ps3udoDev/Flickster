import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ROLES } from 'src/constants/roles';

export class UserDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsString()
  @IsOptional()
  token: string;

  @IsNotEmpty()
  @IsString()
  codePhone: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsString()
  imageURL: string;

  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
