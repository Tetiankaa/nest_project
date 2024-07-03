import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { IExchangeRate } from './interfaces/exchange-rate';
import { Configs, ExchangeRatesConfig } from '../../configs/configs.type';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { errorMessages } from '../../common/constants/error-messages.constant';
import { ExchangeRateRepository } from '../repository/services/exchange-rate.repository';
import { ECurrency } from '../../database/entities/enums/currency.enum';
import { ExchangeRateEntity } from '../../database/entities/exchange-rate.entity';

@Injectable()
export class ExchangeRateService {
  private readonly exchangeRatesConfig: ExchangeRatesConfig;
  constructor(
    private readonly configService: ConfigService<Configs>,
    private readonly exchangeRateRepository: ExchangeRateRepository
  ) {
    this.exchangeRatesConfig = this.configService.get<ExchangeRatesConfig>('exchangeRates');
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

  public async getAll(): Promise<{ rates: {usd: ExchangeRateEntity; eur: ExchangeRateEntity}}> {
    const usd = await this.exchangeRateRepository.findOneBy({
      ccy: ECurrency.USD,
    });
    const eur = await this.exchangeRateRepository.findOneBy({
      ccy: ECurrency.EUR,
    });

    return {
      rates: {
        usd,
        eur
      }
    }
  }

  public async deleteAll(): Promise<void> {
    const allRecords = await this.exchangeRateRepository.find();
    await Promise.all(allRecords.map( record => {
       this.exchangeRateRepository.remove(record)
    }))
  }
  public async save(rates: IExchangeRate[]):Promise<void> {
    await Promise.all(
      rates.map((rate) => {
        this.exchangeRateRepository.save(this.exchangeRateRepository.create({ccy: rate.ccy, base_ccy: rate.base_ccy, sale: +rate.sale, buy: +rate.buy}));
      }),
    );
  }
}
