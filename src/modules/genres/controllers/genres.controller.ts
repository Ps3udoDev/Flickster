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
import { ApiTags } from '@nestjs/swagger';
import { GenresService } from '../services/genres.service';
import { GenreDTO } from '../dto/genre.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genreServices: GenresService) {}

  @Get()
  async getAllGenres(@Query() query: any) {
    return await this.genreServices.findAndCount(query);
  }

  @Post()
  async createGenre(@Body() body: GenreDTO) {
    const genre = await this.genreServices.createGenre(body);
    return {
      results: genre,
      message: 'successful creation',
    };
  }

  @Get(':id')
  async getGenreById(@Param('id') id: string) {
    return await this.genreServices.findGenreByIdOr404(id);
  }

  @Patch(':id')
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

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteMovie(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.genreServices.deleteGenre(id);
  }
}
