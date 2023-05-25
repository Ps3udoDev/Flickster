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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SeriesService } from '../services/series.service';
import { SerieDTO } from '../dto/serie.dto';
import { UpdateSerieDTO } from '../dto/updateSerie.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly serieService: SeriesService) {}

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
    description: 'Success: Series details',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              synopsis: { type: 'string' },
              relaseYear: { type: 'string' },
              director: { type: 'string' },
              clasification: { type: 'string' },
              rating: { type: 'number' },
              seasons: {
                type: 'array',
                items: {
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
                  },
                },
              },
              seriesGenres: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    genre: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        name: { type: 'string' },
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
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  @Get()
  async getAllSeries(@Query() query: any) {
    return await this.serieService.findAndCount(query);
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
    status: 400,
    description: 'Bad Request: Duplicate key violation',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        synopsis: { type: 'string' },
        relaseYear: { type: 'string' },
        director: { type: 'string' },
        clasification: { type: 'string' },
        rating: { type: 'number' },
      },
      required: [
        'title',
        'synopsis',
        'relaseYear',
        'director',
        'clasification',
        'rating',
      ],
    },
  })
  @Post()
  async createSerie(@Body() body: SerieDTO) {
    const serie = await this.serieService.createSerie(body);
    return {
      results: serie,
      message: 'successful creation',
    };
  }

  @ApiResponse({
    status: 400,
    description: 'Bad Request: Not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Success: Series details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        title: { type: 'string' },
        synopsis: { type: 'string' },
        relaseYear: { type: 'string' },
        director: { type: 'string' },
        clasification: { type: 'string' },
        rating: { type: 'number' },
        seasons: {
          type: 'array',
          items: {
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
            },
          },
        },
        seriesGenres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              genre: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get(':id')
  async getSerieById(@Param('id') id: string) {
    return await this.serieService.findSerieByIdOr404(id);
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
    status: 400,
    description: 'Bad Request: Not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        synopsis: { type: 'string' },
        relaseYear: { type: 'string' },
        director: { type: 'string' },
        clasification: { type: 'string' },
        rating: { type: 'number' },
      },
    },
  })
  @Patch(':id')
  async updateSerie(@Param('id') id: string, @Body() body: UpdateSerieDTO) {
    try {
      return await this.serieService.updateSerie(body, id);
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
    description: 'Success: Series deleted',
    schema: {
      type: 'object',
      properties: {
        generatedMaps: { type: 'array', items: {} },
        raw: { type: 'array', items: {} },
        affected: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid UUID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteMovie(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.serieService.deleteSerie(id);
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
    status: 400,
    description: 'Bad Request: Not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        title: { type: 'string' },
        synopsis: { type: 'string' },
        relaseYear: { type: 'string' },
        director: { type: 'string' },
        clasification: { type: 'string' },
        rating: { type: 'number' },
        seriesGenres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @Post(':serieId/genres/:genreId')
  async addGenreToMovie(
    @Param('serieId') serieId: string,
    @Param('genreId') genreId: string,
  ) {
    return this.serieService.addGenreToSerie(serieId, genreId);
  }

  @ApiResponse({
    status: 400,
    description: 'Bad Request: Not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid UUID',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Success: Series found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        name: { type: 'string' },
        seriesIncludes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              serie: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                  title: { type: 'string' },
                  synopsis: { type: 'string' },
                  relaseYear: { type: 'string' },
                  director: { type: 'string' },
                  clasification: { type: 'string' },
                  rating: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
  })
  @Get('genres/:genreId')
  async getAllMoviesByGenre(@Param('genreId') genreId: string) {
    return await this.serieService.getAllSeriesByGenre(genreId);
  }
}
