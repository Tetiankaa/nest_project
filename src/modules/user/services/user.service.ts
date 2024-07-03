import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { IUserData } from '../../auth/interfaces/user-data.interface';
import { LoggerService } from '../../logger/logger.service';
import { UserRepository } from '../../repository/services/user.repository';
import { UpdateUserReqDto } from '../dto/req/update-user-req.dto';
import { PrivateUserResDto } from '../dto/res/private-user-res.dto';
import { UserMapper } from './user.mapper';
import { errorMessages } from '../../../common/constants/error-messages.constant';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from '../../../database/entities/user.entity';
import { PublicUserResDto } from '../dto/res/public-user-res.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { AuthCacheService } from '../../auth/services/auth-cache.service';
import { AuthResDto } from '../../auth/dto/res/auth.res.dto';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { AuthService } from '../../auth/services/auth.service';
import { AuthMapper } from '../../auth/services/auth.mapper';
import { TokenUtilityService } from '../../auth/services/token-utility.service';

@Injectable()
export class UserService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly userRepository: UserRepository,
    private readonly authCacheService: AuthCacheService,
    private readonly tokenUtilityService: TokenUtilityService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager
  ) {}

  public async isEmailUniqueOrThrow(email: string, userRepository?: Repository<UserEntity>): Promise<void> {
    const user = await userRepository.findOneBy({ email });
    if (user)
      throw new ConflictException(errorMessages.EMAIL_ALREADY_EXISTS);
  }

  public async getById(id: string): Promise<PublicUserResDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(errorMessages.USER_NOT_FOUND);
    }
    return UserMapper.toPublicResponseDTO(user);
  }
  public async getMe(userData: IUserData): Promise<PrivateUserResDto> {
    const { userId } = userData;
    const user = await this.userRepository.findOneBy({ id: userId });
    return UserMapper.toPrivateResponseDTO(user);
  }

  public async deleteMe(userData: IUserData): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepo = entityManager.getRepository(UserEntity);
      const refreshTokenRepo = entityManager.getRepository(RefreshTokenEntity);
// TODO delete all posts of a user
      await this.authCacheService.deleteAllAccessTokens(userData.userId)
      await refreshTokenRepo.delete({ user_id: userData.userId });
      await userRepo.delete({ id: userData.userId });
    });
  }

  public async updateMe(userData: IUserData, dataToUpdate: UpdateUserReqDto): Promise<PrivateUserResDto> {
      const user = await this.userRepository.findOneBy({id: userData.userId});
      const updatedUser = await this.userRepository.save({...user, ...dataToUpdate});
      return UserMapper.toPrivateResponseDTO(updatedUser);
  }

  public async upgradeToPremium(userData: IUserData): Promise<AuthResDto> {
    if (userData.accountType === EAccountType.PREMIUM) {
      return null;
    }

   return await this.entityManager.transaction(async (entityManager) => {
      const userRepo = entityManager.getRepository(UserEntity);
      const refreshTokenRepo = entityManager.getRepository(RefreshTokenEntity);

      const user = await userRepo.findOneBy({id: userData.userId});

      const updatedUser = await userRepo.save({...user, account_type: EAccountType.PREMIUM});

      await this.authCacheService.deleteAllAccessTokens(userData.userId)
      await refreshTokenRepo.delete({ user_id: userData.userId });

      const tokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(userData.userId,userData.deviceId, userData.role, updatedUser.account_type,refreshTokenRepo);

      return AuthMapper.toResponseDTO(updatedUser, tokenPair)

    });



  }

  //TODO make upload avatar endpoint

  // public async uploadAvatar(
  //   userData: IUserData,
  //   file: Express.Multer.File,
  // ): Promise<void> {
  //   const image = await this.fileStorageService.uploadFile(
  //     file,
  //     ContentTypeEnum.AVATAR,
  //     userData.userId,
  //   );
  //   await this.userRepository.update(userData.userId, { image });
  // }
  // public async deleteAvatar(userData: IUserData): Promise<void> {
  //   const user = await this.userRepository.findOneBy({ id: userData.userId });
  //
  //   if (user.image) {
  //     await this.fileStorageService.deleteFile(user.image);
  //     await this.userRepository.save(
  //       this.userRepository.merge(user, { image: null }),
  //     );
  //   }
  // }
}
