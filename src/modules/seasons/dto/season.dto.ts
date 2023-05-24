import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SerieEntity } from 'src/modules/series/entity/series.entity';

export class SeasonDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  seasonNumber: number;

  @IsNotEmpty()
  @IsString()
  relaseYear: string;

  @IsOptional()
  @IsString()
  traillerUrl: string;

  @IsOptional()
  @IsString()
  coverUrl: string;

  @IsNotEmpty()
  serie: SerieEntity;
}
