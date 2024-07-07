import { ExchangeRateEntity } from '../../../database/entities/exchange-rate.entity';
import { PostEntity } from '../../../database/entities/post.entity';
import { ITokenPair } from '../../auth/interfaces/token.interface';
import { AuthMapper } from '../../auth/services/auth.mapper';
import { CarMapper } from '../../car/services/mappers/car.mapper';
import { PaginationResDto } from '../../pagination/dto/res/pagination.res.dto';
import { UserMapper } from '../../user/services/user.mapper';
import { PrivatePostResDto } from '../dto/res/private-post.res.dto';
import { PublicPostResDto } from '../dto/res/public-post.res.dto';

export class PostMapper {
  public static toPrivateResponse(
    post: PostEntity,
    rates?: { usd: ExchangeRateEntity; eur: ExchangeRateEntity },
    tokens?: ITokenPair,
  ): PrivatePostResDto {
    return {
      id: post.id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status,
      profanityEdits: post.profanityEdits,
      isDeleted: post.isDeleted,
      car: CarMapper.toDto(post.car, rates),
      user: UserMapper.toPrivateResponseDTO(post.user),
      tokens: tokens ? AuthMapper.toResponseTokenDTO(tokens) : undefined,
    };
  }
  public static toPrivateResponseList(
    result: PaginationResDto<PostEntity>,
    rates?: { usd: ExchangeRateEntity; eur: ExchangeRateEntity },
  ): PaginationResDto<PrivatePostResDto> {
    return {
      data: result.data.map((post) => this.toPrivateResponse(post, rates)),
      page: result.page,
      totalCount: result.totalCount,
      limit: result.limit,
    };
  }
  public static toPublicResponse(
    post: PostEntity,
    rates?: { usd: ExchangeRateEntity; eur: ExchangeRateEntity },
  ): PublicPostResDto {
    return {
      id: post.id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: UserMapper.toPublicResponseDTO(post.user),
      car: CarMapper.toDto(post.car, rates),
    };
  }

  public static toPublicResponseList(
    result: PaginationResDto<PostEntity>,
    rates?: { usd: ExchangeRateEntity; eur: ExchangeRateEntity },
  ): PaginationResDto<PublicPostResDto> {
    return {
      data: result.data.map((post) => this.toPublicResponse(post, rates)),
      page: result.page,
      totalCount: result.totalCount,
      limit: result.limit,
    };
  }
}
