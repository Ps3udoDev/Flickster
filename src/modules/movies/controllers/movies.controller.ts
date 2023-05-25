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
import { MoviesService } from '../services/movies.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MovieDTO } from '../dto/movie.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateMovieDTO } from '../dto/updateMovie.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

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
  @ApiOkResponse({
    description: 'Success',
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
              duration: { type: 'number' },
              traillerUrl: { type: 'string' },
              coverUrl: { type: 'string' },
              movieUrl: { type: 'string' },
              clasification: { type: 'string' },
              rating: { type: 'number' },
              moviesGenres: {
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
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @Get()
  async getAllMovies(@Query() query: any) {
    return await this.movieService.findAndCount(query);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        synopsis: { type: 'string' },
        relaseYear: { type: 'string' },
        director: { type: 'string' },
        duration: { type: 'number' },
        clasification: { type: 'string' },
        rating: { type: 'number' },
        trailer: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
        movie: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'title',
        'synopsis',
        'relaseYear',
        'director',
        'duration',
        'clasification',
        'rating',
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing Authorization header' })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            synopsis: { type: 'string' },
            relaseYear: { type: 'string' },
            director: { type: 'string' },
            duration: { type: 'number' },
            traillerUrl: { type: 'string' },
            coverUrl: { type: 'string' },
            movieUrl: { type: 'string' },
            clasification: { type: 'string' },
            rating: { type: 'number' },
            id: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Conflict',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'movie',
        maxCount: 1,
      },
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
    @Body() body: MovieDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const movie = await this.movieService.createMovie(body, files);
    return {
      results: movie,
      message: 'successful creation',
    };
  }

  @ApiNotFoundResponse({ description: 'NOT_FOUND :: Genre not found' })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Success',
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
        duration: { type: 'number' },
        traillerUrl: { type: 'string' },
        coverUrl: { type: 'string' },
        movieUrl: { type: 'string' },
        clasification: { type: 'string' },
        rating: { type: 'number' },
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
  @Get(':id')
  async getMovieById(@Param('id') id: string) {
    return await this.movieService.findMovieByIdOr404(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields to update a movie',
    schema: {
      type: 'object',
      properties: {
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
        duration: {
          type: 'number',
        },
        classification: {
          type: 'string',
        },
        rating: {
          type: 'number',
        },
        trailer: {
          type: 'string',
          format: 'binary',
        },
        cover: {
          type: 'string',
          format: 'binary',
        },
        movie: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Movie updated successfully',
    schema: {
      type: 'object',
      properties: {
        raw: {
          type: 'array',
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
        name: 'movie',
        maxCount: 1,
      },
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
    @Body() body: UpdateMovieDTO,
  ) {
    try {
      return await this.movieService.updateMovie(body, id, files);
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Token expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Movie deleted successfully',
    schema: {
      type: 'object',
      properties: {
        raw: {
          type: 'array',
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
    return await this.movieService.deleteMovie(id);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Token expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Movie created successfully',
    schema: {
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
        synopsis: {
          type: 'string',
        },
        releaseYear: {
          type: 'string',
        },
        director: {
          type: 'string',
        },
        duration: {
          type: 'number',
        },
        trailerUrl: {
          type: 'string',
        },
        coverUrl: {
          type: 'string',
        },
        movieUrl: {
          type: 'string',
        },
        classification: {
          type: 'string',
        },
        rating: {
          type: 'number',
        },
        moviesGenres: {
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
  @Post(':movieId/genres/:genreId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async addGenreToMovie(
    @Param('movieId') movieId: string,
    @Param('genreId') genreId: string,
  ) {
    return this.movieService.addGenreToMovie(movieId, genreId);
  }

  @ApiResponse({
    status: 200,
    description: 'List of genres and movies',
    schema: {
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
        moviesIncludes: {
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
              movie: {
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
                  synopsis: {
                    type: 'string',
                  },
                  releaseYear: {
                    type: 'string',
                  },
                  director: {
                    type: 'string',
                  },
                  duration: {
                    type: 'number',
                  },
                  trailerUrl: {
                    type: 'string',
                  },
                  coverUrl: {
                    type: 'string',
                  },
                  movieUrl: {
                    type: 'string',
                  },
                  classification: {
                    type: 'string',
                  },
                  rating: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
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
  @Get('genres/:genreId')
  async getAllMoviesByGenre(@Param('genreId') genreId: string) {
    return await this.movieService.getAllMoviesByGenre(genreId);
  }
}
