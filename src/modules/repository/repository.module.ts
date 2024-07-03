import { Global, Module } from '@nestjs/common';

import { UserRepository } from './services/user.repository';
import { RefreshTokenRepository } from './services/refresh-token.repository';
import { ActionTokenRepository } from './services/action-token.repository';
import { CarRepository } from './services/car.repository';
import { ImageRepository } from './services/image.repository';
import { PriceRepository } from './services/price.repository';
import { PostRepository } from './services/post.repository';
import { CurrencyRepository } from './services/currency.repository';
import { BrandRepository } from './services/brand.repository';
import { MissingBrandModelReportRepository } from './services/missing-brand-model-report.repository';
import { ModelRepository } from './services/model.repository';
import { ExchangeRateRepository } from './services/exchange-rate.repository';

const repositories = [
  UserRepository,
  RefreshTokenRepository,
  ActionTokenRepository,
  CarRepository,
  ImageRepository,
  PriceRepository,
  PostRepository,
  CurrencyRepository,
  MissingBrandModelReportRepository,
  ModelRepository,
  ExchangeRateRepository
];
@Global()
@Module({
  exports: [...repositories],
  providers: [...repositories],
})
export class RepositoryModule {}
