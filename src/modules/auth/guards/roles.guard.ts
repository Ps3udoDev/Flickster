import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ADMIN_KEY, ROLES_KEY } from 'src/constants/key-decorators';
import { ROLES } from 'src/constants/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<Array<keyof typeof ROLES>>(
      ROLES_KEY,
      context.getHandler(),
    );
    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    const req = context.switchToHttp().getRequest<Request>();
    const { roleUser } = req.user;

    if (!roles && !admin) {
      return true;
    }

    if (admin && roleUser === admin) {
      return true;
    }

    if (roles && roles.includes(roleUser)) {
      return true;
    }

    throw new UnauthorizedException('No tienes permisos para esta operación');
  }
}
