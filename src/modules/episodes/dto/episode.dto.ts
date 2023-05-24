import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { SeasonEntity } from 'src/modules/seasons/entity/seasons.entity';

export class EpisodeDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  synopsis: string;

  @IsNotEmpty()
  @IsNumber()
  episodeNumber: number;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  episodeUrl: string;

  @IsOptional()
  @IsString()
  coverUrl: string;

  @IsNotEmpty()
  season: SeasonEntity;
}
