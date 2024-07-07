import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';
import { PostModule } from '../post/post.module';
import { RepositoryModule } from '../repository/repository.module';
import { CronService } from './services/cron.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ExchangeRateModule,
    RepositoryModule,
    PostModule,
  ],
  providers: [CronService],
})
export class CronModule {}
