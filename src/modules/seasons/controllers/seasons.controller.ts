import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeasonsService } from '../services/seasons.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SeasonDTO } from '../dto/season.dto';
import { UpdateSeasonDTO } from '../dto/updateSeason.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonService: SeasonsService) {}

  @Get()
  async getAllMovies(@Query() query: any) {
    return await this.seasonService.findAndCount(query);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'trailer',
        maxCount: 1,
      },
      {
        name: 'cover',
        maxCount: 1,
      },
    ]),
  )
  async createMovie(
    @Body() body: SeasonDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const season = await this.seasonService.createSeason(body, files);
    return {
      results: season,
      message: 'successful creation',
    };
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'trailer',
        maxCount: 1,
      },
      {
        name: 'cover',
        maxCount: 1,
      },
    ]),
  )
  async updateMovie(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UpdateSeasonDTO,
  ) {
    try {
      return await this.seasonService.updateSeason(body, id, files);
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteMovie(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.seasonService.deleteSeason(id);
  }
}
