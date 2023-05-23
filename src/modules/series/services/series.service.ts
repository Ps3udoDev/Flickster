import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SerieEntity } from '../entity/series.entity';
import { DeleteResult, ILike, Repository, UpdateResult } from 'typeorm';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { ErrorManager } from 'src/utils/error.manager';
import { SerieDTO } from '../dto/serie.dto';
import { UpdateSerieDTO } from '../dto/updateSerie.dto';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SerieEntity)
    private readonly serieRepository: Repository<SerieEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<SerieEntity>> {
    try {
      const {
        id,
        size = 10,
        page = 1,
        title,
        director,
        classification,
        releaseYear,
      } = query;
      const numericSize = +size;
      const numericPage = +page;
      const where: any = {};

      if (id) {
        where.id = id;
      }
      if (title) {
        where.title = ILike(`%${title}%`);
      }

      if (director) {
        where.director = ILike(`%${director}%`);
      }

      if (classification) {
        where.classification = ILike(`%${classification}%`);
      }

      if (releaseYear) {
        where.releaseYear = ILike(`%${releaseYear}%`);
      }

      const [series, count] = await this.serieRepository.findAndCount({
        where,
        select: [
          'id',
          'title',
          'synopsis',
          'relaseYear',
          'director',
          'rating',
          'clasification',
        ],
        take: numericSize,
        skip: (numericPage - 1) * numericSize,
      });

      const totalPages = numericSize === 0 ? 1 : Math.ceil(count / numericSize);

      return {
        count,
        totalPages,
        currentPage: page,
        results: series,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createSerie(body: SerieDTO): Promise<SerieEntity> {
    const queryRunner =
      this.serieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serie = await this.serieRepository.create(body);
      await queryRunner.commitTransaction();
      return serie;
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

  async findSerieByIdOr404(id: string): Promise<SerieEntity> {
    try {
      const serie = await this.serieRepository
        .createQueryBuilder('serie')
        .where({ id })
        .getOne();
      if (!serie)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Serie not found',
        });
      return serie;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async updateSerie(
    body: UpdateSerieDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    const queryRunner =
      this.serieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serieToUpdate = await this.serieRepository.findOne({
        where: {
          id,
        },
      });

      if (!serieToUpdate)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Serie not found',
        });

      const serie: UpdateResult = await queryRunner.manager.update(
        SerieEntity,
        id,
        body,
      );

      if (serie.affected === 0) return undefined;
      await queryRunner.commitTransaction();

      return serie;
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

  async deleteSerie(id: string): Promise<DeleteResult | undefined> {
    const queryRunner =
      this.serieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serie = await this.serieRepository.findOne({ where: { id } });

      if (!serie)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Serie not found',
        });

      const deleteResult = await this.serieRepository.delete(id);
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
