import { CarEntity } from '../../../../database/entities/car.entity';
import { BaseCarResDto } from '../../dto/res/base-car.res.dto';
import { PriceMapper } from './price.mapper';

export class CarMapper {
  public static toDto(car: CarEntity): BaseCarResDto {
    return {
      id: car.id,
      brand: car.brand,
      model: car.model,
      year: car.year,
      mileage: car.mileage,
      region: car.region,
      city: car.city,
      color: car.color,
      enteredCurrency: car.enteredCurrency,
      enteredPrice: car.enteredPrice,
      description: car.description,
      prices: car.price ? PriceMapper.toDto(car.price) : undefined
    }
  }
}
