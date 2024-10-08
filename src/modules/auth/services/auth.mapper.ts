import { UserEntity } from '../../../database/entities/user.entity';
import { PrivateUserResDto } from '../../user/dto/res/private-user-res.dto';
import { UserMapper } from '../../user/services/user.mapper';
import { AuthResDto } from '../dto/res/auth.res.dto';
import { TokenPairResDto } from '../dto/res/token-pair.res.dto';
import { ITokenPair } from '../interfaces/token.interface';
import { IUserData } from '../interfaces/user-data.interface';

export class AuthMapper {
  public static toResponseDTO(
    user: UserEntity,
    tokenPair: ITokenPair,
  ): AuthResDto {
    return {
      tokens: this.toResponseTokenDTO(tokenPair),
      user: UserMapper.toPrivateResponseDTO(user),
    };
  }
  public static toUserDataDTO(user: UserEntity, deviceId?: string): IUserData {
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      accountType: user.account_type,
      deviceId,
      dealershipId: user.dealership_id ? user.dealership_id : undefined,
    };
  }
  public static toResponseTokenDTO(tokens: ITokenPair): TokenPairResDto {
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  public static toPrivateResponseDTO(user: UserEntity): PrivateUserResDto {
    return UserMapper.toPrivateResponseDTO(user);
  }
}
