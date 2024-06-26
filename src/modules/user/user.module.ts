import { forwardRef, Module } from '@nestjs/common';

import { RepositoryModule } from '../repository/repository.module';
import { UserService } from './services/user.service';
import { LoggerModule } from '../logger/logger.module';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RepositoryModule, LoggerModule, forwardRef(()=> AuthModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
