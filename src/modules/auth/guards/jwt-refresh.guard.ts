import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { RefreshTokenRepository } from '../../repository/services/refresh-token.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { authConstant } from '../constants/auth.constant';
import { TokenTypeEnum } from '../enums/token-type.enum';
import { AuthMapper } from '../services/auth.mapper';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const refreshToken = req
      .get(authConstant.AUTHORIZATION_HEADER)
      ?.split(authConstant.BEARER_PREFIX)[1];
    if (!refreshToken) {
      throw new UnauthorizedException(errorMessages.NO_TOKEN_PROVIDED);
    }

    const payload = await this.tokenService.verifyToken(
      refreshToken,
      TokenTypeEnum.REFRESH,
    );
    if (!payload) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }
    const isTokenExist = await this.refreshTokenRepository.exists({
      where: { refreshToken },
    });

    if (!isTokenExist) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }

    const user = await this.userRepository.findOneBy({ id: payload.userId });

    if (!user) {
      throw new UnauthorizedException(errorMessages.USER_NOT_FOUND);
    }

    req.user = AuthMapper.toUserDataDTO(user, payload.deviceId);

    return true;
  }
}
