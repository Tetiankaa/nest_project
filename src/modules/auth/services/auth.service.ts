import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EntityManager, Repository } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import {
  Configs,
  SecurityConfig,
  SendGridConfig,
} from '../../../configs/configs.type';
import { ActionTokenEntity } from '../../../database/entities/action-token.entity';
import { DealershipEntity } from '../../../database/entities/dealership.entity';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { EEmailType } from '../../email/enums/email-type.enum';
import { EmailService } from '../../email/services/email.service';
import { PrivateUserResDto } from '../../user/dto/res/private-user-res.dto';
import { UserService } from '../../user/services/user.service';
import { ChangePasswordReqDto } from '../dto/req/change-password.req.dto';
import { CreateDealershipWorkerReqDto } from '../dto/req/create-dealership-worker.req.dto';
import { CreateManagerReqDto } from '../dto/req/create-manager.req.dto';
import { ForgotPasswordReqDto } from '../dto/req/forgot-password.req.dto';
import { SetPasswordReqDto } from '../dto/req/set-password.req.dto';
import { SignInReqDto } from '../dto/req/sign-in.req.dto';
import { SignUpReqDto } from '../dto/req/sign-up.req.dto';
import { AuthResDto } from '../dto/res/auth.res.dto';
import { TokenPairResDto } from '../dto/res/token-pair.res.dto';
import { EActionTokenType } from '../enums/action-token-type.enum';
import { IUserData } from '../interfaces/user-data.interface';
import { AuthMapper } from './auth.mapper';
import { AuthCacheService } from './auth-cache.service';
import { TokenService } from './token.service';
import { TokenUtilityService } from './token-utility.service';

