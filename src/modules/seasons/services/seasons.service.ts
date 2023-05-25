import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SeasonEntity } from '../entity/seasons.entity';
import { DeleteResult, ILike, Repository, UpdateResult } from 'typeorm';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { ErrorManager } from 'src/utils/error.manager';
import { SeasonDTO } from '../dto/season.dto';
import { deleteFile, uploadFile } from 'src/libs/awsS3';
import { UpdateSeasonDTO } from '../dto/updateSeason.dto';
import { EpisodeEntity } from 'src/modules/episodes/entity/episodes.entity';

@Injectable()
export class SeasonsService {
  constructor(
    @InjectRepository(SeasonEntity)
    private readonly seasonRepository: Repository<SeasonEntity>,
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<SeasonEntity>> {
    try {
      const { id, size = 10, page = 1, title, releaseYear } = query;
      const numericSize = +size;
      const numericPage = +page;
      const where: any = {};

      if (id) {
        where.id = id;
      }
      if (title) {
        where.title = ILike(`%${title}%`);
      }

      if (releaseYear) {
        where.releaseYear = ILike(`%${releaseYear}%`);
      }

      const [seasons, count] = await this.seasonRepository.findAndCount({
        where,
        select: [
          'id',
          'title',
          'relaseYear',
          'traillerUrl',
          'coverUrl',
          'serie',
        ],
        take: numericSize,
        skip: (numericPage - 1) * numericSize,
        relations: ['serie', 'episodes'],
      });

      const totalPages = numericSize === 0 ? 1 : Math.ceil(count / numericSize);

      return {
        count,
        totalPages,
        currentPage: page,
        results: seasons,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createSeason(
    body: SeasonDTO,
    files: Array<Express.Multer.File>,
  ): Promise<SeasonEntity> {
    const queryRunner =
      this.seasonRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      body.coverUrl = '';
      body.traillerUrl = '';
      const season = await this.seasonRepository.create(body);
      const savedSeason = await this.seasonRepository.save(season);

      let traillerUrl = '';
      let coverUrl = '';

      if (files['trailer']) {
        const file = files['trailer'][0];
        const originalname = file.originalname.split('.')[0];
        traillerUrl = await this.uploadVideo(originalname, file);
      }
      if (files['cover']) {
        const file = files['cover'][0];
        const originalname = file.originalname.split('.')[0];
        coverUrl = await this.uploadImage(originalname, file);
      }

      const updateSeason = await this.seasonRepository.save({
        ...savedSeason,
        traillerUrl,
        coverUrl,
      });

      await queryRunner.commitTransaction();
      return updateSeason;
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

  async uploadImage(name: string, file: Express.Multer.File): Promise<string> {
    try {
      if (!file)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No image received',
        });

      let fileKey = `public/series/seasons/covers/cover-${name}`;

      if (file.mimetype === 'image/jpg') {
        fileKey += '.jpg';
      } else if (file.mimetype == 'image/jpeg') {
        fileKey += '.jpeg';
      } else if (file.mimetype == 'image/png') {
        fileKey += '.png';
      } else {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Unsupported image type',
        });
      }

      const URL = await uploadFile(file, fileKey);
      return URL;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async getSeasonById(id: string): Promise<SeasonEntity> {
    try {
      const season = await this.seasonRepository.findOne({
        where: { id },
        relations: ['episodes'],
      });
      return season;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async uploadVideo(name: string, file: Express.Multer.File): Promise<string> {
    try {
      if (!file)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No data video received',
        });
      let fileKey = `public/series/seasons/trailers/trailer-${name}`;

      if (file.mimetype === 'video/mp4') {
        fileKey += '.mp4';
      } else if (file.mimetype == 'video/x-msvideo') {
        fileKey += '.avi';
      } else if (file.mimetype == 'video/quicktime') {
        fileKey += '.mov';
      } else if (file.mimetype == 'video/webm') {
        fileKey += '.webm';
      } else {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Unsupported video type',
        });
      }

      const URL = await uploadFile(file, fileKey);
      return URL;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async updateSeason(
    body: UpdateSeasonDTO,
    id: string,
    files: Array<Express.Multer.File>,
  ): Promise<UpdateResult | undefined> {
    const queryRunner =
      this.seasonRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const seasonToUpdate = await this.seasonRepository.findOne({
        where: {
          id,
        },
      });

      if (!seasonToUpdate)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Season not found',
        });

      if (files) {
        if (files['trailer']) {
          const file = files['trailer'][0];
          const originalname = file.originalname.split('.')[0];
          const awsDomain = process.env.AWS_DOMAIN;
          const trailerKey = seasonToUpdate.traillerUrl.replace(awsDomain, '');
          await deleteFile(trailerKey);

          const traillerUrl = await this.uploadVideo(originalname, file);
          body.traillerUrl = traillerUrl;
        }
        if (files['cover']) {
          const file = files['cover'][0];
          const originalname = file.originalname.split('.')[0];

          const awsDomain = process.env.AWS_DOMAIN;
          const coverKey = seasonToUpdate.coverUrl.replace(awsDomain, '');
          await deleteFile(coverKey);

          const coverUrl = await this.uploadImage(originalname, file);
          body.coverUrl = coverUrl;
        }
      }

      const movie: UpdateResult = await queryRunner.manager.update(
        SeasonEntity,
        id,
        body,
      );

      if (movie.affected === 0) return undefined;
      await queryRunner.commitTransaction();

      return movie;
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

  async deleteSeason(id: string): Promise<DeleteResult | undefined> {
    const queryRunner =
      this.seasonRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const season = await this.seasonRepository.findOne({ where: { id } });

      if (!season)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Season not found',
        });

      const deleteResult = await this.seasonRepository.delete(id);
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

  async getEpisodesBySeason(
    seasonId: string,
    query: any,
  ): Promise<PaginatedResult<EpisodeEntity>> {
    try {
      const { size = 10, page = 1 } = query;
      const numericSize = +size;
      const numericPage = +page;

      const [episodes, count] = await this.episodeRepository.findAndCount({
        where: { season: { id: seasonId } },
        select: [
          'id',
          'title',
          'synopsis',
          'duration',
          'episodeNumber',
          'episodeUrl',
          'coverUrl',
          'createdAt',
          'createdAt',
        ],
        take: numericSize,
        skip: (numericPage - 1) * numericSize,
      });

      const totalPages = numericSize === 0 ? 1 : Math.ceil(count / numericSize);

      return {
        count,
        totalPages,
        currentPage: page,
        results: episodes,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
