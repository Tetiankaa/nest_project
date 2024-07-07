import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { PostEntity } from '../../../database/entities/post.entity';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { AuthResDto } from '../../auth/dto/res/auth.res.dto';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { AuthMapper } from '../../auth/services/auth.mapper';
import { AuthService } from '../../auth/services/auth.service';
import { TokenUtilityService } from '../../auth/services/token-utility.service';
import { PostService } from '../../post/services/post.service';
import { UserRepository } from '../../repository/services/user.repository';
import { UpdateUserReqDto } from '../dto/req/update-user-req.dto';
import { PrivateUserResDto } from '../dto/res/private-user-res.dto';
import { PublicUserResDto } from '../dto/res/public-user-res.dto';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenUtilityService: TokenUtilityService,
    @Inject(forwardRef(() => PostService))
    private readonly postService: PostService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  public async isEmailUniqueOrThrow(
    email: string,
    userRepository?: Repository<UserEntity>,
  ): Promise<void> {
    const user = await userRepository.findOneBy({ email });
    if (user) throw new ConflictException(errorMessages.EMAIL_ALREADY_EXISTS);
  }

  public async getById(id: string): Promise<PublicUserResDto> {
    const user = await this.findUserByIdOrThrow(id);
    return UserMapper.toPublicResponseDTO(user);
  }
  public async getMe(userData: IUserData): Promise<PrivateUserResDto> {
    const { userId } = userData;
    const user = await this.findUserByIdOrThrow(userId);
    return UserMapper.toPrivateResponseDTO(user);
  }

  public async deleteMe(userData: IUserData): Promise<void> {
    await this.entityManager.transaction(async (entityManager) => {
      const userRepo = entityManager.getRepository(UserEntity);
      const refreshTokenRepo = entityManager.getRepository(RefreshTokenEntity);
      const postRepository = entityManager.getRepository(PostEntity);

      const allPosts = await postRepository.find({
        where: { user_id: userData.userId },
        relations: ['car', 'car.images', 'car.price', 'views'],
      });
      await Promise.all(
        allPosts.map(async (post) => {
          await this.postService.removePost(post, entityManager);
        }),
      );
      await this.authService.deleteRefreshAccessTokens(
        userData.userId,
        refreshTokenRepo,
      );
      await userRepo.delete({ id: userData.userId });
    });
  }

  public async updateMe(
    userData: IUserData,
    dataToUpdate: UpdateUserReqDto,
  ): Promise<PrivateUserResDto> {
    const user = await this.findUserByIdOrThrow(userData.userId);
    const updatedUser = await this.userRepository.save({
      ...user,
      ...dataToUpdate,
    });
    return UserMapper.toPrivateResponseDTO(updatedUser);
  }

  public async upgradeToPremium(userData: IUserData): Promise<AuthResDto> {
    if (userData.accountType === EAccountType.PREMIUM) {
      return null;
    }

    return await this.entityManager.transaction(async (entityManager) => {
      const userRepo = entityManager.getRepository(UserEntity);
      const refreshTokenRepo = entityManager.getRepository(RefreshTokenEntity);

      const user = await userRepo.findOneBy({ id: userData.userId });

      const updatedUser = await userRepo.save({
        ...user,
        account_type: EAccountType.PREMIUM,
      });

      await this.authService.deleteRefreshAccessTokens(
        userData.userId,
        refreshTokenRepo,
      );

      const tokenPair = await this.tokenUtilityService.generateAndSaveTokenPair(
        userData.userId,
        userData.deviceId,
        userData.role,
        updatedUser.account_type,
        refreshTokenRepo,
      );

      return AuthMapper.toResponseDTO(updatedUser, tokenPair);
    });
  }

  private async findUserByIdOrThrow(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(errorMessages.USER_NOT_FOUND);
    }
    return user;
  }
}
