import { SeasonEntity } from '../../../modules/seasons/entity/seasons.entity';
import { BaseEntity } from '../../../database/config/base.entity';
import { I_Episode } from '../../../interfaces/episode.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'episodes' })
export class EpisodeEntity extends BaseEntity implements I_Episode {
  @Column()
  title: string;

  @Column()
  synopsis: string;

  @Column()
  episodeNumber: number;

  @Column()
  duration: number;

  @Column()
  episodeUrl: string;

  @Column()
  coverUrl: string;

  @ManyToOne(() => SeasonEntity, (season) => season.episodes)
  season: SeasonEntity;
}
