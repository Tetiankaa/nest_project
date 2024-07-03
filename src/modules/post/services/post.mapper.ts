import { PostEntity } from '../../../database/entities/post.entity';
import { CarEntity } from '../../../database/entities/car.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { ITokenPair } from '../../auth/interfaces/token.interface';
import { PrivatePostResDto } from '../dto/res/private-post.res.dto';
import { CarMapper } from '../../car/services/mappers/car.mapper';
import { UserMapper } from '../../user/services/user.mapper';
import { AuthMapper } from '../../auth/services/auth.mapper';

export class PostMapper {
  public static toPrivateResponse(post: PostEntity, car: CarEntity, user: UserEntity, tokens: ITokenPair): PrivatePostResDto {
    return {
      id: post.id,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      status: post.status,
      profanityEdits: post.profanityEdits,
      isDeleted: post.isDeleted,
      car: CarMapper.toDto(car),
      user: UserMapper.toPrivateResponseDTO(user),
      tokens: tokens ? AuthMapper.toResponseTokenDTO(tokens) : undefined
    };
  }
}
