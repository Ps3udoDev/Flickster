import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from '../services/movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

  @Get()
  async getAllMovies(@Query() query: any) {
    return await this.movieService.findAndCount(query);
  }
}
