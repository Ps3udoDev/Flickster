import { Module } from '@nestjs/common';
import { MoviesService } from './services/movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieEntity } from './entity/movies.entity';
import { MoviesController } from './controllers/movies.controller';
import { UsersModule } from '../users/users.module';
import { GenreEntity } from '../genres/entity/genres.entity';
import { MoviesGenresEntity } from './entity/moviesGenres.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovieEntity, GenreEntity, MoviesGenresEntity]),
    UsersModule,
  ],
  providers: [MoviesService],
  controllers: [MoviesController],
  exports: [MoviesService, TypeOrmModule],
})
export class MoviesModule {}
