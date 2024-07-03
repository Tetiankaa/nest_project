import { ForbiddenException, Injectable } from '@nestjs/common';
import { BaseCreatePostReqDto } from '../dto/req/base-create-post.req.dto';
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
import { UserMapper } from '../../user/services/user.mapper';
import { CarMapper } from '../../car/services/mappers/car.mapper';
import { AuthMapper } from '../../auth/services/auth.mapper';
import { PostMapper } from './post.mapper';
import { PriceService } from './price.service';
import { ExchangeRateEntity } from '../../../database/entities/exchange-rate.entity';
import { ExchangeRateService } from '../../exchange-rate/exchange-rate.service';
import { ECurrency } from '../../../database/entities/enums/currency.enum';
import { PriceEntity } from '../../../database/entities/price.entity';

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
                @InjectEntityManager()
                private readonly entityManager: EntityManager) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
  }
  public async saveCar(dto: BaseCreatePostReqDto, userData: IUserData):Promise<PrivatePostResDto> {
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

      const rates = await this.exchangeRateService.getAll()

      const calculatedPrices = await this.priceService.calculatePrices(dto.enteredPrice, dto.enteredCurrency, rates);
      console.log(calculatedPrices);

      const isProfanityPresent = this.profanityService.checkForProfanity(dto);

      const savedCar = await carRepository.save(carRepository.create({...dto}))

      await this.priceService.savePrices(calculatedPrices, savedCar.id,priceRepository);

      const post = await postRepository.save(postRepository.create({
        user_id: userData.userId,
         car_id: savedCar.id,
        profanityEdits: 0,
        status: isProfanityPresent ? EPostStatus.NOT_ACTIVE : EPostStatus.ACTIVE,
      }))
      const user = await userRepository.findOneBy({id: userData.userId});

      let tokens: ITokenPair;

      if (postsCount === 0 && userData.role === EUserRole.BUYER) {
        user.role = EUserRole.SELLER;
        await userRepository.save({...user});

        await refreshTokenRepository.delete({user_id: userData.userId})
        await this.authCacheService.deleteAllAccessTokens(userData.userId)

       tokens = await this.tokenUtilityService.generateAndSaveTokenPair(userData.userId,userData.deviceId,user.role,userData.accountType, refreshTokenRepository);
      }
      if (isProfanityPresent) {
        await this.emailService.sendByEmailType(
          EEmailType.POST_PROFANITY_DETECTED_FOR_USER,
          {
            firstName: user.firstName,
            numberOfAttempts: this.securityConfig.max_profanity_edits,
          },
          user.email,
        );
      }
      const car = await carRepository.findOne({where: {id: savedCar.id}, relations:['price']});
      return PostMapper.toPrivateResponse(post,car,user, tokens)
    })
  }
}
