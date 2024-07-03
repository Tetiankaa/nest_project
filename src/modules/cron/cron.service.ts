import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CronService {
  constructor(
    private readonly exchangeRateService: ExchangeRateService,
    private readonly loggerService: LoggerService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  public async fetchExchangeRate() {
    const start = Date.now();
    try {
      this.loggerService.log('fetching exchange rates started ' + start);
      await this.exchangeRateService.deleteAll();
      const rates = await this.exchangeRateService.getFromApi();

      await this.exchangeRateService.save(rates);

    } catch (e) {
      this.loggerService.error(e);
    }finally {
      const end = Date.now();
      this.loggerService.log("fetching exchange rates ended: " + end);
      this.loggerService.log(`Taking time: ${end - start}ms`);
    }
  }
}
