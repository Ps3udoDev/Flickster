import { Module } from '@nestjs/common';
import { EpisodesService } from './services/episodes.service';
import { EpisodesController } from './controllers/episodes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EpisodeEntity } from './entity/episodes.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([EpisodeEntity]), UsersModule],
  providers: [EpisodesService],
  controllers: [EpisodesController],
  exports: [EpisodesService, TypeOrmModule],
})
export class EpisodesModule {}
