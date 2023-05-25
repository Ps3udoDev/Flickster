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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EpisodesService } from '../services/episodes.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EpisodeDTO } from '../dto/episode.dto';
import { UpdateEpisodeDTO } from '../dto/updateEpisode.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@ApiTags('Episodes')
@Controller('episodes')
export class EpisodesController {
  constructor(private readonly episodeService: EpisodesService) {}

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields needed to create a new episode',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        synopsis: {
          type: 'string',
        },
        episodeNumber: {
          type: 'number',
        },
        duration: {
          type: 'number',
        },
        episode: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
        season: {
          type: 'string',
        },
      },
      required: ['title', 'synopsis', 'episodeNumber', 'duration', 'season'],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Success: Episode created',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            synopsis: { type: 'string' },
            episodeNumber: { type: 'number' },
            duration: { type: 'number' },
            episodeUrl: { type: 'string' },
            coverUrl: { type: 'string' },
            season: { type: 'string' },
            id: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
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

  @ApiResponse({
    status: 200,
    description: 'Success: Episode details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        title: { type: 'string' },
        synopsis: { type: 'string' },
        episodeNumber: { type: 'number' },
        duration: { type: 'number' },
        episodeUrl: { type: 'string' },
        coverUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Episode not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Get(':id')
  async getEpisodeById(@Param('id') id: string) {
    return await this.episodeService.findEpisodeByIdOr404(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields to update an episode',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        synopsis: {
          type: 'string',
        },
        episodeNumber: {
          type: 'number',
        },
        duration: {
          type: 'number',
        },
        episode: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
        season: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Success: Episode updated',
    schema: {
      type: 'object',
      properties: {
        generatedMaps: {},
        raw: {},
        affected: { type: 'number' },
      },
    },
  })
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
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

  @ApiBearerAuth()
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Success: Episode deleted',
    schema: {
      type: 'object',
      properties: {
        generatedMaps: {},
        raw: {},
        affected: { type: 'number' },
      },
    },
  })
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteMovie(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.episodeService.deleteEpisode(id);
  }
}
