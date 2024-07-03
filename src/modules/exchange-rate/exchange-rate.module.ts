import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports:[RepositoryModule],
  providers:[ExchangeRateService],
  exports:[ExchangeRateService]
})
export class ExchangeRateModule {}
