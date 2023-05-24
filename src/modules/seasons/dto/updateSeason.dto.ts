import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SerieEntity } from 'src/modules/series/entity/series.entity';

export class UpdateSeasonDTO {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  seasonNumber: number;

  @IsOptional()
  @IsString()
  relaseYear: string;

  @IsOptional()
  @IsString()
  traillerUrl: string;

  @IsOptional()
  @IsString()
  coverUrl: string;

  @IsOptional()
  serie: SerieEntity;
}
