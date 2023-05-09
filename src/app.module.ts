import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './database/config/data.source';
import { AuthModule } from './modules/auth/auth.module';
import { MoviesModule } from './modules/movies/movies.module';
import { GenresModule } from './modules/genres/genres.module';
import { SeriesModule } from './modules/series/series.module';
import { SeasonsModule } from './modules/seasons/seasons.module';
import { EpisodesModule } from './modules/episodes/episodes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    AuthModule,
    MoviesModule,
    GenresModule,
    SeriesModule,
    SeasonsModule,
    EpisodesModule,
  ],
})
export class AppModule {}
