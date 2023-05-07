import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as morgan from 'morgan';
import { join } from 'path';
import { CORS } from './constants/cors';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(morgan('dev'));

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const configService = app.get(ConfigService);

  app.enableCors(CORS);

  app.setGlobalPrefix('api/v1/Flickster');

  await app.listen(configService.get('PORT'));
  console.log(`App running on: ${await app.getUrl()}`);
}
bootstrap();
