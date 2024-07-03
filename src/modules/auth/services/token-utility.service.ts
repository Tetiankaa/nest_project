import { Injectable } from '@nestjs/common';
import { TokenService } from './token.service';
import { AuthCacheService } from './auth-cache.service';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { ITokenPair } from '../interfaces/token.interface';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';


@Injectable()
export class TokenUtilityService {
  constructor(

    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
  ) {}

  public async generateAndSaveTokenPair(
    userId: string,
    deviceId: string,
    role: EUserRole,
    accountType: EAccountType,
    refreshTokenRepository: Repository<RefreshTokenEntity>
  ): Promise<ITokenPair> {
    const tokenPair = await this.tokenService.generateTokenPair({
      userId,
      deviceId,
      role,
      accountType
    });
    await Promise.all([
      refreshTokenRepository.save(
        refreshTokenRepository.create({
          refreshToken: tokenPair.refreshToken,
          user_id: userId,
          deviceId,
        }),
      ),
      this.authCacheService.saveToken(tokenPair.accessToken, userId, deviceId),
    ]);
    return tokenPair;
  }
}
