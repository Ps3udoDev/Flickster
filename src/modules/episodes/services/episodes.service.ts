import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EpisodeEntity } from '../entity/episodes.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { EpisodeDTO } from '../dto/episode.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { deleteFile, uploadFile } from 'src/libs/awsS3';
import { UpdateEpisodeDTO } from '../dto/updateEpisode.dto';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';

@Injectable()
export class EpisodesService {
  constructor(
    @InjectRepository(EpisodeEntity)
    private readonly episodeRepository: Repository<EpisodeEntity>,
  ) {}

  async createEpisode(
    body: EpisodeDTO,
    files: Array<Express.Multer.File>,
  ): Promise<EpisodeEntity> {
    const queryRunner =
      this.episodeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      body.coverUrl = '';
      body.episodeUrl = '';
      const episode = await this.episodeRepository.create(body);
      const savedEpisode = await this.episodeRepository.save(episode);

      let coverUrl = '';
      let episodeUrl = '';

      if (files['episode']) {
        const file = files['episode'][0];
        const originalname = file.originalname.split('.')[0];
        episodeUrl = await this.uploadVideo(originalname, file);
      }
      if (files['cover']) {
        const file = files['cover'][0];
        const originalname = file.originalname.split('.')[0];
        coverUrl = await this.uploadImage(originalname, file);
      }

      const updateMovie = await this.episodeRepository.save({
        ...savedEpisode,
        coverUrl,
        episodeUrl,
      });

      await queryRunner.commitTransaction();
      return updateMovie;
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

      let fileKey = `public/episodes/covers/cover-${name}`;

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

  async uploadVideo(name: string, file: Express.Multer.File): Promise<string> {
    try {
      if (!file)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No data video received',
        });
      let fileKey = `public/episodes/episodes/episode-${name}`;

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

  async findEpisodeByIdOr404(id: string): Promise<EpisodeEntity> {
    try {
      const episode = await this.episodeRepository
        .createQueryBuilder('episode')
        .where({ id })
        .getOne();
      if (!episode)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Episode not found',
        });
      return episode;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async updateEpisode(
    body: UpdateEpisodeDTO,
    id: string,
    files: Array<Express.Multer.File>,
  ): Promise<UpdateResult | undefined> {
    const queryRunner =
      this.episodeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const episodeToUpdate = await this.episodeRepository.findOne({
        where: {
          id,
        },
      });

      if (!episodeToUpdate)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Episode not found',
        });

      if (files) {
        if (files['episode']) {
          const file = files['episode'][0];
          const originalname = file.originalname.split('.')[0];
          const awsDomain = process.env.AWS_DOMAIN;
          const episodeKey = episodeToUpdate.episodeUrl.replace(awsDomain, '');
          await deleteFile(episodeKey);

          const episodeUrl = await this.uploadVideo(originalname, file);
          body.episodeUrl = episodeUrl;
        }
        if (files['cover']) {
          const file = files['cover'][0];
          const originalname = file.originalname.split('.')[0];

          const awsDomain = process.env.AWS_DOMAIN;
          const coverKey = episodeToUpdate.coverUrl.replace(awsDomain, '');
          await deleteFile(coverKey);

          const coverUrl = await this.uploadImage(originalname, file);
          body.coverUrl = coverUrl;
        }
      }

      const episode: UpdateResult = await queryRunner.manager.update(
        EpisodeEntity,
        id,
        body,
      );

      if (episode.affected === 0) return undefined;
      await queryRunner.commitTransaction();

      return episode;
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

  async deleteEpisode(id: string): Promise<DeleteResult | undefined> {
    const queryRunner =
      this.episodeRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const episode = await this.episodeRepository.findOne({ where: { id } });

      if (!episode)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Episode not found',
        });

      const deleteResult = await this.episodeRepository.delete(id);
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
