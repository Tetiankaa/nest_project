import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './services/post.service';
import { RepositoryModule } from '../repository/repository.module';
import { EmailModule } from '../email/email.module';
import { AuthModule } from '../auth/auth.module';
import { ProfanityService } from './services/profanity.service';
import { PriceService } from './services/price.service';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';
import { PaginationModule } from '../pagination/pagination.module';

@Module({
  imports:[RepositoryModule, EmailModule, AuthModule, ExchangeRateModule, PaginationModule],
  providers:[PostService, ProfanityService, PriceService],
  controllers: [PostController]
})

export class PostModule {}
