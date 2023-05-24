import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EpisodesService } from '../services/episodes.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EpisodeDTO } from '../dto/episode.dto';
import { UpdateEpisodeDTO } from '../dto/updateEpisode.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodeService: EpisodesService) {}
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'episode',
        maxCount: 1,
      },
      {
        name: 'cover',
        maxCount: 1,
      },
    ]),
  )
  async createEpisode(
    @Body() body: EpisodeDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const episode = await this.episodeService.createEpisode(body, files);
    return {
      results: episode,
      message: 'successful creation',
    };
  }

  @Get(':id')
  async getMovieById(@Param('id') id: string) {
    return await this.episodeService.findEpisodeByIdOr404(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'episode',
        maxCount: 1,
      },
      {
        name: 'cover',
        maxCount: 1,
      },
    ]),
  )
  async updateEpisode(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UpdateEpisodeDTO,
  ) {
    try {
      return await this.episodeService.updateEpisode(body, id, files);
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
    return await this.episodeService.deleteEpisode(id);
  }
}
