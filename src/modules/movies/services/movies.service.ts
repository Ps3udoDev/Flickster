import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieEntity } from '../entity/movies.entity';
import { DeleteResult, ILike, Repository, UpdateResult } from 'typeorm';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { ErrorManager } from 'src/utils/error.manager';
import { deleteFile, uploadFile } from 'src/libs/awsS3';
import { MovieDTO } from '../dto/movie.dto';
import { UpdateMovieDTO } from '../dto/updateMovie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly movieRepository: Repository<MovieEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<MovieEntity>> {
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

  async createMovie(
    body: MovieDTO,
    files: Array<Express.Multer.File>,
  ): Promise<MovieEntity> {
    const queryRunner =
      this.movieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      body.coverUrl = '';
      body.movieUrl = '';
      body.traillerUrl = '';
      const movie = await this.movieRepository.create(body);
      const savedMovie = await this.movieRepository.save(movie);

      let movieUrl = '';
      let traillerUrl = '';
      let coverUrl = '';

      if (files['trailer']) {
        const file = files['trailer'][0];
        const originalname = file.originalname.split('.')[0];
        traillerUrl = await this.uploadVideo(originalname, 'trailer', file);
      }
      if (files['cover']) {
        const file = files['cover'][0];
        const originalname = file.originalname.split('.')[0];
        coverUrl = await this.uploadImage(originalname, file);
      }
      if (files['movie']) {
        const file = files['movie'][0];
        const originalname = file.originalname.split('.')[0];
        movieUrl = await this.uploadVideo(originalname, 'movie', file);
      }

      const updateMovie = await this.movieRepository.save({
        ...savedMovie,
        movieUrl,
        traillerUrl,
        coverUrl,
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

      let fileKey = `public/movies/covers/cover-${name}`;

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

  async uploadVideo(
    name: string,
    type: string,
    file: Express.Multer.File,
  ): Promise<string> {
    try {
      if (!file)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No data video received',
        });
      let fileKey = '';
      if (type === 'movie') {
        fileKey = `public/movies/movies/movie-${name}`;
      } else {
        fileKey = `public/movies/trailers/trailer-${name}`;
      }

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

  async findMovieByIdOr404(id: string): Promise<MovieEntity> {
    try {
      const movie = await this.movieRepository
        .createQueryBuilder('movie')
        .where({ id })
        .getOne();
      if (!movie)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Movie not found',
        });
      return movie;
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  async updateMovie(
    body: UpdateMovieDTO,
    id: string,
    files: Array<Express.Multer.File>,
  ): Promise<UpdateResult | undefined> {
    const queryRunner =
      this.movieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movieToUpdate = await this.movieRepository.findOne({
        where: {
          id,
        },
      });

      if (!movieToUpdate)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Movie not found',
        });

      if (files) {
        if (files['trailer']) {
          const file = files['trailer'][0];
          const originalname = file.originalname.split('.')[0];
          const awsDomain = process.env.AWS_DOMAIN;
          const trailerKey = movieToUpdate.traillerUrl.replace(awsDomain, '');
          await deleteFile(trailerKey);

          const traillerUrl = await this.uploadVideo(
            originalname,
            'trailer',
            file,
          );
          body.traillerUrl = traillerUrl;
        }
        if (files['cover']) {
          const file = files['cover'][0];
          const originalname = file.originalname.split('.')[0];

          const awsDomain = process.env.AWS_DOMAIN;
          const coverKey = movieToUpdate.coverUrl.replace(awsDomain, '');
          await deleteFile(coverKey);

          const coverUrl = await this.uploadImage(originalname, file);
          body.coverUrl = coverUrl;
        }
        if (files['movie']) {
          const file = files['movie'][0];
          const originalname = file.originalname.split('.')[0];

          const awsDomain = process.env.AWS_DOMAIN;
          const movieKey = movieToUpdate.movieUrl.replace(awsDomain, '');
          await deleteFile(movieKey);
          const movieUrl = await this.uploadVideo(originalname, 'movie', file);
          body.movieUrl = movieUrl;
        }
      }

      const movie: UpdateResult = await queryRunner.manager.update(
        MovieEntity,
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

  async deleteMovie(id: string): Promise<DeleteResult | undefined> {
    const queryRunner =
      this.movieRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const movie = await this.movieRepository.findOne({ where: { id } });

      if (!movie)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Movie not found',
        });

      const deleteResult = await this.movieRepository.delete(id);
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
