import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { LoggerService } from '../../logger/services/logger.service';
import { REDIS_CLIENT } from '../constants/redis.constants';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    private readonly loggerService: LoggerService,
  ) {}

  public async sMembers(key: string): Promise<string[]> {
    try {
      return await this.redisClient.smembers(key);
    } catch (error) {
      this.loggerService.error(error);
    }
  }

  public async expire(key: string, time: number): Promise<number> {
    try {
      return await this.redisClient.expire(key, time);
    } catch (error) {
      this.loggerService.error(error);
    }
  }

  public async execMulti(commands: [string, ...any[]][]): Promise<any> {
    try {
      const multi = this.redisClient.multi();
      commands.forEach((command) => multi[command[0]](...command.slice(1)));
      return await multi.exec();
    } catch (error) {
      this.loggerService.error(error);
    }
  }
  public async scan(
    cursor: string,
    match: string,
  ): Promise<[string, string[]]> {
    try {
      return await this.redisClient.scan(cursor, 'MATCH', match);
    } catch (error) {
      this.loggerService.error(error);
    }
  }
  public createPipeline() {
    return this.redisClient.pipeline();
  }
}
