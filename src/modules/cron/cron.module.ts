import { CronService } from './cron.service';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ExchangeRateModule,
    LoggerModule
  ],
  providers: [CronService],
})
export class CronModule {}
