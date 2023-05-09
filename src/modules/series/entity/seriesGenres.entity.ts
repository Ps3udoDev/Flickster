import { BaseEntity } from '../../../database/config/base.entity';
import { GenreEntity } from '../../../modules/genres/entity/genres.entity';
import { Entity, ManyToOne } from 'typeorm';
import { SerieEntity } from './series.entity';

@Entity({ name: 'series_genres' })
export class SeriesGenresEntity extends BaseEntity {
  @ManyToOne(() => SerieEntity, (serie) => serie.seriesGenres)
  serie: SerieEntity;

  @ManyToOne(() => GenreEntity, (genre) => genre.seriesIncludes)
  genre: GenreEntity;
}
