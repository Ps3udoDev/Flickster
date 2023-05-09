import { Module } from '@nestjs/common';
import { MoviesService } from './services/movies.service';

@Module({
  providers: [MoviesService],
})
export class MoviesModule {}
