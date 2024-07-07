import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { EntityManager } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { Configs, ExchangeRatesConfig } from '../../../configs/configs.type';
import { ECurrency } from '../../../database/entities/enums/currency.enum';
import { ExchangeRateEntity } from '../../../database/entities/exchange-rate.entity';
import { IExchangeRate } from '../interfaces/exchange-rate';

@Injectable()
export class ExchangeRateService {
  private readonly exchangeRatesConfig: ExchangeRatesConfig;
  constructor(private readonly configService: ConfigService<Configs>) {
    this.exchangeRatesConfig =
      this.configService.get<ExchangeRatesConfig>('exchangeRates');
  }

  public async getFromApi(): Promise<IExchangeRate[]> {
    try {
      const { data } = await axios.get(this.exchangeRatesConfig.api_privatbank);
      return data;
    } catch (e) {
      throw new ServiceUnavailableException(
        errorMessages.CANNOT_FETCH_EXCHANGE_RATES,
      );
    }
  }

  public async getAll(
    entityManager: EntityManager,
  ): Promise<{ usd: ExchangeRateEntity; eur: ExchangeRateEntity }> {
    const exchangeRateRepository =
      entityManager.getRepository(ExchangeRateEntity);
    const usd = await exchangeRateRepository.findOneBy({
      ccy: ECurrency.USD,
    });
    const eur = await exchangeRateRepository.findOneBy({
      ccy: ECurrency.EUR,
    });
    return {
      usd,
      eur,
    };
  }

  public async deleteAll(entityManager: EntityManager): Promise<void> {
    const exchangeRateRepository =
      entityManager.getRepository(ExchangeRateEntity);
    const allRecords = await exchangeRateRepository.find();
    await entityManager.remove(ExchangeRateEntity, allRecords);
  }
  public async save(
    rates: IExchangeRate[],
    entityManager: EntityManager,
  ): Promise<void> {
    await entityManager.getRepository(ExchangeRateEntity).save(rates);
  }
}
