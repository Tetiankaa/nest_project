import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configs/configs';
import { PostgresModule } from './modules/postgres/postgres.module';
import { LoggerModule } from './modules/logger/logger.module';
import { RepositoryModule } from './modules/repository/repository.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load:[configuration],
      isGlobal: true
    }),
    PostgresModule,
    RepositoryModule,
    UserModule,
    LoggerModule,
    AuthModule,
    RedisModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
