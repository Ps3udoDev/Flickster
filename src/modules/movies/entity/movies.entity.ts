import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/config/base.entity';
import { I_Movie } from '../../../interfaces/movie.interface';
import { MoviesGenresEntity } from './moviesGenres.entity';

@Entity({ name: 'movies' })
export class MovieEntity extends BaseEntity implements I_Movie {
  @Column()
  title: string;

  @Column()
  synopsis: string;

  @Column()
  relaseYear: string;

  @Column()
  director: string;

  @Column()
  duration: number;

  @Column()
  traillerUrl: string;

  @Column()
  coverUrl: string;

  @Column()
  movieUrl: string;

  @Column()
  clasification: string;

  @Column()
  rating: number;

  @OneToMany(() => MoviesGenresEntity, (movieGenre) => movieGenre.movie)
  moviesGenres: MoviesGenresEntity[];
}
