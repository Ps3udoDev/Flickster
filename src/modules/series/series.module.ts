import { Module } from '@nestjs/common';
import { SeriesService } from './services/series.service';
import { SeriesController } from './controllers/series.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SerieEntity } from './entity/series.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SerieEntity]), UsersModule],
  providers: [SeriesService],
  controllers: [SeriesController],
  exports: [SeriesService, TypeOrmModule],
})
export class SeriesModule {}
