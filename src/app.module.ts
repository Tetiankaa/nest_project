import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './configs/configs';
import { AuthModule } from './modules/auth/auth.module';
import { CarModule } from './modules/car/car.module';
import { CronModule } from './modules/cron/cron.module';
import { DealershipModule } from './modules/dealership/dealership.module';
import { EmailModule } from './modules/email/email.module';
import { ExchangeRateModule } from './modules/exchange-rate/exchange-rate.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { LoggerModule } from './modules/logger/logger.module';
import { PaginationModule } from './modules/pagination/pagination.module';
import { PostModule } from './modules/post/post.module';
import { PostgresModule } from './modules/postgres/postgres.module';
import { RedisModule } from './modules/redis/redis.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PostgresModule,
    RepositoryModule,
    UserModule,
    LoggerModule,
    AuthModule,
    RedisModule,
    EmailModule,
    CarModule,
    PaginationModule,
    PostModule,
    ExchangeRateModule,
    CronModule,
    FileStorageModule,
    DealershipModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
