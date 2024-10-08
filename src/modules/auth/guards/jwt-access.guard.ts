import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { UserRepository } from '../../repository/services/user.repository';
import { authConstant } from '../constants/auth.constant';
import { SKIP_AUTH } from '../constants/constants';
import { TokenTypeEnum } from '../enums/token-type.enum';
import { AuthMapper } from '../services/auth.mapper';
import { AuthCacheService } from '../services/auth-cache.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly userRepository: UserRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) return true;

    const request = context.switchToHttp().getRequest();
    const accessToken = request
      .get(authConstant.AUTHORIZATION_HEADER)
      ?.split(authConstant.BEARER_PREFIX)[1];

    if (!accessToken) {
      throw new UnauthorizedException(errorMessages.NO_TOKEN_PROVIDED);
    }

    const payload = await this.tokenService.verifyToken(
      accessToken,
      TokenTypeEnum.ACCESS,
    );

    if (!payload) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }

    const isTokenExists = this.authCacheService.isAccessTokenExist(
      accessToken,
      payload.userId,
      payload.deviceId,
    );
    if (!isTokenExists) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }
    const user = await this.userRepository.findOneBy({ id: payload.userId });
    if (!user) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }
    request.user = AuthMapper.toUserDataDTO(user, payload.deviceId);
    return true;
  }
}
