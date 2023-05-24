import { Module } from '@nestjs/common';
import { SeasonsService } from './services/seasons.service';
import { SeasonsController } from './controllers/seasons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeasonEntity } from './entity/seasons.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([SeasonEntity]), UsersModule],
  providers: [SeasonsService],
  controllers: [SeasonsController],
  exports: [SeasonsService, TypeOrmModule],
})
export class SeasonsModule {}
