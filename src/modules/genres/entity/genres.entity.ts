import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/config/base.entity';
import { I_Genre } from '../../../interfaces/genre.interface';
import { MoviesGenresEntity } from '../../../modules/movies/entity/moviesGenres.entity';
import { SeriesGenresEntity } from '../../../modules/series/entity/seriesGenres.entity';

@Entity({ name: 'genres' })
export class GenreEntity extends BaseEntity implements I_Genre {
  @Column({ unique: true })
  name: string;

  @OneToMany(() => MoviesGenresEntity, (movieGenre) => movieGenre.genre)
  moviesIncludes: MoviesGenresEntity[];

  @OneToMany(() => SeriesGenresEntity, (serieGenre) => serieGenre.genre)
  seriesIncludes: SeriesGenresEntity[];
}
