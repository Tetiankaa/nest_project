import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, MoreThan } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { TimeHelper } from '../../../common/helpers/time.helper';
import { Configs, SecurityConfig } from '../../../configs/configs.type';
import { CarEntity } from '../../../database/entities/car.entity';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { ECurrency } from '../../../database/entities/enums/currency.enum';
import { EPostStatus } from '../../../database/entities/enums/post-status.enum';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { ImageEntity } from '../../../database/entities/image.entity';
import { PostEntity } from '../../../database/entities/post.entity';
import { PriceEntity } from '../../../database/entities/price.entity';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { ViewEntity } from '../../../database/entities/view.entity';
import { ITokenPair } from '../../auth/interfaces/token.interface';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { AuthService } from '../../auth/services/auth.service';
import { AuthCacheService } from '../../auth/services/auth-cache.service';
import { TokenUtilityService } from '../../auth/services/token-utility.service';
import { BaseCarReqDto } from '../../car/dto/req/base-car.req.dto';
import { PriceResDto } from '../../car/dto/res/price.res.dto';
import { EEmailType } from '../../email/enums/email-type.enum';
import { EmailService } from '../../email/services/email.service';
import { ExchangeRateResDto } from '../../exchange-rate/dto/res/exchange-rate.res.dto';
import { ExchangeRateService } from '../../exchange-rate/services/exchange-rate.service';
import { ContentTypeEnum } from '../../file-storage/models/enums/content-type.enum';
import { FileStorageService } from '../../file-storage/services/file-storage.service';
import { PaginationResDto } from '../../pagination/dto/res/pagination.res.dto';
import { PaginationService } from '../../pagination/services/pagination.service';
import { PostRepository } from '../../repository/services/post.repository';
import { ViewRepository } from '../../repository/services/view.repository';
import { CreatePostReqDto } from '../dto/req/create-post.req.dto';
import { QueryPostReqDto } from '../dto/req/query-post.req.dto';
import { QueryPostProfanityReqDto } from '../dto/req/query-post-profanity.req.dto';
import { UpdatePostReqDto } from '../dto/req/update-post.req.dto';
import { UpdatePostAfterProfanityReqDto } from '../dto/req/update-post-after-profanity.req.dto';
import { PostInfoResDto } from '../dto/res/post-info.res.dto';
import { PrivatePostResDto } from '../dto/res/private-post.res.dto';
import { PublicPostResDto } from '../dto/res/public-post.res.dto';
import { PostMapper } from './post.mapper';
import { PriceService } from './price.service';
import { ProfanityService } from './profanity.service';

@Injectable()
export class PostService {
  private readonly securityConfig: SecurityConfig;
  constructor(
    private readonly emailService: EmailService,
    private readonly tokenUtilityService: TokenUtilityService,
    private readonly profanityService: ProfanityService,
    private readonly authCacheService: AuthCacheService,
    private readonly configService: ConfigService<Configs>,
    private readonly priceService: PriceService,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly authService: AuthService,
    private readonly postRepository: PostRepository,
    private readonly viewRepository: ViewRepository,
    private readonly paginationService: PaginationService,
    private readonly fileStorageService: FileStorageService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
  }
  public async savePost(
    dto: CreatePostReqDto,
    userData: IUserData,
  ): Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const carRepository = entityManager.getRepository(CarEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);

      const postsCount = await postRepository.count({
        where: { user_id: userData.userId },
      });

      if (userData.accountType === EAccountType.BASIC && postsCount >= 1) {
        throw new ForbiddenException(errorMessages.ONE_POST_FOR_BASIC_ACCOUNT);
      }
      const rates = await this.exchangeRateService.getAll(entityManager);

      const calculatedPrices = await this.calculatePrices(
        dto.enteredPrice,
        dto.enteredCurrency,
        rates,
      );
      const user = await this.findUserById(userData.userId, entityManager);

      const isProfanityPresent = await this.checkProfanityAndSendEmailForUser(
        dto,
        user,
      );

      const savedCar = await carRepository.save(
        carRepository.create({ ...dto }),
      );

