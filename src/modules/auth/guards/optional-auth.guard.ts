import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Injectable()
export class OptionalAuthGuard extends AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
      return true;
    } catch (error) {
      return true;
    }
  }
}
