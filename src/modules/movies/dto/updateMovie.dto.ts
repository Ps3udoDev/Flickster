import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMovieDTO {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  synopsis: string;

  @IsOptional()
  @IsString()
  relaseYear: string;

  @IsOptional()
  @IsString()
  director: string;

  @IsOptional()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  clasification: string;

  @IsOptional()
  @IsNumber()
  rating: number;

  @IsOptional()
  traillerUrl: string;

  @IsOptional()
  coverUrl: string;

  @IsOptional()
  movieUrl: string;
}
