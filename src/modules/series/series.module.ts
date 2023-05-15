import { Module } from '@nestjs/common';
import { SeriesService } from './services/series.service';
import { SeriesController } from './controllers/series.controller';

@Module({
  providers: [SeriesService],
  controllers: [SeriesController]
})
export class SeriesModule {}
