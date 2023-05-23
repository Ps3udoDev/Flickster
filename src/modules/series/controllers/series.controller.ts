import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeriesService } from '../services/series.service';
import { SerieDTO } from '../dto/serie.dto';
import { UpdateSerieDTO } from '../dto/updateSerie.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly serieService: SeriesService) {}

  @Get()
  async getAllSeries(@Query() query: any) {
    return await this.serieService.findAndCount(query);
  }

  @Post()
  async createSerie(@Body() body: SerieDTO) {
    const serie = await this.serieService.createSerie(body);
    return {
      results: serie,
      message: 'successful creation',
    };
  }

  @Get(':id')
  async getSerieById(@Param('id') id: string) {
    return await this.serieService.findSerieByIdOr404(id);
  }

  @Patch(':id')
  async updateSerie(@Param('id') id: string, @Body() body: UpdateSerieDTO) {
    try {
      return await this.serieService.updateSerie(body, id);
    } catch (error) {
      const errorMessage = error.type
        ? `${error.type} :: ${error.message}`
        : error.message;
      throw ErrorManager.createSignatureError(errorMessage);
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteMovie(@Param('id') id: string, @Request() req: any) {
    if (req.role !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    return await this.serieService.deleteSerie(id);
  }
}
