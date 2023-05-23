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
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MovieDTO } from '../dto/movie.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateMovieDTO } from '../dto/updateMovie.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

  @Get()
  async getAllMovies(@Query() query: any) {
    return await this.movieService.findAndCount(query);
  }

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
  async createMovie(
    @Body() body: MovieDTO,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const movie = this.movieService.createMovie(body, files);
    return {
      results: movie,
      message: 'successful creation',
    };
  }

  @Get(':id')
  async getMovieById(@Param('id') id: string) {
    return await this.movieService.findMovieByIdOr404(id);
  }

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

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteMovie(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.movieService.deleteMovie(id);
  }
}
