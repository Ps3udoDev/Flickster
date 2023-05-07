import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/users.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO } from '../dtos/user.dto';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { hashedPassword } from 'src/libs/bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<UserEntity>> {
    try {
      const { id, size = 10, page = 1 } = query;
      const numericSize = +size;
      const numericPage = +page;
      const where = id ? { id } : {};

      const [users, count] = await this.userRepository.findAndCount({
        where,
        select: [
          'id',
          'firstName',
          'lastName',
          'email',
          'username',
          'codePhone',
          'phone',
          'imageURL',
          'role',
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
        results: users,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findUserById(id: string): Promise<UserEntity> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .getOne();

      if (!user)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async findUserByEmailOr404(email: string): Promise<UserEntity> {
    try {
      if (!email)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Email not given',
        });
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createUser(body: UserDTO): Promise<UserEntity> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      body.password = hashedPassword(body.password);
      const user = await this.userRepository.create(body);
      const savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateUser(
    body: UpdateUserDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userToUpdate = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!userToUpdate)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });

      const user: UpdateResult = await queryRunner.manager.update(
        UserEntity,
        id,
        body,
      );

      if (user.affected === 0) return undefined;

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUser(id: string): Promise<DeleteResult | undefined> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });

      const deleteResult = await this.userRepository.delete(id);
      if (deleteResult.affected === 0) return undefined;
      await queryRunner.commitTransaction();
      return deleteResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async setTokenUser(id: string, token: string): Promise<UserEntity> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user)
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'User not found',
        });
      user.token = token;

      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async removeTokenUser(id: string): Promise<UserEntity> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user)
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'User not found',
        });
      user.token = null;

      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async verifiedTokenUser(
    id: string,
    token: string,
    exp: number,
  ): Promise<UserEntity> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      if (!id)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not ID provided',
        });

      if (!token)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not token provided',
        });

      if (!exp)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not exp exist',
        });

      const user = await this.userRepository.findOne({ where: { id, token } });

      if (!user)
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message:
            'Invalid Token --- The user associated with the token was not found',
        });

      if (Date.now() > exp * 1000)
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'The token has expired, the 15min limit has been exceeded',
        });
      user.token = null;

      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<UserEntity> {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      if (!id)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Not ID provided',
        });

      const user = await this.userRepository.findOne({ where: { id } });

      if (!user)
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Not found user',
        });

      user.password = hashedPassword(newPassword);

      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ErrorManager.createSignatureError(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
