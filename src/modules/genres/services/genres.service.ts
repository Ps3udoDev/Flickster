import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GenreEntity } from '../entity/genres.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { ErrorManager } from 'src/utils/error.manager';
import { GenreDTO } from '../dto/genre.dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(GenreEntity)
    private readonly genreRepository: Repository<GenreEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<GenreEntity>> {
    try {
      const { id, size = 10, page = 1 } = query;
      const numericSize = +size;
      const numericPage = +page;
      const where: any = {};

      if (id) where.id = id;

      const [genres, count] = await this.genreRepository.findAndCount({
        where,
        select: ['id', 'name'],
        take: numericSize,
        skip: (numericPage - 1) * numericSize,
      });

      const totalPages = numericSize === 0 ? 1 : Math.ceil(count / numericSize);

      return {
        count,
        totalPages,
        currentPage: page,
        results: genres,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createGenre(body: GenreDTO): Promise<GenreEntity> {
    const queryRunner =
      this.genreRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const genre = await this.genreRepository.save({ ...body });
      await queryRunner.commitTransaction();
      return genre;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    } finally {
      await queryRunner.release();
    }
  }

  async findGenreByIdOr404(id: string): Promise<GenreEntity> {
    try {
      const genre = await this.genreRepository
        .createQueryBuilder('genre')
        .where({ id })
        .getOne();
      if (!genre)
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Genre not found',
        });
      return genre;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async updateGenre(
    body: GenreDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    const queryRunner =
      this.genreRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const genreToUpdate = await this.genreRepository.findOne({
        where: {
          id,
        },
      });

      if (!genreToUpdate)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Genre not found',
        });

      const genre: UpdateResult = await queryRunner.manager.update(
        GenreEntity,
        id,
        body,
      );

      if (genre.affected === 0) return undefined;
      await queryRunner.commitTransaction();

      return genre;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteGenre(id: string): Promise<DeleteResult | undefined> {
    const queryRunner =
      this.genreRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const genre = await this.genreRepository.findOne({ where: { id } });

      if (!genre)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Genre not found',
        });

      const deleteResult = await this.genreRepository.delete(id);
      if (deleteResult.affected === 0) return undefined;
      await queryRunner.commitTransaction();
      return deleteResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    } finally {
      await queryRunner.release();
    }
  }
}
