import { Module } from '@nestjs/common';
import { EpisodesService } from './services/episodes.service';
import { EpisodesController } from './controllers/episodes.controller';

@Module({
  providers: [EpisodesService],
  controllers: [EpisodesController],
})
export class EpisodesModule {}
