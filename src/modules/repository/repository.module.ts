import { Global, Module } from '@nestjs/common';

import { UserRepository } from './services/user.repository';
import { RefreshTokenRepository } from './services/refresh-token.repository';

const repositories = [
  UserRepository,
  RefreshTokenRepository,
];
@Global()
@Module({
  exports: [...repositories],
  providers: [...repositories],
})
export class RepositoryModule {}
