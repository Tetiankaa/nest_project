import { Global, Module } from '@nestjs/common';

import { UserRepository } from './services/user.repository';
import { RefreshTokenRepository } from './services/refresh-token.repository';
import { ActionTokenRepository } from './services/action-token.repository';
import { CarRepository } from './services/car.repository';
import { ImageRepository } from './services/image.repository';
import { PriceRepository } from './services/price.repository';
import { PostRepository } from './services/post.repository';
import { CurrencyRepository } from './services/currency.repository';

const repositories = [
  UserRepository,
  RefreshTokenRepository,
  ActionTokenRepository,
  CarRepository,
  ImageRepository,
  PriceRepository,
  PostRepository,
  CurrencyRepository
];
@Global()
@Module({
  exports: [...repositories],
  providers: [...repositories],
})
export class RepositoryModule {}
