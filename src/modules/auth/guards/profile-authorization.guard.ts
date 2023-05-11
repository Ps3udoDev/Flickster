import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class ProfileAuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const loggedInUserId = request.id;
    const requestedUserId = request.params.id;

    if (loggedInUserId === requestedUserId || !requestedUserId) {
      return true;
    }

    return true;
  }
}
