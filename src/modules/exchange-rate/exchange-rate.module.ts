import { Module } from '@nestjs/common';

import { RepositoryModule } from '../repository/repository.module';
import { ExchangeRateService } from './services/exchange-rate.service';

@Module({
  imports: [RepositoryModule],
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}
