import { CarEntity } from '../../../../database/entities/car.entity';
import { ExchangeRateEntity } from '../../../../database/entities/exchange-rate.entity';
import { BaseCarResDto } from '../../dto/res/base-car.res.dto';
import { ImageMapper } from './image.mapper';
import { PriceMapper } from './price.mapper';

export class CarMapper {
  public static toDto(
    car: CarEntity,
    rates?: { usd: ExchangeRateEntity; eur: ExchangeRateEntity },
  ): BaseCarResDto {
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
      prices: car.price ? PriceMapper.toDto(car.price, rates) : [],
      images: car.images.length ? ImageMapper.toDtoList(car.images) : [],
    };
  }
}
