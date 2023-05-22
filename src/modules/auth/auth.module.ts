import { Global, Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UsersService } from '../users/services/users.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/libs/jwt.strategy';
import { Lambda } from 'aws-sdk';

@Global()
@Module({
  imports: [
    UsersModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.NODEMAILER_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.NODEMAILER_USER,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      },
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_WORD,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, Lambda],
})
export class AuthModule {}
