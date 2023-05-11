import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PUBLIC_KEY } from 'src/constants/key-decorators';
import { UsersService } from 'src/modules/users/services/users.service';
import { useToken } from 'src/utils/use.token';
import { IUseToken } from '../interfaces/auth.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UsersService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader)
      throw new UnauthorizedException('Missing Authorization header');

    const [prefix, token] = authorizationHeader.split(' ');

    if (!prefix || !token || prefix !== 'Bearer')
      throw new UnauthorizedException('Invalid Authorization header');

    if (!token) throw new UnauthorizedException('Invalid Token');

    const manageToken: IUseToken | string = useToken(token);

    if (typeof manageToken === 'string')
      throw new UnauthorizedException(manageToken);

    if (manageToken.isExpired) throw new UnauthorizedException('Token expired');

    const { id } = manageToken;

    const user = await this.userService.findUserById(id);

    if (!user) throw new UnauthorizedException('Invalid User');

    req.id = user.id;
    req.role = user.role;

    return true;
  }
}
