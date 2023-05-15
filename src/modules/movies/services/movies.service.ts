import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from '../entity/movies.entity';
import { Repository } from 'typeorm';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly movieRepository: Repository<MovieEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<MovieEntity>> {
    try {
      const { id, size = 10, page = 1 } = query;
      const numericSize = +size;
      const numericPage = +page;
      const where = id ? { id } : {};

      const [movies, count] = await this.movieRepository.findAndCount({
        where,
        select: [
          'id',
          'title',
          'synopsis',
          'relaseYear',
          'director',
          'duration',
          'traillerUrl',
          'coverUrl',
          'movieUrl',
          'clasification',
          'rating',
        ],
        take: numericSize,
        skip: (numericPage - 1) * numericSize,
      });

      const totalPages = numericSize === 0 ? 1 : Math.ceil(count / numericSize);

      return {
        count,
        totalPages,
        currentPage: page,
        results: movies,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
