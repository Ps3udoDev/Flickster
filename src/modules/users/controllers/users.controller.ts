import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { OptionalAuthGuard } from 'src/modules/auth/guards/optional-auth.guard';
import { ProfileAuthorizationGuard } from 'src/modules/auth/guards/profile-authorization.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiBearerAuth()
  @ApiQuery({
    name: 'size',
    description: 'Number of results per page',
    required: false,
    type: 'integer',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    required: false,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        totalPages: { type: 'number' },
        currentPage: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              username: { type: 'string' },
              codePhone: { type: 'string' },
              phone: { type: 'string' },
              imageURL: { type: 'string' },
              role: { type: 'string', enum: ['NORMAL', 'ADMIN'] },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers(@Query() query: any) {
    return await this.userService.findAndCount(query);
  }

  @ApiResponse({
    status: 400,
    description: 'Bad Request',
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
  @ApiResponse({
    status: 404,
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
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        firstName: {
          type: 'string',
        },
        lastName: {
          type: 'string',
        },
        username: {
          type: 'string',
        },
        codePhone: {
          type: 'string',
        },
        phone: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        imageURL: {
          type: 'string',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
        isActive: {
          type: 'boolean',
        },
      },
    },
  })
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async getUserById(@Param('id') id: string, @Request() req: any) {
    const loggedId = req.id;
    console.log(loggedId);
    return await this.userService.findUserById(id, loggedId);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiBearerAuth()
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
    },
  })
  @ApiResponse({ status: 401, description: 'Missing Authorization header' })
  @ApiResponse({ status: 400, description: 'BAD_REQUEST :: User not found' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  @UseGuards(AuthGuard, ProfileAuthorizationGuard)
  async updateUser(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDTO,
  ) {
    try {
      return await this.userService.updateUser(body, id, file);
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, ProfileAuthorizationGuard)
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN' && req.id !== id) {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.userService.deleteUser(id);
  }
}
