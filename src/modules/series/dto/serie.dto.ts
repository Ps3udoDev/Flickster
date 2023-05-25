import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SerieDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  synopsis: string;

  @IsNotEmpty()
  @IsString()
  relaseYear: string;

  @IsNotEmpty()
  @IsString()
  director: string;

  @IsNotEmpty()
  @IsString()
  clasification: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;
}