      await this.priceService.savePrices(
        calculatedPrices,
        savedCar.id,
        priceRepository,
      );

      const post = await postRepository.save(
        postRepository.create({
          user_id: userData.userId,
          car_id: savedCar.id,
          profanityEdits: 0,
          status: isProfanityPresent
            ? EPostStatus.NOT_ACTIVE
            : EPostStatus.ACTIVE,
        }),
      );

      let tokens: ITokenPair;

      if (postsCount === 0 && userData.role === EUserRole.BUYER) {
        tokens = await this.upgradeUserToSeller(
          user,
          userData.deviceId,
          entityManager,
        );
      }

      const fullPost = await postRepository.findOne({
        where: { id: post.id },
        relations: ['car', 'car.price', 'car.images', 'user'],
      });

      return PostMapper.toPrivateResponse(fullPost, rates, tokens);
    });
  }

  public async saveView(postId: string): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    if (post.status == EPostStatus.ACTIVE) {
      await this.viewRepository.save(
        this.viewRepository.create({ post_id: postId }),
      );
    }
  }

  public async getAll(
    query: QueryPostReqDto,
  ): Promise<PaginationResDto<PublicPostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(
      this.postRepository,
      query,
      ['car', 'user'],
    );
    const rates = await this.exchangeRateService.getAll(this.entityManager);
    return PostMapper.toPublicResponseList(posts, rates);
  }

  public async getMyPosts(
    userData: IUserData,
    query: QueryPostReqDto,
  ): Promise<PaginationResDto<PrivatePostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(
      this.postRepository,
      query,
      ['car', 'user'],
      userData.userId,
    );
    const rates = await this.exchangeRateService.getAll(this.entityManager);
    return PostMapper.toPrivateResponseList(posts, rates);
  }

  public async getPublicPostById(postId: string): Promise<PublicPostResDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId, isDeleted: false, status: EPostStatus.ACTIVE },
      relations: ['car', 'car.price', 'car.images', 'user'],
    });
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    const rates = await this.exchangeRateService.getAll(this.entityManager);
    return PostMapper.toPublicResponse(post, rates);
  }
  public async getPrivatePostById(
    postId: string,
    userData: IUserData,
  ): Promise<PrivatePostResDto> {
    const post = await this.postRepository.findOne({
      where: { id: postId, user_id: userData.userId },
      relations: ['car', 'car.price', 'car.images', 'user'],
    });
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    const rates = await this.exchangeRateService.getAll(this.entityManager);
    return PostMapper.toPrivateResponse(post, rates);
  }

  public async archivePostById(
    postId: string,
    userData: IUserData,
  ): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id: postId, user_id: userData.userId },
    });
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    if (post.status !== EPostStatus.ACTIVE) {
      throw new ForbiddenException(errorMessages.POST_IS_ALREADY_NOT_ACTIVE);
    }

    await this.postRepository.save({
      ...post,
      isDeleted: true,
      status: EPostStatus.NOT_ACTIVE,
    });
  }
  public async deleteForeverPostById(
    postId: string,
    userData: IUserData,
  ): Promise<void> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const post = await postRepository.findOne({
        where: { id: postId, user_id: userData.userId },
        relations: ['car', 'car.price', 'car.images', 'views'],
      });
      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND);
      }
      if (post.profanityEdits === this.securityConfig.max_profanity_edits) {
        throw new ForbiddenException(
          errorMessages.CANNOT_DELETE_POST_ACHIEVED_MAX_NUMBER_OF_PROFANITY_EDITS,
        );
      }

      await this.removePost(post, entityManager);
    });
  }
  public async getMyArchivePosts(
    userData: IUserData,
    query: QueryPostReqDto,
  ): Promise<PaginationResDto<PrivatePostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(
      this.postRepository,
      query,
      ['car', 'user'],
      userData.userId,
      EPostStatus.NOT_ACTIVE,
      false,
    );
    return PostMapper.toPrivateResponseList(posts);
  }
  public async restorePostFromArchive(
    postId: string,
    userData: IUserData,
  ): Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);

      const post = await postRepository.findOne({
        where: {
          id: postId,
          user_id: userData.userId,
          isDeleted: true,
          status: EPostStatus.NOT_ACTIVE,
        },
        relations: ['car', 'car.price'],
      });

      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND);
      }
      const rates = await this.exchangeRateService.getAll(entityManager);

      const calculatedPrices = await this.calculatePrices(
        post.car.enteredPrice,
        post.car.enteredCurrency,
        rates,
      );

      await entityManager.remove(PriceEntity, post.car.price);
      await this.priceService.savePrices(
        calculatedPrices,
        post.car.id,
        priceRepository,
      );

      await postRepository.save({
        ...post,
        isDeleted: false,
        status: EPostStatus.ACTIVE,
      });

      const restoredPost = await postRepository.findOne({
        where: { id: postId },
        relations: ['car', 'car.price', 'car.images', 'user'],
      });

      return PostMapper.toPrivateResponse(restoredPost, rates);
    });
  }
  public async updatePost(
    postId: string,
    userData: IUserData,
    dto: UpdatePostReqDto,
  ): Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);
      const carRepository = entityManager.getRepository(CarEntity);

      const post = await postRepository.findOne({
        where: {
          id: postId,
          user_id: userData.userId,
          isDeleted: false,
          status: EPostStatus.ACTIVE,
        },
        relations: ['car', 'car.price', 'user'],
      });

      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND);
      }
      if (
        (dto.enteredPrice && !dto.enteredCurrency) ||
        (dto.enteredCurrency && !dto.enteredPrice)
      ) {
        throw new BadRequestException(
          errorMessages.PRICE_AND_CURRENCY_REQUIRED,
        );
      }

      const rates = await this.exchangeRateService.getAll(entityManager);

      let calculatedPrices: PriceResDto[];
      if (dto.enteredCurrency && dto.enteredPrice) {
        calculatedPrices = await this.calculatePrices(
          dto.enteredPrice,
          dto.enteredCurrency,
          rates,
        );
        await entityManager.remove(PriceEntity, post.car.price);
        await this.priceService.savePrices(
          calculatedPrices,
          post.car.id,
          priceRepository,
        );
      }

      const isProfanityPresent = await this.checkProfanityAndSendEmailForUser(
        dto,
        post.user,
      );

      await carRepository.save({ ...post.car, ...dto });
      await postRepository.save({
        ...post,
        status: isProfanityPresent
          ? EPostStatus.NOT_ACTIVE
          : EPostStatus.ACTIVE,
      });

      const fullPost = await postRepository.findOne({
        where: { id: post.id },
        relations: ['car', 'car.price', 'car.images', 'user'],
      });
      return PostMapper.toPrivateResponse(fullPost, rates);
    });
  }

  public async updatePostAfterProfanity(
    postId: string,
    userData: IUserData,
    dto: UpdatePostAfterProfanityReqDto,
  ): Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const carRepository = entityManager.getRepository(CarEntity);

      const oldPost = await postRepository.findOne({
        where: {
          id: postId,
          user_id: userData.userId,
          isDeleted: false,
          status: EPostStatus.NOT_ACTIVE,
        },
        relations: ['car', 'user'],
      });

      if (!oldPost) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND);
      }

      if (oldPost.profanityEdits >= this.securityConfig.max_profanity_edits) {
        throw new ForbiddenException(
          errorMessages.ACHIEVED_MAX_NUMBER_OF_PROFANITY_EDITS,
        );
      }
      const isProfanityPresent = this.profanityService.checkForProfanity(dto);
      await carRepository.save({ ...oldPost.car, ...dto });

      if (isProfanityPresent) {
        oldPost.profanityEdits += 1;
        await this.notifyUserAndManager(oldPost);
      } else {
        oldPost.profanityEdits = 0;
        oldPost.status = EPostStatus.ACTIVE;
      }
      await postRepository.save({
        ...oldPost,
      });
      const fullPost = await postRepository.findOne({
        where: { id: oldPost.id },
        relations: ['car', 'car.price', 'car.images', 'user'],
      });

      const rates = await this.exchangeRateService.getAll(entityManager);

      return isProfanityPresent
        ? PostMapper.toPrivateResponse(fullPost)
        : PostMapper.toPrivateResponse(fullPost, rates);
    });
  }

  public async getPostInfo(
    postId: string,
    userData: IUserData,
  ): Promise<PostInfoResDto> {
    if (userData.accountType !== EAccountType.PREMIUM) {
      throw new ForbiddenException(
        errorMessages.ACCESS_DENIED_FOR_BASIC_ACCOUNT,
      );
    }
    const post = await this.postRepository.findOne({
      where: { id: postId, user_id: userData.userId },
      relations: ['car'],
    });
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    if (
      post.profanityEdits > 0 ||
      (!post.isDeleted && post.status === EPostStatus.NOT_ACTIVE)
    ) {
      throw new ForbiddenException(
        errorMessages.ACCESS_DENIED_FOR_PROFANE_POST,
      );
    }
    const totalViews = await this.getViewCount(postId);
    const viewsPerDay = await this.getViewCount(
      postId,
      TimeHelper.subtractByParams(24, 'hours'),
    );
    const viewsPerWeek = await this.getViewCount(
      postId,
      TimeHelper.subtractByParams(7, 'days'),
    );
    const viewsPerMonth = await this.getViewCount(
      postId,
      TimeHelper.subtractByParams(1, 'month'),
    );
    const averagePriceUkraine = await this.postRepository.getAveragePrice(
      post.car.enteredCurrency,
      post.car.brand,
      post.car.model,
    );

    const avgPriceByCarRegion = await this.postRepository.getAveragePrice(
      post.car.enteredCurrency,
      post.car.brand,
      post.car.model,
      post.car.region,
    );
    return {
      postId: post.id,
      totalViews,
      viewsPerDay,
      viewsPerWeek,
      viewsPerMonth,
      currency: post.car.enteredCurrency,
      averagePriceUkraine,
      avgPriceByCarRegion,
    };
  }

  public async getPostsWithProfanity(
    query: QueryPostProfanityReqDto,
  ): Promise<PaginationResDto<PrivatePostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(
      this.postRepository,
      { ...query, isDeleted: false },
      ['car', 'user'],
      null,
      EPostStatus.NOT_ACTIVE,
      false,
    );

    return PostMapper.toPrivateResponseList(posts);
  }
  public async getPostWithProfanityById(
    postId: string,
  ): Promise<PrivatePostResDto> {
    const post = await this.postRepository.findOne({
      where: {
        id: postId,
        status: EPostStatus.NOT_ACTIVE,
        isDeleted: false,
      },
      relations: ['car', 'car.price', 'car.images', 'user'],
    });
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    return PostMapper.toPrivateResponse(post);
  }

  public async uploadImages(
    postId: string,
    images: Express.Multer.File[],
    userData: IUserData,
  ): Promise<void> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const imageRepository = entityManager.getRepository(ImageEntity);

      const post = await postRepository.findOne({
        where: { id: postId, user_id: userData.userId },
        relations: ['car.images'],
      });
      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND);
      }
      if (post.status === EPostStatus.NOT_ACTIVE) {
        throw new ForbiddenException(
          errorMessages.ONLY_ACTIVE_POSTS_CAN_HAVE_IMAGES_DOWNLOADED,
        );
      }
      const isMaxNumberOfImagesAchieved =
        post.car.images.length + images.length >
        this.securityConfig.max_upload_images;

      if (isMaxNumberOfImagesAchieved) {
        throw new ForbiddenException(
          errorMessages.MAXIMUM_NUMBER_OF_IMAGES_EXCEEDED(
            this.securityConfig.max_upload_images,
          ),
        );
      }
      await Promise.all(
        images.map(async (image) => {
          const imagePath = await this.fileStorageService.uploadFile(
            image,
            ContentTypeEnum.IMAGES,
            post.id,
          );
          await imageRepository.save(
            imageRepository.create({ car_id: post.car_id, name: imagePath }),
          );
        }),
      );
    });
  }

  public async deleteImage(
    postId: string,
    imageId: string,
    userData: IUserData,
  ): Promise<void> {
    return await this.entityManager.transaction(async (entityManager) => {
      const postRepository = entityManager.getRepository(PostEntity);
      const imageRepository = entityManager.getRepository(ImageEntity);

      const post = await postRepository.findOne({
        where: { id: postId, user_id: userData.userId },
        relations: ['car.images'],
      });
      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND);
      }

      const image = post.car.images.find((img) => img.id === imageId);

      if (!image) {
        throw new NotFoundException(errorMessages.IMAGE_NOT_FOUND);
      }

      await this.fileStorageService.deleteFile(image.name);

      await imageRepository.remove(image);
    });
  }

  public async removePost(
    post: PostEntity,
    entityManager: EntityManager,
  ): Promise<void> {
    if (post.views) {
      await entityManager.remove(ViewEntity, post.views);
    }

    if (post.car) {
      if (post.car.images.length) {
        for (const image of post.car.images) {
          await this.fileStorageService.deleteFile(image.name);
          await entityManager.remove(ImageEntity, image);
        }
      }

      if (post.car.price) {
        await entityManager.remove(PriceEntity, post.car.price);
      }
      await entityManager.remove(PostEntity, post);
      await entityManager.remove(CarEntity, post.car);
    }
  }
  private async calculatePrices(
    enteredPrice: number,
    enteredCurrency: ECurrency,
    rates: ExchangeRateResDto,
  ): Promise<PriceResDto[]> {
    return await this.priceService.calculatePrices(
      enteredPrice,
      enteredCurrency,
      rates,
    );
  }
  private async checkProfanityAndSendEmailForUser(
    dto: Partial<BaseCarReqDto>,
    user: UserEntity,
  ): Promise<boolean> {
    const isProfanityPresent = this.profanityService.checkForProfanity(dto);
    if (isProfanityPresent) {
      await this.emailService.sendByEmailType(
        EEmailType.POST_PROFANITY_DETECTED_FOR_USER,
        {
          firstName: user.firstName,
          numberOfAttempts: this.securityConfig.max_profanity_edits,
        },
        user.email,
      );
      return true;
    }
  }
  private async getViewCount(postId: string, dateRange?: Date) {
    return await this.viewRepository.count({
      where: {
        post_id: postId,
        createdAt: dateRange ? MoreThan(dateRange) : undefined,
      },
    });
  }
  private async findUserById(
    userId: string,
    entityManager: EntityManager,
  ): Promise<UserEntity> {
    const user = await entityManager
      .getRepository(UserEntity)
      .findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(errorMessages.USER_NOT_FOUND);
    return user;
  }

  private async upgradeUserToSeller(
    user: UserEntity,
    deviceId: string,
    entityManager: EntityManager,
  ): Promise<ITokenPair> {
    const userRepository = entityManager.getRepository(UserEntity);
    const refreshTokenRepository =
      entityManager.getRepository(RefreshTokenEntity);
    user.role = EUserRole.SELLER;
    await userRepository.save({ ...user });

    await this.authService.deleteRefreshAccessTokens(
      user.id,
      refreshTokenRepository,
    );

    return await this.tokenUtilityService.generateAndSaveTokenPair(
      user.id,
      deviceId,
      user.role,
      user.account_type,
      refreshTokenRepository,
    );
  }
  private async notifyUserAndManager(post: PostEntity): Promise<void> {
    await this.emailService.sendByEmailType(
      EEmailType.POST_PROFANITY_DETECTED_FOR_USER,
      {
        firstName: post.user.firstName,
        numberOfAttempts:
          this.securityConfig.max_profanity_edits - post.profanityEdits,
      },
      post.user.email,
    );
    if (post.profanityEdits >= this.securityConfig.max_profanity_edits) {
      await this.emailService.sendByEmailType(
        EEmailType.POST_PROFANITY_DETECTED_FOR_MANAGER,
        {
          postId: post.id,
          numberOfAttempts: this.securityConfig.max_profanity_edits,
          firstName: post.user.firstName,
          lastName: post.user.lastName,
          email: post.user.email,
          submissionDate: TimeHelper.getCurrentDate(),
        },
        this.securityConfig.manager_email,
      );
    }
  }
}
