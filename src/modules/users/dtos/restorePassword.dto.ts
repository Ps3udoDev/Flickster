import { IsNotEmpty, IsString } from 'class-validator';

export class EmailRestorePasswordDTO {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class PasswordRestorePasswordDTO {
  @IsNotEmpty()
  @IsString()
  password: string;
}
