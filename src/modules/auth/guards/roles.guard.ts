import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { ADMIN_OR_MANAGER } from '../constants/constants';
import { errorMessages } from '../../../common/constants/error-messages.constant';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<EUserRole[]>(ADMIN_OR_MANAGER, context.getHandler());
    if (!roles) {
      throw new UnauthorizedException(errorMessages.ACCESS_DENIED_USER_ROLE);
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!roles.includes(user.role)) {
      throw new UnauthorizedException(errorMessages.ACCESS_DENIED_USER_ROLE);
    }
    return true;
  }
}
