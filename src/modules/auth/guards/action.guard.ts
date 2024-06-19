import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { UserRepository } from '../../repository/services/user.repository';
import { authConstant } from '../../../common/constants/auth.constant';
import { errorMessages } from '../../../common/constants/error-messages.constant';
import { AuthMapper } from '../services/auth.mapper';
import { ActionTokenRepository } from '../../repository/services/action-token.repository';
import { Reflector } from '@nestjs/core';
import { EActionTokenType } from '../enums/action-token-type.enum';
import { ACTION_TOKEN_TYPE } from '../constants/constants';

@Injectable()
export class ActionGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly actionTokenRepository: ActionTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const actionToken = req.get(authConstant.AUTHORIZATION_HEADER)?.split(authConstant.BEARER_PREFIX)[1];
    if (!actionToken) {
      throw new UnauthorizedException(errorMessages.NO_TOKEN_PROVIDED);
    }

    const tokenType: EActionTokenType = this.reflector.get<EActionTokenType>(ACTION_TOKEN_TYPE, context.getHandler());

    if (!tokenType) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN_TYPE);
    }

    const payload = await this.tokenService.verifyActionToken(actionToken, tokenType);

    if (!payload) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }
    const isTokenExist =
      await this.actionTokenRepository.isTokenExist(actionToken);

    if (!isTokenExist) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }

    const user = await this.userRepository.findOneBy({ id: payload.userId });

    if (!user) {
      throw new UnauthorizedException(errorMessages.USER_NOT_FOUND);
    }

    req.user = AuthMapper.toUserDataDTO(user);

    return true;
  }
}
