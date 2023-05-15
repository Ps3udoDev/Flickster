import { BaseEntity } from '../../../database/config/base.entity';
import { I_Serie } from '../../../interfaces/serie.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { SeriesGenresEntity } from './seriesGenres.entity';
import { SeasonEntity } from '../../../modules/seasons/entity/seasons.entity';
@Entity({ name: 'series' })
export class SerieEntity extends BaseEntity implements I_Serie {
  @Column({ unique: true })
  title: string;

  @Column()
  synopsis: string;

  @Column()
  relaseYear: string;

  @Column()
  director: string;

  @Column()
  clasification: string;

  @Column()
  rating: number;

  @OneToMany(() => SeriesGenresEntity, (serieGenre) => serieGenre.serie)
  seriesGenres: SeriesGenresEntity[];

  @OneToMany(() => SeasonEntity, (season) => season.serie)
  seasons: SeasonEntity[];
}
