import { Injectable } from '@nestjs/common';
import { comparePassword } from 'src/libs/bcrypt';
import { UserEntity } from 'src/modules/users/entity/users.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import { ErrorManager } from 'src/utils/error.manager';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async checkUsersCredentials(
    email: string,
    password: string,
  ): Promise<UserEntity> {
    try {
      const user = await this.userService.findUserByEmailOr404(email);
      const verifyPassword = comparePassword(password, user.password);
      if (!verifyPassword)
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User not found',
        });
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createRecoveryToken(
    email: string,
  ): Promise<{ user: UserEntity; token: string }> {
    const user = await this.userService.findUserByEmailOr404(email);
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET_WORD,
      { expiresIn: '900s' },
    );
    return { user, token };
  }

  async changePassword(
    { id, exp }: { id: string; exp: number },
    newPassword: string,
    token: string,
  ): Promise<UserEntity> {
    await this.userService.verifiedTokenUser(id, token, exp);
    const updatedUser = await this.userService.updatePassword(id, newPassword);
    return updatedUser;
  }

  async userToken(id: string): Promise<UserEntity> {
    const user = await this.userService.findUserById(id);
    if (!user)
      throw new ErrorManager({
        type: 'NOT_FOUND',
        message: 'Not found User',
      });
    return user;
  }
}
