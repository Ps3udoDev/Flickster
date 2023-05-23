import { Module } from '@nestjs/common';
import { MoviesService } from './services/movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movies.entity';
import { MoviesController } from './controllers/movies.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([MovieEntity]), UsersModule],
  providers: [MoviesService],
  controllers: [MoviesController],
  exports: [MoviesService, TypeOrmModule],
})
export class MoviesModule {}
