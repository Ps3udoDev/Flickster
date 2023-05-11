import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDTO } from '../dtos/updateUser.dto';
import { ErrorManager } from 'src/utils/error.manager';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getAllUsers(@Query() query: any) {
    return await this.userService.findAndCount(query);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
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
