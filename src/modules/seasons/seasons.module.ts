import { Module } from '@nestjs/common';
import { SeasonsService } from './services/seasons.service';
import { SeasonsController } from './controllers/seasons.controller';

@Module({
  providers: [SeasonsService],
  controllers: [SeasonsController]
})
export class SeasonsModule {}
