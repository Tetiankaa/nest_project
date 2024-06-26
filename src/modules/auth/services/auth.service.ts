import { BadRequestException, Body, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/services/user.service';
import { SignInReqDto } from '../dto/req/sign-in.req.dto';
import { SignUpReqDto } from '../dto/req/sign-up.req.dto';
import { AuthResDto } from '../dto/res/auth.res.dto';
import { ITokenPair } from '../interfaces/token.interface';
import { AuthMapper } from './auth.mapper';
import { AuthCacheService } from './auth-cache.service';
import { TokenService } from './token.service';
import { IUserData } from '../interfaces/user-data.interface';
import { TokenPairResDto } from '../dto/res/token-pair.res.dto';
import { Configs, SecurityConfig, SendGridConfig } from '../../../configs/configs.type';
import { ConfigService } from '@nestjs/config';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserEntity } from '../../../database/entities/user.entity';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { ChangePasswordReqDto } from '../dto/req/change-password.req.dto';
import { errorMessages } from '../../../common/constants/error-messages.constant';
import { EmailService } from '../../email/email.service';
import { ForgotPasswordReqDto } from '../dto/req/forgot-password.req.dto';
import { EActionTokenType } from '../enums/action-token-type.enum';
import { ActionTokenEntity } from '../../../database/entities/action-token.entity';
import { EEmailType } from '../../email/enums/email-type.enum';
import { SetPasswordReqDto } from '../dto/req/set-password.req.dto';
import { CreateManagerReqDto } from '../dto/req/create-manager.req.dto';
import { PrivateUserResDto } from '../../user/dto/res/private-user-res.dto';
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
    private readonly entityManager: EntityManager
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
    this.sendGridConfig = this.configService.get<SendGridConfig>('sendGrid');
  }
  public async signUp(dto: SignUpReqDto): Promise<AuthResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);

       await this.userService.isEmailUniqueOrThrow(dto.email, userRepository);
      const hashedPassword = await bcrypt.hash(dto.password, this.securityConfig.hashPasswordRounds);

    const user = await userRepository.save(
      userRepository.create({ ...dto, password: hashedPassword }),
    );
    const tokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(
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

    const tokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(
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

    const generatedTokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(userData.userId, userData.deviceId, userData.role, userData.accountType, entityManager)
    return AuthMapper.toResponseTokenDTO(generatedTokenPair)
  })
  }

  public async signOut(userData: IUserData): Promise<void> {
     await this.entityManager.transaction(async (entityManager) =>{
      const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

      await refreshTokenRepository.delete({
        deviceId: userData.deviceId,
        user_id: userData.userId
      })

      await this.authCacheService.deleteAccessToken(userData.userId, userData.deviceId)

    })

  }

  public async changePassword(userData: IUserData, dto: ChangePasswordReqDto): Promise<void> {
     await this.entityManager.transaction(async (entityManager) =>{
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
  public async forgotPassword(dto: ForgotPasswordReqDto): Promise<void> {
     await this.entityManager.transaction(async (entityManager) =>{
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository = entityManager.getRepository(ActionTokenEntity);

      const user = await userRepository.findOne({
        where: { email: dto.email },
      });
      if (!user) return;
      const actionToken = await this.tokenService.generateActionToken({
        userId: user.id,
        accountType: user.account_type,
        role: user.role
      },EActionTokenType.FORGOT_PASSWORD)

       await actionTokenRepository.save(
         actionTokenRepository.create({
            user_id: user.id,
            tokenType: EActionTokenType.FORGOT_PASSWORD,
           actionToken
         })
       )

      await this.emailService.sendByEmailType(EEmailType.FORGOT_PASSWORD,
        {email: user.email, actionToken, frontUrl: this.sendGridConfig.front_url, fullName: `${user.firstName} ${user.lastName}`},
        user.email
        )
    })
  }

  public async setForgotPassword(dto: SetPasswordReqDto, userData: IUserData): Promise<void> {
     await this.entityManager.transaction(async (entityManager) =>{
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository = entityManager.getRepository(ActionTokenEntity);
      const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);

      const hashedPassword = await bcrypt.hash(dto.password, this.securityConfig.hashPasswordRounds);

      await userRepository.update({id: userData.userId},{ password: hashedPassword});

      await actionTokenRepository.delete({
        user_id: userData.userId,
        tokenType: EActionTokenType.FORGOT_PASSWORD
      })
      await refreshTokenRepository.delete({user_id: userData.userId})
      await this.authCacheService.deleteAllAccessTokens(userData.userId)
    })
  }

  public async createManagerAccount( userData: IUserData, dto: CreateManagerReqDto):Promise<PrivateUserResDto> {
    return  await this.entityManager.transaction(async (entityManager) =>{
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository = entityManager.getRepository(ActionTokenEntity);

      if (userData.role !== EUserRole.ADMINISTRATOR) {
        throw new UnauthorizedException(errorMessages.ACCESS_DENIED_USER_ROLE);
      }
      await this.userService.isEmailUniqueOrThrow(dto.email, userRepository);

      const hashedPassword = await bcrypt.hash(this.securityConfig.defaultManagerPassword, this.securityConfig.hashPasswordRounds);

      const manager = await userRepository.save(
        userRepository.create({ ...dto, password: hashedPassword, role: EUserRole.MANAGER }),
      );
      const actionToken = await this.tokenService.generateActionToken({
        userId: manager.id,
        accountType: manager.account_type,
        role: manager.role
      },EActionTokenType.SETUP_MANAGER)

      await actionTokenRepository.save(
        actionTokenRepository.create({
          user_id: manager.id,
          tokenType: EActionTokenType.SETUP_MANAGER,
          actionToken
        })
      )

      await this.emailService.sendByEmailType(EEmailType.SETUP_MANAGER_PASSWORD,{
        actionToken,
        fullName:`${manager.firstName} ${manager.lastName}`,
        frontUrl: this.sendGridConfig.front_url
        },manager.email
      )
      return AuthMapper.toPrivateResponseDTO(manager);
    })
  }

  public async setManagerPassword( userData: IUserData, dto: SetPasswordReqDto ): Promise<void> {
    await this.entityManager.transaction(async (entityManager) =>{
      const userRepository = entityManager.getRepository(UserEntity);
      const actionTokenRepository = entityManager.getRepository(ActionTokenEntity);

      const hashedPassword = await bcrypt.hash(dto.password, this.securityConfig.hashPasswordRounds);
      await userRepository.update({id: userData.userId},{ password: hashedPassword});
      await actionTokenRepository.delete({user_id: userData.userId, tokenType: EActionTokenType.SETUP_MANAGER})
    })
  }



}
