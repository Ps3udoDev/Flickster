import { IsNotEmpty, IsString } from 'class-validator';

export class RestorePasswordDTO {
  @IsNotEmpty()
  @IsString()
  email: string;
}
