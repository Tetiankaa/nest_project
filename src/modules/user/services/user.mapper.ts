import { UserEntity } from '../../../database/entities/user.entity';
import { DealershipMapper } from '../../dealership/services/dealership.mapper';
import { PrivateUserResDto } from '../dto/res/private-user-res.dto';
import { PublicUserResDto } from '../dto/res/public-user-res.dto';

export class UserMapper {
  public static toPrivateResponseDTO(user: UserEntity): PrivateUserResDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      accountType: user.account_type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      dealership: user.dealership
        ? DealershipMapper.toDto(user.dealership)
        : undefined,
    };
  }

  public static toPublicResponseDTO(user: UserEntity): PublicUserResDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      createdAt: user.createdAt,
      dealership: user.dealership
        ? DealershipMapper.toDto(user.dealership)
        : undefined,
    };
  }
}
