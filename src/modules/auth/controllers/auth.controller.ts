import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserDTO } from 'src/modules/users/dtos/user.dto';
import { UsersService } from 'src/modules/users/services/users.service';
import { AuthService } from '../services/auth.service';
import { LoginDTO } from 'src/modules/users/dtos/login.dto';
import * as jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { ErrorManager } from 'src/utils/error.manager';
import { MailerService } from '@nestjs-modules/mailer';
import {
  EmailRestorePasswordDTO,
  PasswordRestorePasswordDTO,
} from 'src/modules/users/dtos/restorePassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guards/auth.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description:
      'Endpoint used for user login. Generates a token for registered users to access the application.',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email',
        },
        password: {
          type: 'string',
          description: 'User password',
        },
      },
      required: ['email', 'password'],
    },
  })
  @ApiCreatedResponse({
    description: 'Correct Credentials',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request. User not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Wrong credentials.',
  })
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
          role: user.role,
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

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fields needed to register a new user',
    schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        username: {
          type: 'string',
        },
        password: {
          type: 'string',
        },
        codePhone: {
          type: 'string',
        },
        phone: {
          type: 'string',
        },
        profileImage: {
          type: 'string',
          format: 'binary',
        },
      },
      required: [
        'firstName',
        'lastName',
        'email',
        'username',
        'password',
        'codePhone',
        'phone',
      ],
    },
    required: true,
  })
  @ApiCreatedResponse({
    description: 'Success Sign Up',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'string',
        },
        errors: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Duplicate key violation: Email or username already exists',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Duplicate key violation: Email or username already exists',
  })
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('profileImage'))
  async signUp(
    @Body() body: UserDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const user = await this.userService.createUser(body, file);
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
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'Email to request password reset',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
      },
      required: ['email'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Password reset email sent successfully',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'string',
        },
      },
    },
  })
  @Post('forget-password')
  async forgetPassword(@Body() body: EmailRestorePasswordDTO) {
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

  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({
    description: 'New password',
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
        },
      },
      required: ['password'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Password updated successfully',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  @Post('change-password/:token')
  async restorePassword(
    @Param('token') token: string,
    @Body() body: PasswordRestorePasswordDTO,
  ) {
    try {
      const { password } = body;
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

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Missing Authorization header',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Token expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
        },
        message: {
          type: 'string',
        },
        error: {
          type: 'string',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'User details',
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
            },
            updatedAt: {
              type: 'string',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            token: {
              type: 'string',
              nullable: true,
            },
            codePhone: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            imageURL: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['ADMIN', 'NORMAL'],
            },
            isActive: {
              type: 'boolean',
            },
          },
        },
      },
    },
  })
  @Get('me')
  @UseGuards(AuthGuard)
  async userToken(@Request() req: any) {
    try {
      const id = req.id;
      const user = await this.authService.userToken(id);
      return {
        results: user,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
