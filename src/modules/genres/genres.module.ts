import { Module } from '@nestjs/common';
import { GenresService } from './services/genres.service';
import { GenresController } from './controllers/genres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenreEntity } from './entity/genres.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([GenreEntity]), UsersModule],
  providers: [GenresService],
  controllers: [GenresController],
  exports: [GenresService, TypeOrmModule],
})
export class GenresModule {}
