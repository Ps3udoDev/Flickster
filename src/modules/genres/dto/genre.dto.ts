import { IsNotEmpty, IsString } from 'class-validator';

export class GenreDTO {
  @IsNotEmpty()
  @IsString()
  name: string;
}
