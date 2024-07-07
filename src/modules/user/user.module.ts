import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PostModule } from '../post/post.module';
import { RepositoryModule } from '../repository/repository.module';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    RepositoryModule,
    forwardRef(() => AuthModule),
    forwardRef(() => PostModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
