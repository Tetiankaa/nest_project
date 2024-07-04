import { PostEntity } from '../../../database/entities/post.entity';
import { ITokenPair } from '../../auth/interfaces/token.interface';
import { PrivatePostResDto } from '../dto/res/private-post.res.dto';
import { CarMapper } from '../../car/services/mappers/car.mapper';
import { UserMapper } from '../../user/services/user.mapper';
import { AuthMapper } from '../../auth/services/auth.mapper';
import { PublicPostResDto } from '../dto/res/public-post.res.dto';
import { PaginationResDto } from '../../pagination/dto/res/pagination.res.dto';

export class PostMapper {
  public static toPrivateResponse(post: PostEntity, tokens?: ITokenPair): PrivatePostResDto {
    return {
      id: post.id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status,
      profanityEdits: post.profanityEdits,
      isDeleted: post.isDeleted,
      car: CarMapper.toDto(post.car),
      user: UserMapper.toPrivateResponseDTO(post.user),
      tokens: tokens ? AuthMapper.toResponseTokenDTO(tokens) : undefined
    };
  }
  public static toPrivateResponseList(result: PaginationResDto<PostEntity>): PaginationResDto<PrivatePostResDto> {
    return {
      data: result.data.map(post=> this.toPrivateResponse(post)),
      page: result.page,
      totalCount: result.totalCount,
      limit: result.limit
    }
  }
  public static toPublicResponse(post: PostEntity): PublicPostResDto {
      return {
        id: post.id,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: UserMapper.toPublicResponseDTO(post.user),
        car: CarMapper.toDto(post.car)
      }
  }

  public static toPublicResponseList(result: PaginationResDto<PostEntity>): PaginationResDto<PublicPostResDto> {
    return {
      data: result.data.map(post=> this.toPublicResponse(post)),
      page: result.page,
      totalCount: result.totalCount,
      limit: result.limit
    }
  }
}
