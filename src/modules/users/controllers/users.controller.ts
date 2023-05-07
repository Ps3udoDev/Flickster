import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from '../services/users.service';

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
}
