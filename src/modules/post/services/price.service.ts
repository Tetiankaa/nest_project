import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { ECurrency } from '../../../database/entities/enums/currency.enum';
import { PriceEntity } from '../../../database/entities/price.entity';
import { PriceResDto } from '../../car/dto/res/price.res.dto';
import { ExchangeRateResDto } from '../../exchange-rate/dto/res/exchange-rate.res.dto';

@Injectable()
export class PriceService {
  public async calculatePrices(
    enteredPrice: number,
    enteredCurrency: ECurrency,
    exchangeRates: ExchangeRateResDto,
  ): Promise<PriceResDto[]> {
    try {
      const { usd: usdRate, eur: eurRate } = exchangeRates;

      let uah: PriceResDto;
      let eur: PriceResDto;
      let usd: PriceResDto;

      switch (enteredCurrency) {
        case ECurrency.UAH:
          uah = { value: +enteredPrice.toFixed(2), currency: ECurrency.UAH };
          eur = {
            value: +(enteredPrice / eurRate.sale).toFixed(2),
            currency: ECurrency.EUR,
          };
          usd = {
            value: +(enteredPrice / usdRate.sale).toFixed(2),
            currency: ECurrency.USD,
          };
          break;
        case ECurrency.EUR:
          eur = { value: +enteredPrice.toFixed(2), currency: ECurrency.EUR };
          uah = {
            value: +(enteredPrice * eurRate.buy).toFixed(2),
            currency: ECurrency.UAH,
          };
          usd = {
            value: +((enteredPrice * eurRate.buy) / usdRate.sale).toFixed(2),
            currency: ECurrency.USD,
          };
          break;
        case ECurrency.USD:
          usd = { value: +enteredPrice.toFixed(2), currency: ECurrency.USD };
          uah = {
            value: +(enteredPrice * usdRate.buy).toFixed(2),
            currency: ECurrency.UAH,
          };
          eur = {
            value: +((enteredPrice * usdRate.buy) / eurRate.sale).toFixed(2),
            currency: ECurrency.EUR,
          };
          break;
        default:
          throw new BadRequestException(errorMessages.INVALID_CURRENCY_TYPE);
      }
      return [eur, usd, uah];
    } catch (e) {
      throw new InternalServerErrorException(
        errorMessages.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async savePrices(
    prices: PriceResDto[],
    carId: string,
    repository: Repository<PriceEntity>,
  ): Promise<PriceEntity> {
    const priceEntity = repository.create({
      car_id: carId,
    });

    prices.forEach((price) => {
      switch (price.currency) {
        case ECurrency.EUR:
          priceEntity.eur = price.value;
          break;
        case ECurrency.USD:
          priceEntity.usd = price.value;
          break;
        case ECurrency.UAH:
          priceEntity.uah = price.value;
          break;
        default:
          throw new BadRequestException(errorMessages.INVALID_CURRENCY_TYPE);
      }
    });

    return await repository.save(priceEntity);
  }
}
