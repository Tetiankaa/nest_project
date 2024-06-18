import { forwardRef, Module } from '@nestjs/common';

import { RepositoryModule } from '../repository/repository.module';
import { UserService } from './services/user.service';
import { LoggerService } from '../logger/logger.service';
import { LoggerModule } from '../logger/logger.module';
// import { UserController } from './user.controller';

@Module({
  imports: [RepositoryModule, LoggerModule],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
