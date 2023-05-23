import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSerieDTO {
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
  @IsString()
  clasification: string;

  @IsOptional()
  @IsNumber()
  rating: number;
}
