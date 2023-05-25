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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SeasonsService } from '../services/seasons.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SeasonDTO } from '../dto/season.dto';
import { UpdateSeasonDTO } from '../dto/updateSeason.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@ApiTags('Seasons')
@Controller('seasons')
export class SeasonsController {
  constructor(private readonly seasonService: SeasonsService) {}

  @ApiQuery({
    name: 'size',
    description: 'Número de resultados por página',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    description: 'Página actual',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of movies and series',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
        },
        totalPages: {
          type: 'number',
        },
        currentPage: {
          type: 'number',
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
              title: {
                type: 'string',
              },
              synopsis: {
                type: 'string',
              },
              releaseYear: {
                type: 'string',
              },
              director: {
                type: 'string',
              },
              classification: {
                type: 'string',
              },
              rating: {
                type: 'number',
              },
              seasons: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                    title: {
                      type: 'string',
                    },
                    seasonNumber: {
                      type: 'number',
                    },
                    releaseYear: {
                      type: 'string',
                    },
                    trailerUrl: {
                      type: 'string',
                    },
                    coverUrl: {
                      type: 'string',
                    },
                  },
                },
              },
              seriesGenres: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                    genre: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                        createdAt: {
                          type: 'string',
                          format: 'date-time',
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                        },
                        name: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
  @Get()
  async getAllMovies(@Query() query: any) {
    return await this.seasonService.findAndCount(query);
  }

  @ApiOkResponse({
    status: 200,
    description: 'Success: Season retrieved',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        title: { type: 'string' },
        seasonNumber: { type: 'number' },
        relaseYear: { type: 'string' },
        traillerUrl: { type: 'string' },
        coverUrl: { type: 'string' },
        episodes: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Bad Request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Get(':id')
  async geteasonById(@Param('id') id: string) {
    return await this.seasonService.getSeasonById(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields needed to register a new user',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        seasonNumber: {
          type: 'number',
        },
        relaseYear: {
          type: 'string',
        },
        trailer: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
        serie: {
          type: 'string',
        },
      },
      required: ['title', 'seasonNumber', 'relaseYear', 'serie'],
    },
    required: true,
  })
  @ApiConflictResponse({
    description:
      'Duplicate key violation: Unique constraint "UQ_4c3dd31215ca61224818b54cd01" violated',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiConflictResponse({
    description:
      'Invalid input syntax for type uuid: "4ad2140c-59ad-4434-ad2d-fb54bf5008ar"',
  })
  @ApiCreatedResponse({
    description: 'Success: Season created',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            seasonNumber: { type: 'string' },
            relaseYear: { type: 'string' },
            traillerUrl: { type: 'string' },
            coverUrl: { type: 'string' },
            serie: { type: 'string' },
            id: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        message: {
          type: 'string',
        },
      },
    },
  })
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
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

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields to update a season',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
        },
        seasonNumber: {
          type: 'number',
        },
        relaseYear: {
          type: 'string',
        },
        trailer: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
        serie: {
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
    description: 'Success: Season updated',
    schema: {
      type: 'object',
      properties: {
        generatedMaps: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        raw: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        affected: {
          type: 'number',
        },
      },
    },
  })
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
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
    description: 'Success: Season deleted',
    schema: {
      type: 'object',
      properties: {
        generatedMaps: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        raw: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        affected: {
          type: 'number',
        },
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
    return await this.seasonService.deleteSeason(id);
  }
  @ApiQuery({
    name: 'size',
    description: 'Número de resultados por página',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    description: 'Página actual',
    required: false,
    type: Number,
  })
  @Get(':seasonId/episodes')
  async getEpisodesBySeasonId(
    @Param('seasonId') seasonId: string,
    @Query() query: any,
  ) {
    return await this.seasonService.getEpisodesBySeason(seasonId, query);
  }
}
