import { BadRequestException, Injectable, Post, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RefreshTokenRepository } from '../../repository/services/refresh-token.repository';
import { UserRepository } from '../../repository/services/user.repository';
import { UserService } from '../../user/services/user.service';
import { SignInReqDto } from '../dto/req/sign-in.req.dto';
import { SignUpReqDto } from '../dto/req/sign-up.req.dto';
import { AuthResDto } from '../dto/res/auth.res.dto';
import { ITokenPair } from '../interfaces/token.interface';
import { AuthMapper } from './auth.mapper';
import { AuthCacheService } from './auth-cache.service';
import { TokenService } from './token.service';
import { IUserData } from "../interfaces/user-data.interface";
import { TokenPairResDto } from "../dto/res/token-pair.res.dto";
import { Configs, SecurityConfig } from '../../../configs/configs.type';
import { ConfigService } from '@nestjs/config';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserEntity } from '../../../database/entities/user.entity';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { ChangePasswordReqDto } from '../dto/req/change-password.req.dto';
import { errorMessages } from '../../../common/constants/error-messages.constant';

@Injectable()
export class AuthService {
  private readonly securityConfig: SecurityConfig;
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly configService: ConfigService<Configs>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
  }
  public async signUp(dto: SignUpReqDto): Promise<AuthResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);

       await this.userService.isEmailUniqueOrThrow(dto.email, userRepository);
      const hashedPassword = await bcrypt.hash(dto.password, this.securityConfig.hashPasswordRounds);

    const user = await userRepository.save(
      userRepository.create({ ...dto, password: hashedPassword }),
    );
    const tokenPair = await this.generateAndSaveTokenPair(
      user.id,
      dto.deviceId,
      user.role,
      user.account_type,
      entityManager
    );
    return AuthMapper.toResponseDTO(user, tokenPair);
    })
  }
  public async signIn(dto: SignInReqDto): Promise<AuthResDto> {
    return await this.entityManager.transaction(async (entityManager) =>{

      const userRepository = entityManager.getRepository(UserEntity);
      const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

    const user = await userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

      await refreshTokenRepository.delete({
        deviceId: dto.deviceId,
        user_id: user.id,
      });

    const tokenPair = await this.generateAndSaveTokenPair(
      user.id,
      dto.deviceId,
      user.role,
      user.account_type,
      entityManager
    );
    return AuthMapper.toResponseDTO(user, tokenPair);
    })
  }
 public async refresh(userData: IUserData): Promise<TokenPairResDto> {
   return await this.entityManager.transaction(async (entityManager) =>{
     const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

    await refreshTokenRepository.delete({deviceId: userData.deviceId, user_id: userData.userId});

    const generatedTokenPair = await this.generateAndSaveTokenPair(userData.userId, userData.deviceId, userData.role, userData.accountType, entityManager)
    return AuthMapper.toResponseTokenDTO(generatedTokenPair)
  })
  }

  public async signOut(userData: IUserData): Promise<void> {
    return await this.entityManager.transaction(async (entityManager) =>{
      const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

      await refreshTokenRepository.delete({
        deviceId: userData.deviceId,
        user_id: userData.userId
      })

      await this.authCacheService.deleteAccessToken(userData.userId, userData.deviceId)

    })

  }

  public async changePassword(userData: IUserData, dto: ChangePasswordReqDto): Promise<void> {
    return await this.entityManager.transaction(async (entityManager) =>{
      const userRepository = entityManager.getRepository(UserEntity);
      const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

      const user = await userRepository.findOne({ where: { id: userData.userId }})
      const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException(errorMessages.WRONG_OLD_PASSWORD)
      }
      const hashedPassword = await bcrypt.hash(dto.newPassword, this.securityConfig.hashPasswordRounds);
      await userRepository.update({id: user.id},{...user, password: hashedPassword});

      await refreshTokenRepository.delete({
        user_id: userData.userId
      })

      await this.authCacheService.deleteAllAccessTokens(userData.userId)
    })
  }
  private async generateAndSaveTokenPair(
    userId: string,
    deviceId: string,
    role: EUserRole,
    accountType: EAccountType,
    entityManager: EntityManager
  ): Promise<ITokenPair> {
    const tokenPair = await this.tokenService.generateTokenPair({
      userId,
      deviceId,
      role,
      accountType
    });
    const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

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
