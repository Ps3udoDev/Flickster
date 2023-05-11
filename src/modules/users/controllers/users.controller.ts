import {
  Body,
  Controller,
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
import { PublicAcces } from 'src/modules/auth/decorators/public.decorator';
import { OptionalAuthGuard } from 'src/modules/auth/guards/optional-auth.guard';
import { ProfileAuthorizationGuard } from 'src/modules/auth/guards/profile-authorization.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers(@Query() query: any) {
    return await this.userService.findAndCount(query);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard, ProfileAuthorizationGuard)
  async getUserById(@Param('id') id: string, @Request() req: any) {
    const loggedId = req.id;
    console.log(loggedId);
    return await this.userService.findUserById(id, loggedId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  @PublicAcces()
  async updateUser(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserDTO,
  ) {
    console.log(body);
    try {
      console.log('test');
      return await this.userService.updateUser(body, id, file);
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }
}
