import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { Configs, RedisConfig } from '../../configs/configs.type';
import { REDIS_CLIENT } from './constants/redis.constants';
import { RedisService } from './services/redis.service';

const redisProvider: Provider = {
  useFactory: (configService: ConfigService<Configs>): Redis => {
    const redisConfig = configService.get<RedisConfig>('redis');
    return new Redis({
      port: redisConfig.port,
      host: redisConfig.host,
      password: redisConfig.password,
    });
  },
  inject: [ConfigService],
  provide: REDIS_CLIENT,
};
@Module({
  providers: [redisProvider, RedisService],
  exports: [redisProvider, RedisService],
})
export class RedisModule {}
