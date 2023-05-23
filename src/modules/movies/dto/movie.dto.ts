import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class MovieDTO {
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
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsString()
  clasification: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsOptional()
  traillerUrl: string;

  @IsOptional()
  coverUrl: string;

  @IsOptional()
  movieUrl: string;
}