@Injectable()
export class AuthService {
  private readonly securityConfig: SecurityConfig;
  private readonly sendGridConfig: SendGridConfig;

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly authCacheService: AuthCacheService,
    private readonly configService: ConfigService<Configs>,
    private readonly tokenUtilityService: TokenUtilityService,
    private readonly emailService: EmailService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
    this.sendGridConfig = this.configService.get<SendGridConfig>('sendGrid');
  }

  public async signUp(dto: SignUpReqDto): Promise<AuthResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const refreshTokenRepository =
        entityManager.getRepository(RefreshTokenEntity);

      await this.userService.isEmailUniqueOrThrow(dto.email, userRepository);

      const hashedPassword = await this.hashPassword(dto.password);

      const user = await userRepository.save(
        userRepository.create({ ...dto, password: hashedPassword }),
      );
      const tokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(
        user.id,
        dto.deviceId,
        user.role,
        user.account_type,
        refreshTokenRepository,
      );
      return AuthMapper.toResponseDTO(user, tokenPair);
    });
  }

  public async signIn(dto: SignInReqDto): Promise<AuthResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const refreshTokenRepository =
        entityManager.getRepository(RefreshTokenEntity);

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

      const tokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(
        user.id,
        dto.deviceId,
        user.role,
        user.account_type,
        refreshTokenRepository,
      );
      return AuthMapper.toResponseDTO(user, tokenPair);
    });
  }

  public async refresh(userData: IUserData): Promise<TokenPairResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const refreshTokenRepository =
        entityManager.getRepository(RefreshTokenEntity);

      await refreshTokenRepository.delete({
        deviceId: userData.deviceId,
        user_id: userData.userId,
      });

      const generatedTokenPair =
        await this.tokenUtilityService.generateAndSaveTokenPair(
          userData.userId,
          userData.deviceId,
          userData.role,
          userData.accountType,
          refreshTokenRepository,
        );
      return AuthMapper.toResponseTokenDTO(generatedTokenPair);
    });
  }

  public async signOut(userData: IUserData): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const refreshTokenRepository =
        entityManager.getRepository(RefreshTokenEntity);

      await this.deleteRefreshAccessTokens(
        userData.userId,
        refreshTokenRepository,
        userData.deviceId,
      );
    });
  }

  public async changePassword(
    userData: IUserData,
    dto: ChangePasswordReqDto,
  ): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const refreshTokenRepository =
        entityManager.getRepository(RefreshTokenEntity);

      const user = await userRepository.findOne({
        where: { id: userData.userId },
      });
      const isPasswordValid = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException(errorMessages.WRONG_OLD_PASSWORD);
      }
      const hashedPassword = await this.hashPassword(dto.newPassword);
      await userRepository.update(
        { id: user.id },
        { ...user, password: hashedPassword },
      );
      await this.deleteRefreshAccessTokens(
        userData.userId,
        refreshTokenRepository,
      );
    });
  }

  public async forgotPassword(dto: ForgotPasswordReqDto): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository =
        entityManager.getRepository(ActionTokenEntity);

      const user = await userRepository.findOne({
        where: { email: dto.email },
      });
      if (!user) return;

      const actionToken = await this.generateAndSaveActionToken(
        user,
        EActionTokenType.FORGOT_PASSWORD,
        actionTokenRepository,
      );

      await this.emailService.sendByEmailType(
        EEmailType.FORGOT_PASSWORD,
        {
          email: user.email,
          actionToken,
          frontUrl: this.sendGridConfig.front_url,
          fullName: `${user.firstName} ${user.lastName}`,
        },
        user.email,
      );
    });
  }

  public async setForgotPassword(
    dto: SetPasswordReqDto,
    userData: IUserData,
  ): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository =
        entityManager.getRepository(ActionTokenEntity);
      const refreshTokenRepository =
        entityManager.getRepository(RefreshTokenEntity);

      const hashedPassword = await this.hashPassword(dto.password);

      await this.updatePasswordAndDeleteActionToken(
        userData.userId,
        hashedPassword,
        EActionTokenType.FORGOT_PASSWORD,
        userRepository,
        actionTokenRepository,
      );

      await this.deleteRefreshAccessTokens(
        userData.userId,
        refreshTokenRepository,
      );
    });
  }

  public async createManagerAccount(
    dto: CreateManagerReqDto,
  ): Promise<PrivateUserResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository =
        entityManager.getRepository(ActionTokenEntity);
      await this.userService.isEmailUniqueOrThrow(dto.email, userRepository);

      const hashedPassword = await this.hashPassword(
        this.securityConfig.defaultManagerPassword,
      );

      const manager = await userRepository.save(
        userRepository.create({
          ...dto,
          password: hashedPassword,
          role: EUserRole.MANAGER,
        }),
      );
      const actionToken = await this.generateAndSaveActionToken(
        manager,
        EActionTokenType.SETUP_MANAGER,
        actionTokenRepository,
      );

      await this.emailService.sendByEmailType(
        EEmailType.SETUP_MANAGER_PASSWORD,
        {
          actionToken,
          fullName: `${manager.firstName} ${manager.lastName}`,
          frontUrl: this.sendGridConfig.front_url,
        },
        manager.email,
      );
      return AuthMapper.toPrivateResponseDTO(manager);
    });
  }

  public async setManagerPassword(
    userData: IUserData,
    dto: SetPasswordReqDto,
  ): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository =
        entityManager.getRepository(ActionTokenEntity);

      const hashedPassword = await this.hashPassword(dto.password);

      await this.updatePasswordAndDeleteActionToken(
        userData.userId,
        hashedPassword,
        EActionTokenType.SETUP_MANAGER,
        userRepository,
        actionTokenRepository,
      );
    });
  }

  public async createDealershipWorkerAccount(
    dto: CreateDealershipWorkerReqDto,
    userData: IUserData,
  ): Promise<PrivateUserResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const dealershipRepository =
        entityManager.getRepository(DealershipEntity);
      const actionTokenRepository =
        entityManager.getRepository(ActionTokenEntity);

      await this.userService.isEmailUniqueOrThrow(dto.email, userRepository);

      const hashedPassword = await this.hashPassword(
        this.securityConfig.defaultDealershipWorkerPassword,
      );

      const worker = await userRepository.save(
        userRepository.create({
          ...dto,
          password: hashedPassword,
          account_type: EAccountType.PREMIUM,
          role: dto.role,
          dealership_id: userData.dealershipId,
        }),
      );
      const actionToken = await this.generateAndSaveActionToken(
        worker,
        EActionTokenType.SETUP_DEALERSHIP_WORKER_PASSWORD,
        actionTokenRepository,
      );
      const dealership = await dealershipRepository.findOne({
        where: { id: userData.dealershipId },
      });
      await this.emailService.sendByEmailType(
        EEmailType.SETUP_DEALERSHIP_WORKER_PASSWORD,
        {
          actionToken,
          fullName: `${worker.firstName} ${worker.lastName}`,
          frontUrl: this.sendGridConfig.front_url,
          company_name: dealership.name,
          user_role: worker.role,
        },
        worker.email,
      );
      return AuthMapper.toPrivateResponseDTO(worker);
    });
  }

  public async setWorkerPassword(
    userData: IUserData,
    dto: SetPasswordReqDto,
  ): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository =
        entityManager.getRepository(ActionTokenEntity);

      const hashedPassword = await this.hashPassword(dto.password);

      await this.updatePasswordAndDeleteActionToken(
        userData.userId,
        hashedPassword,
        EActionTokenType.SETUP_DEALERSHIP_WORKER_PASSWORD,
        userRepository,
        actionTokenRepository,
      );
    });
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.securityConfig.hashPasswordRounds);
  }

  public async deleteRefreshAccessTokens(
    userId: string,
    repository: Repository<RefreshTokenEntity>,
    deviceId?: string,
  ): Promise<void> {
    if (deviceId) {
      await repository.delete({ deviceId, user_id: userId });
      await this.authCacheService.deleteAccessToken(userId, deviceId);
    } else {
      await repository.delete({ user_id: userId });
      await this.authCacheService.deleteAllAccessTokens(userId);
    }
  }

  private async generateAndSaveActionToken(
    user: UserEntity,
    tokenType: EActionTokenType,
    repository: Repository<ActionTokenEntity>,
  ): Promise<string> {
    const actionToken = await this.tokenService.generateActionToken(
      {
        userId: user.id,
        accountType: user.account_type,
        role: user.role,
      },
      tokenType,
    );

    await repository.save(
      repository.create({
        user_id: user.id,
        tokenType,
        actionToken,
      }),
    );

    return actionToken;
  }

  private async updatePasswordAndDeleteActionToken(
    userId: string,
    hashedPassword: string,
    tokenType: EActionTokenType,
    userRepository: Repository<UserEntity>,
    actionTokenRepository: Repository<ActionTokenEntity>,
  ): Promise<void> {
    await userRepository.update({ id: userId }, { password: hashedPassword });

    await actionTokenRepository.delete({
      user_id: userId,
      tokenType: tokenType,
    });
  }
}
