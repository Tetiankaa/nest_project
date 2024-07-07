import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { PaginationModule } from '../pagination/pagination.module';
import { RepositoryModule } from '../repository/repository.module';
import { UserModule } from '../user/user.module';
import { PostController } from './post.controller';
import { PostService } from './services/post.service';
import { PriceService } from './services/price.service';
import { ProfanityService } from './services/profanity.service';

@Module({
  imports: [
    RepositoryModule,
    EmailModule,
    forwardRef(() => AuthModule),
    ExchangeRateModule,
    PaginationModule,
    FileStorageModule,
    forwardRef(() => UserModule),
  ],
  providers: [PostService, ProfanityService, PriceService],
  controllers: [PostController],
  exports: [PostService, PriceService],
})
export class PostModule {}
