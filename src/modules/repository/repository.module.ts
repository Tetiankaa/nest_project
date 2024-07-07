import { Global, Module } from '@nestjs/common';

import { ActionTokenRepository } from './services/action-token.repository';
import { BrandRepository } from './services/brand.repository';
import { CarRepository } from './services/car.repository';
import { CurrencyRepository } from './services/currency.repository';
import { DealershipRepository } from './services/dealership.repository';
import { ExchangeRateRepository } from './services/exchange-rate.repository';
import { ImageRepository } from './services/image.repository';
import { MissingBrandModelReportRepository } from './services/missing-brand-model-report.repository';
import { ModelRepository } from './services/model.repository';
import { PostRepository } from './services/post.repository';
import { PriceRepository } from './services/price.repository';
import { RefreshTokenRepository } from './services/refresh-token.repository';
import { UserRepository } from './services/user.repository';
import { ViewRepository } from './services/view.repository';

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
  ExchangeRateRepository,
  ViewRepository,
  DealershipRepository,
  BrandRepository,
];
@Global()
@Module({
  exports: [...repositories],
  providers: [...repositories],
})
export class RepositoryModule {}
