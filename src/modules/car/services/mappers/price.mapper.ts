import { ECurrency } from '../../../../database/entities/enums/currency.enum';
import { ExchangeRateEntity } from '../../../../database/entities/exchange-rate.entity';
import { PriceEntity } from '../../../../database/entities/price.entity';
import { BaseExchangeRateResDto } from '../../../exchange-rate/dto/res/base-exchange-rate.res.dto';
import { PriceResDto } from '../../dto/res/price.res.dto';

export class PriceMapper {
  public static toDto(
    priceEntity: PriceEntity,
    rates?: { usd: ExchangeRateEntity; eur: ExchangeRateEntity },
  ): PriceResDto[] {
    return [
      {
        currency: ECurrency.EUR,
        value: priceEntity.eur,
        exchangeRateEUR: rates ? this.exchangeRateToDto(rates.eur) : undefined,
      },
      {
        currency: ECurrency.USD,
        value: priceEntity.usd,
        exchangeRateUSD: rates ? this.exchangeRateToDto(rates.usd) : undefined,
      },
      {
        currency: ECurrency.UAH,
        value: priceEntity.uah,
      },
    ];
  }

  public static exchangeRateToDto(
    rate: ExchangeRateEntity,
  ): BaseExchangeRateResDto {
    return {
      sale: rate.sale,
      buy: rate.buy,
    };
  }
}
