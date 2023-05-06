import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserDTO } from 'src/modules/users/dtos/user.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { AuthService } from '../services/auth.service';
import { LoginDTO } from 'src/modules/users/dtos/login.dto';
import * as jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { ErrorManager } from 'src/utils/error.manager';
import { MailerService } from '@nestjs-modules/mailer';
import { RestorePasswordDTO } from 'src/modules/users/dtos/restorePassword.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDTO) {
    try {
      const { email, password } = body;
      const user = await this.authService.checkUsersCredentials(
        email,
        password,
      );
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET_WORD,
        { expiresIn: '24h' },
      );
      return {
        message: 'Correct Credentials',
        token,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  @Post('sign-up')
  async signUp(@Body() body: UserDTO) {
    try {
      const user = await this.userService.createUser(body);
      const errors = [];
      const template = readFileSync('./views/welcome.html', 'utf-8');
      const compiledTemplate = compile(template);

      try {
        await this.mailerService.sendMail({
          from: process.env.MAIL_SEND,
          to: user.email,
          subject: `Success SignUp! ${user.firstName} `,
          html: compiledTemplate({
            name: user.firstName,
          }),
          text: 'Welcome Again!',
        });
      } catch (error) {
        errors.push({
          errorName: 'Error Sending Email',
          message: 'Something went wrong with the Sender Email',
        });
      }
      return {
        results: 'Success Sign Up',
        errors,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body() body: RestorePasswordDTO) {
    try {
      const { email } = body;
      const userAndToken = await this.authService.createRecoveryToken(email);
      const user = await this.userService.setTokenUser(
        userAndToken.user.id,
        userAndToken.token,
      );
      const template = readFileSync('./views/restore.html', 'utf-8');
      const compiledTemplate = compile(template);
      try {
        await this.mailerService.sendMail({
          from: process.env.MAIL_SEND,
          to: user.email,
          subject: `Restore Password`,
          html: compiledTemplate({
            name: user.firstName,
            linkRestore: `${process.env.PASSWORD_RESET_DOMAIN}/api/v1/Flickster/auth/change-password/${userAndToken.token}`,
          }),
        });
      } catch (error) {
        throw new ErrorManager({
          type: 'INTERNAL_SERVER_ERROR',
          message: 'Error Sending the Recovery email',
        });
      }
      return {
        results: 'Password reset email sent successfully',
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  @Post('change-password/:token')
  async restorePassword(
    @Param('token') token: string,
    @Body() password: string,
  ) {
    try {
      let tokenInfo;
      try {
        tokenInfo = JSON.parse(atob(token.split('.')[1]));
      } catch (error) {
        throw new ErrorManager({
          type: 'UNAUTHORIZED',
          message: 'Something went wrong deserializing the token',
        });
      }
      await this.authService.changePassword(tokenInfo, password, token);
      return {
        results: {
          message: 'update success',
        },
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  @Get('me')
  async userToken(@Req() req) {
    try {
      const id = req.user.id;
      const user = await this.authService.userToken(id);
      return {
        results: user,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
