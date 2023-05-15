import { NestFactory, Reflector } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('Flickster - API')
    .setDescription(
      `Welcome to the API documentation for our movie app! This API has been designed and built to provide a full set of functionality that will allow you to create a Netflix-like experience for your users. Below you will find a detailed description of the main endpoints and features of our API.
    We are confident that our API will provide you with all the necessary tools to create a successful and engaging movie app for your users. For more detailed information about the endpoints, parameters and responses, we invite you to consult our attached technical documentation. If you have any questions or need help, feel free to contact our support team. Happy developing! 🚀✨`,
    )
    .setVersion('1.0')
    .setContact(
      'Ps3udoD3v',
      'https://ps3udo-dev-briefcase.vercel.app/',
      'v.pseudo.developer@gmail.com',
    )
    .addTag(
      'Auth',
      'Manages user authentication, including login, registration, password recovery and change, and profile recovery.',
    )
    .addTag(
      'Users',
      'Allows user management, such as get user list (for admins only), get user information by ID, modify a user (for own user only), and delete user (for own user or admins only) .',
    )
    .addTag(
      'Genres',
      'Provides information about movie genres, including the list of all genres, genre information by ID, and movies associated with a genre. Additionally, admins can modify, create, or delete genres.',
    )
    .addTag(
      'Movies',
      'Allows you to access movie information, including the full list of available movies, movie information by ID, and movie search by parameters. Administrators have the ability to modify, create, or delete movies.',
    )
    .addTag(
      'Series',
      'Provides access to string information, including the full list of strings available, string information by ID, and string search by parameters. Administrators can modify, create, or delete series.',
    )
    .addServer(
      `http://${configService.get('DOMAIN')}:${configService.get(
        'PORT',
      )}/api/v1/Flickster`,
    )
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api/v1/Flickster');

  await app.listen(configService.get('PORT'));
  console.log(`App running on: ${await app.getUrl()}`);
}
bootstrap();
