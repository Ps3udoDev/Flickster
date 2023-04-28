import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../entity/users.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserDTO } from '../dtos/user.dto';
import { PaginatedResult } from 'src/interfaces/paginated.results.interface';
import { UpdateUserDTO } from '../dtos/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAndCount(query: any): Promise<PaginatedResult<UserEntity>> {
    try {
      const { id, size = 10, page = 1 } = query;
      const numericSize = parseInt(size, 10);
      const numericPage = parseInt(page, 10);
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
      throw new Error(error);
    }
  }

  async findUserById(id: string): Promise<UserEntity> {
    try {
      return await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .getOne();
    } catch (error) {
      throw new Error(error);
    }
  }

  async createUser(body: UserDTO): Promise<UserEntity> {
    try {
      return await this.userRepository.save(body);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(
    body: UpdateUserDTO,
    id: string,
  ): Promise<UpdateResult | undefined> {
    try {
      const userToUpdate = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });

      if (!userToUpdate) throw new Error('User not found');

      const user: UpdateResult = await this.userRepository.update(id, body);

      if (user.affected === 0) return undefined;

      return user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new Error('User not found');

      const deleteResult = await this.userRepository.delete(id);
      if (deleteResult.affected === 0) return undefined;

      return deleteResult;
    } catch (error) {
      throw new Error(error);
    }
  }
}
