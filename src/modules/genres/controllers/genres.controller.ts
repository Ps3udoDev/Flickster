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
import { GenresService } from '../services/genres.service';
import { GenreDTO } from '../dto/genre.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genreServices: GenresService) {}

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
    description: 'List of genres',
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
              name: { type: 'string' },
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
  async getAllGenres(@Query() query: any) {
    return await this.genreServices.findAndCount(query);
  }

  @ApiBearerAuth()
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Fields needed to create a new genre',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
    required: true,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: {
          type: 'array',
          items: { type: 'string' },
        },
        error: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
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
  @ApiConflictResponse({
    description: 'Duplicate key violation: Name already exists',
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
            name: { type: 'string' },
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
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createGenre(@Body() body: GenreDTO) {
    const genre = await this.genreServices.createGenre(body);
    return {
      results: genre,
      message: 'successful creation',
    };
  }

  @ApiNotFoundResponse({
    description: 'Genre not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
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
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        name: { type: 'string' },
      },
    },
  })
  @Get(':id')
  async getGenreById(@Param('id') id: string) {
    return await this.genreServices.findGenreByIdOr404(id);
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Fields needed to modify a genre',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    },
    required: true,
  })
  @ApiUnauthorizedResponse({
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
  @ApiOkResponse({
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        generatedMaps: { type: 'array' },
        raw: { type: 'array' },
        affected: { type: 'number' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
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
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateGenre(@Param('id') id: string, @Body() body: GenreDTO) {
    try {
      return await this.genreServices.updateGenre(body, id);
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
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
  @ApiOkResponse({
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        raw: { type: 'array' },
        affected: { type: 'number' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
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
    return await this.genreServices.deleteGenre(id);
  }
}
