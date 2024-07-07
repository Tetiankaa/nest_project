import { DealershipEntity } from '../../../database/entities/dealership.entity';
import { DealershipResDto } from '../dto/res/dealership.res.dto';

export class DealershipMapper {
  public static toDto(entity: DealershipEntity): DealershipResDto {
    return {
      id: entity.id,
      name: entity.name,
      address: entity.address,
      phone: entity.phone,
      email: entity.email,
    };
  }
}
