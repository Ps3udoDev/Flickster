import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/config/base.entity';
import { I_Season } from '../../../interfaces/season.interface';
import { SerieEntity } from '../../../modules/series/entity/series.entity';
import { EpisodeEntity } from '../../../modules/episodes/entity/episodes.entity';

@Entity({ name: 'seasons' })
export class SeasonEntity extends BaseEntity implements I_Season {
  @Column({ unique: true })
  title: string;

  @Column()
  seasonNumber: number;

  @Column()
  relaseYear: string;

  @Column()
  traillerUrl: string;

  @Column()
  coverUrl: string;

  @ManyToOne(() => SerieEntity, (serie) => serie.seasons)
  serie: SerieEntity;

  @OneToMany(() => EpisodeEntity, (episode) => episode.season)
  episodes: EpisodeEntity[];
}
