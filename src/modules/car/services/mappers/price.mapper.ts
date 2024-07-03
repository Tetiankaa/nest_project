import { PriceEntity } from '../../../../database/entities/price.entity';
import { PriceResDto } from '../../../post/dto/res/price.res.dto';
import e from 'express';
import { ECurrency } from '../../../../database/entities/enums/currency.enum';

export class PriceMapper {
  public static toDto(priceEntity: PriceEntity): PriceResDto[] {
    const prices: PriceResDto[] = [];

    if (priceEntity.eur) {
      prices.push({ value: priceEntity.eur, currency: ECurrency.EUR });
    }
    if (priceEntity.usd) {
      prices.push({ value: priceEntity.usd, currency: ECurrency.USD });
    }
    if (priceEntity.uah) {
      prices.push({ value: priceEntity.uah, currency: ECurrency.UAH });
    }

    return prices;
  }
}
