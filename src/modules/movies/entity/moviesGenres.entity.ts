import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/config/base.entity';
import { MovieEntity } from './movies.entity';
import { GenreEntity } from '../../../modules/genres/entity/genres.entity';

@Entity({ name: 'movies_genres' })
export class MoviesGenresEntity extends BaseEntity {
  @ManyToOne(() => MovieEntity, (movie) => movie.moviesGenres)
  movie: MovieEntity;

  @ManyToOne(() => GenreEntity, (genre) => genre.moviesIncludes)
  genre: GenreEntity;
}
