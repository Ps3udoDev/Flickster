import { IsNumber, IsOptional, IsString } from 'class-validator';
import { SeasonEntity } from 'src/modules/seasons/entity/seasons.entity';

export class UpdateEpisodeDTO {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  synopsis: string;

  @IsOptional()
  @IsNumber()
  episodeNumber: number;

  @IsOptional()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  episodeUrl: string;

  @IsOptional()
  @IsString()
  coverUrl: string;

  @IsOptional()
  season: SeasonEntity;
}
