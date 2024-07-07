import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import {
  ActionTokenConfig,
  Configs,
  JWTConfig,
} from '../../../configs/configs.type';
import { LoggerService } from '../../logger/services/logger.service';
import { EActionTokenType } from '../enums/action-token-type.enum';
import { TokenTypeEnum } from '../enums/token-type.enum';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { ITokenPair } from '../interfaces/token.interface';

@Injectable()
export class TokenService {
  private readonly jwtConfig: JWTConfig;
  private readonly actionTokenConfig: ActionTokenConfig;
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Configs>,
    private readonly loggerService: LoggerService,
  ) {
    this.jwtConfig = this.configService.get<JWTConfig>('jwt');
    this.actionTokenConfig =
      this.configService.get<ActionTokenConfig>('actionToken');
  }

  public async generateTokenPair(payload: IJwtPayload): Promise<ITokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.access_secret,
      expiresIn: this.jwtConfig.access_expires_in,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtConfig.refresh_secret,
      expiresIn: this.jwtConfig.refresh_expires_in,
    });

    return { accessToken, refreshToken };
  }
  public async verifyToken(
    token: string,
    tokenType: TokenTypeEnum,
  ): Promise<IJwtPayload> {
    try {
      return (await this.jwtService.verify(token, {
        secret: this.getSecret(tokenType),
      })) as IJwtPayload;
    } catch (error) {
      this.loggerService.error('Token verification error: ' + error);
    }
  }

  public async generateActionToken(
    payload: IJwtPayload,
    tokenType: EActionTokenType,
  ): Promise<string> {
    try {
      let secret: string;
      let expiresIn: string;

      switch (tokenType) {
        case EActionTokenType.SETUP_MANAGER:
          secret = this.actionTokenConfig.setup_manager_secret;
          expiresIn = this.actionTokenConfig.setup_manager_expires_in;
          break;
        case EActionTokenType.FORGOT_PASSWORD:
          secret = this.actionTokenConfig.forgot_password_secret;
          expiresIn = this.actionTokenConfig.forgot_password_expires_in;
          break;
        case EActionTokenType.SETUP_DEALERSHIP_WORKER_PASSWORD:
          secret = this.actionTokenConfig.setup_dealership_worker_secret;
          expiresIn = this.actionTokenConfig.setup_dealership_worker_expires_in;
          break;
        default:
          throw new UnauthorizedException(errorMessages.INVALID_TOKEN_TYPE);
      }
      return await this.jwtService.signAsync(payload, { secret, expiresIn });
    } catch (e) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }
  }
  public async verifyActionToken(
    token: string,
    type: EActionTokenType,
  ): Promise<IJwtPayload> {
    try {
      const secret = this.getActionSecret(type);
      return (await this.jwtService.verify(token, { secret })) as IJwtPayload;
    } catch (e) {
      throw new UnauthorizedException(errorMessages.INVALID_TOKEN);
    }
  }

  private getSecret(tokenType: TokenTypeEnum): string {
    let secret: string;

    switch (tokenType) {
      case TokenTypeEnum.ACCESS:
        secret = this.jwtConfig.access_secret;
        break;
      case TokenTypeEnum.REFRESH:
        secret = this.jwtConfig.refresh_secret;
        break;
      default:
        throw new Error(errorMessages.INVALID_TOKEN_TYPE);
    }
    return secret;
  }

  private getActionSecret(actionTokenType: EActionTokenType): string {
    let secret: string;

    switch (actionTokenType) {
      case EActionTokenType.SETUP_MANAGER:
        secret = this.actionTokenConfig.setup_manager_secret;
        break;
      case EActionTokenType.FORGOT_PASSWORD:
        secret = this.actionTokenConfig.forgot_password_secret;
        break;
      case EActionTokenType.SETUP_DEALERSHIP_WORKER_PASSWORD:
        secret = this.actionTokenConfig.setup_dealership_worker_secret;
        break;
      default:
        throw new UnauthorizedException(errorMessages.WRONG_TOKEN_TYPE);
    }
    return secret;
  }
}
