import {
  BadRequestException, Body,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreatePostReqDto } from '../dto/req/create-post.req.dto';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { EmailService } from '../../email/email.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TokenUtilityService } from '../../auth/services/token-utility.service';
import { PostEntity } from '../../../database/entities/post.entity';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { errorMessages } from '../../../common/constants/error-messages.constant';
import { ProfanityService } from './profanity.service';
import { CarEntity } from '../../../database/entities/car.entity';
import { EPostStatus } from '../../../database/entities/enums/post-status.enum';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { UserEntity } from '../../../database/entities/user.entity';
import { ITokenPair } from '../../auth/interfaces/token.interface';
import { AuthCacheService } from '../../auth/services/auth-cache.service';
import { RefreshTokenEntity } from '../../../database/entities/refresh-token.entity';
import { EEmailType } from '../../email/enums/email-type.enum';
import { Configs, SecurityConfig } from '../../../configs/configs.type';
import { ConfigService } from '@nestjs/config';
import { PrivatePostResDto } from '../dto/res/private-post.res.dto';
import { PostMapper } from './post.mapper';
import { PriceService } from './price.service';
import { ExchangeRateService } from '../../exchange-rate/exchange-rate.service';
import { PriceEntity } from '../../../database/entities/price.entity';
import { PostRepository } from '../../repository/services/post.repository';
import { ViewRepository } from '../../repository/services/view.repository';
import { PaginationResDto } from '../../pagination/dto/res/pagination.res.dto';
import { PublicPostResDto } from '../dto/res/public-post.res.dto';
import { PaginationService } from '../../pagination/pagination.service';
import { QueryPostReqDto } from '../dto/req/query-post.req.dto';
import { ViewEntity } from '../../../database/entities/view.entity';
import { ImageEntity } from '../../../database/entities/image.entity';
import { UpdatePostReqDto } from '../dto/req/update-post.req.dto';
import { ECurrency } from '../../../database/entities/enums/currency.enum';
import { PriceResDto } from '../dto/res/price.res.dto';
import { BaseCarReqDto } from '../../car/dto/req/base-car.req.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UpdatePostAfterProfanityReqDto } from '../dto/req/update-post-after-profanity.req.dto';
import { TimeHelper } from '../../../common/helpers/time.helper';

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
                private readonly postRepository: PostRepository,
                private readonly viewRepository: ViewRepository,
                private readonly paginationService: PaginationService,
                @InjectEntityManager()
                private readonly entityManager: EntityManager) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
  }
  public async saveCar(dto: CreatePostReqDto, userData: IUserData):Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager)=>{
      const postRepository = entityManager.getRepository(PostEntity);
      const carRepository = entityManager.getRepository(CarEntity);
      const userRepository = entityManager.getRepository(UserEntity);
      const refreshTokenRepository = entityManager.getRepository(RefreshTokenEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);

      const postsCount = await postRepository.count({ where: {user_id: userData.userId}})

      if (userData.accountType === EAccountType.BASIC && postsCount >= 1) {
        throw new ForbiddenException(
          errorMessages.ONE_POST_FOR_BASIC_ACCOUNT,
        );
      }

      const calculatedPrices = await this.calculatePrices(dto.enteredPrice,dto.enteredCurrency);
      const user = await userRepository.findOneBy({id: userData.userId});

     const isProfanityPresent = await this.checkProfanityAndSendEmailForUser(dto, user);

      const savedCar = await carRepository.save(carRepository.create({...dto}))

      await this.priceService.savePrices(calculatedPrices, savedCar.id,priceRepository);

      const post = await postRepository.save(postRepository.create({
        user_id: userData.userId,
         car_id: savedCar.id,
        profanityEdits: 0,
        status: isProfanityPresent ? EPostStatus.NOT_ACTIVE : EPostStatus.ACTIVE,
      }))

      let tokens: ITokenPair;

      if (postsCount === 0 && userData.role === EUserRole.BUYER) {
        user.role = EUserRole.SELLER;
        await userRepository.save({...user});

        await refreshTokenRepository.delete({user_id: userData.userId})
        await this.authCacheService.deleteAllAccessTokens(userData.userId)

       tokens = await this.tokenUtilityService.generateAndSaveTokenPair(userData.userId,userData.deviceId,user.role,userData.accountType, refreshTokenRepository);
      }
      const fullPost = await postRepository.findOne({
        where: { id: post.id },
        relations: ['car', 'car.price', 'user'],
      });

      return  PostMapper.toPrivateResponse(fullPost, tokens)
    })
  }

  public async saveView(postId:  string): Promise<void> {
    const isPostExists = await this.postRepository.exists({where: {id: postId}});

    if (!isPostExists) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND);
    }
    await this.viewRepository.save(this.viewRepository.create({post_id:postId}));
  }

  public async getAll( query: QueryPostReqDto): Promise<PaginationResDto<PublicPostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(this.postRepository,query,['car', 'user']);
    return PostMapper.toPublicResponseList(posts);
  }

  public async getMyPosts( userData: IUserData,  query: QueryPostReqDto): Promise<PaginationResDto<PrivatePostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(this.postRepository,query,['car', 'user'], userData.userId);
    return PostMapper.toPrivateResponseList(posts);
  }

  public async getPublicPostById(postId:  string): Promise<PublicPostResDto> {
    const post = await this.postRepository.findOne({where: {id: postId, isDeleted: false, status: EPostStatus.ACTIVE}, relations:['car','car.price','user']});
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND)
    }
    return PostMapper.toPublicResponse(post);
  }
  public async getPrivatePostById( postId:  string,  userData: IUserData): Promise<PrivatePostResDto> {
    const post = await this.postRepository.findOne({where: {id: postId, user_id: userData.userId}, relations:['car','car.price','user']});
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND)
    }
    return PostMapper.toPrivateResponse(post);
  }

  public async archivePostById( postId:  string, userData: IUserData): Promise<void> {
    const post = await this.postRepository.findOne({where:{id: postId, user_id: userData.userId}});
    if (!post) {
      throw new NotFoundException(errorMessages.POST_NOT_FOUND)
    }
    if (!post.isDeleted) {
      await this.postRepository.save({...post, isDeleted: true, status: EPostStatus.NOT_ACTIVE})
    }
  }
  public async deleteForeverPostById( postId:  string, userData: IUserData): Promise<void> {
    return await this.entityManager.transaction(async (entityManager)=>{
      const postRepository = entityManager.getRepository(PostEntity);
      const post = await postRepository.findOne({where:{id: postId, user_id: userData.userId},relations:['car','car.price','car.images','views']});
      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND)
      }

     if (post.views){
       await entityManager.remove(ViewEntity,post.views);
     }

      if (post.car) {
        if (post.car.price) {
          await entityManager.remove(PriceEntity, post.car.price);
        }else if (post.car.images){
          await entityManager.remove(ImageEntity, post.car.images);
        }
        await entityManager.remove(PostEntity, post);
        await entityManager.remove(CarEntity, post.car);
      }
    })
  }
  public async getMyArchivePosts(userData: IUserData, query: QueryPostReqDto): Promise<PaginationResDto<PrivatePostResDto>> {
    const posts = await this.paginationService.paginate<PostEntity>(
      this.postRepository,
      query,
      ['car', 'user'],
      userData.userId,
      EPostStatus.NOT_ACTIVE,
    );
    return PostMapper.toPrivateResponseList(posts);
  }
  public async restorePost( postId:  string, userData: IUserData): Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager)=>{
      const postRepository = entityManager.getRepository(PostEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);

      const post = await postRepository.findOne({where:{
          id: postId,
          user_id: userData.userId,
          isDeleted: true,
          status: EPostStatus.NOT_ACTIVE,
        },relations:['car','car.price']})

      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND)
      }

      const calculatedPrices = await this.calculatePrices(post.car.enteredPrice, post.car.enteredCurrency);

      await entityManager.remove(PriceEntity,post.car.price);
      await this.priceService.savePrices(calculatedPrices, post.car.id,priceRepository);

     await postRepository.save({...post, isDeleted: false, status: EPostStatus.ACTIVE})

      const restoredPost = await postRepository.findOne({where: {id: postId}, relations:['car','car.price','user']})

      return PostMapper.toPrivateResponse(restoredPost);
    })

  }
  public async updatePost(postId:  string, userData: IUserData, dto: UpdatePostReqDto
  ):Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager)=>{
      const postRepository = entityManager.getRepository(PostEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);
      const carRepository = entityManager.getRepository(CarEntity);

      const post = await postRepository.findOne({where:{
          id: postId,
          user_id: userData.userId,
          isDeleted: false,
          status: EPostStatus.ACTIVE,
        },relations:['car','car.price','user']})

      if (!post) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND)
      }
      if (dto.enteredPrice) {
        if (!dto.enteredCurrency) {
          throw new BadRequestException(
            errorMessages.PRICE_AND_CURRENCY_REQUIRED,
          );
        }
      }
      if (dto.enteredCurrency) {
        if (!dto.enteredPrice) {
          throw new BadRequestException(
            errorMessages.PRICE_AND_CURRENCY_REQUIRED,
          );
        }
      }

      let calculatedPrices: PriceResDto[];
      if (dto.enteredCurrency && dto.enteredPrice) {
         calculatedPrices = await this.calculatePrices(dto.enteredPrice, dto.enteredCurrency);
        await entityManager.remove(PriceEntity,post.car.price);
        await this.priceService.savePrices(calculatedPrices, post.car.id,priceRepository);
      }

      const isProfanityPresent = await this.checkProfanityAndSendEmailForUser(dto, post.user);

      await carRepository.save({...post.car,...dto});
      await postRepository.save({...post,status: isProfanityPresent ? EPostStatus.NOT_ACTIVE : EPostStatus.ACTIVE});

      const fullPost = await postRepository.findOne({
        where: { id: post.id },
        relations: ['car', 'car.price', 'user'],
      });
      return PostMapper.toPrivateResponse(fullPost);
    })
  }

  public async updatePostAfterProfanity(postId:  string, userData: IUserData, dto: UpdatePostAfterProfanityReqDto
  ): Promise<PrivatePostResDto> {
    return await this.entityManager.transaction(async (entityManager)=>{
      const postRepository = entityManager.getRepository(PostEntity);
      const priceRepository = entityManager.getRepository(PriceEntity);
      const carRepository = entityManager.getRepository(CarEntity);

      const oldPost = await postRepository.findOne({where:{
          id: postId,
          user_id: userData.userId,
          isDeleted: false,
          status: EPostStatus.NOT_ACTIVE,
        },relations:['car','user']})

      if (!oldPost) {
        throw new NotFoundException(errorMessages.POST_NOT_FOUND)
      }

      if (oldPost.profanityEdits >= this.securityConfig.max_profanity_edits) {
        throw new ForbiddenException(errorMessages.ACHIEVED_MAX_NUMBER_OF_PROFANITY_EDITS);
      }
      const isProfanityPresent =  this.profanityService.checkForProfanity(dto);
      await carRepository.save({...oldPost.car, ...dto});


      if (isProfanityPresent) {
        const sumOfProfanityEdits = oldPost.profanityEdits + 1;
       await postRepository.save({...oldPost, profanityEdits: sumOfProfanityEdits});

        await this.emailService.sendByEmailType(
          EEmailType.POST_PROFANITY_DETECTED_FOR_USER,
          {
            firstName: oldPost.user.firstName,
            numberOfAttempts: this.securityConfig.max_profanity_edits - sumOfProfanityEdits,
          },
          oldPost.user.email,
        );
        if (sumOfProfanityEdits >= this.securityConfig.max_profanity_edits) {
          await this.emailService.sendByEmailType(
            EEmailType.POST_PROFANITY_DETECTED_FOR_MANAGER,
            {
              postId: oldPost.id,
              numberOfAttempts: this.securityConfig.max_profanity_edits,
              firstName: oldPost.user.firstName,
              lastName: oldPost.user.lastName,
              email: oldPost.user.email,
              submissionDate: TimeHelper.getCurrentDate(),
            },
            this.securityConfig.manager_email,
          );
        }
      } else {
       await postRepository.save( {...oldPost,
          profanityEdits: 0,
          status: EPostStatus.ACTIVE,
        });
      }
      const fullPost = await postRepository.findOne({
        where: { id: oldPost.id },
        relations: ['car', 'car.price', 'user'],
      });
      return PostMapper.toPrivateResponse(fullPost);

    })
  }

  private async calculatePrices(enteredPrice: number, enteredCurrency: ECurrency):Promise<PriceResDto[]> {
    const rates = await this.exchangeRateService.getAll();

    return  await this.priceService.calculatePrices(enteredPrice, enteredCurrency, rates);
  }
  private async checkProfanityAndSendEmailForUser(dto: Partial<BaseCarReqDto>, user: UserEntity): Promise<boolean> {
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
      return true
    }
  }
}
