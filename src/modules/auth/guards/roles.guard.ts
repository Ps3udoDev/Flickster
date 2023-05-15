import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ADMIN_KEY, PUBLIC_KEY, ROLES_KEY } from 'src/constants/key-decorators';
import { ROLES } from 'src/constants/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) return true;

    const roles = this.reflector.get<Array<keyof typeof ROLES>>(
      ROLES_KEY,
      context.getHandler(),
    );

    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    const req = context.switchToHttp().getRequest<Request>();

    const { role } = req;

    if (roles === undefined) {
      if (!admin) {
        return true;
      } else if (admin && role === admin) {
        return true;
      } else {
        throw new UnauthorizedException(
          'role is You do not have permission for this operation',
        );
      }
    }

    if (role === ROLES.ADMIN) return true;

    const isAuth = roles.some((role_r) => role_r === role);

    if (!isAuth)
      throw new UnauthorizedException(
        ' is auth You do not have permission for this operation',
      );

    return true;
  }
}
