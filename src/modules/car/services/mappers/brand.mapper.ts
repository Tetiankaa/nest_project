import { BrandEntity } from '../../../../database/entities/brand.entity';
import { BrandResDto } from '../../dto/res/brand.res.dto';
import { ModelMapper } from './model.mapper';

export class BrandMapper {
  public static toDto(brand: BrandEntity): BrandResDto {
    return {
      id: brand.id,
      name: brand.name,
      models: brand.models ? ModelMapper.toListDto(brand.models) : [],
    };
  }

  public static toListDto(brands: BrandEntity[]): BrandResDto[] {
    return brands.map((brand) => this.toDto(brand));
  }
}
