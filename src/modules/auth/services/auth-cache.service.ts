import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Configs, JWTConfig } from '../../../configs/configs.type';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AuthCacheService {
  private jwtConfig: JWTConfig;
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<Configs>,
  ) {
    this.jwtConfig = this.configService.get<JWTConfig>('jwt');
  }

  public async saveToken(
    token: string,
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const key = this.getKey(userId, deviceId);
    const commands: [string, ...any[]][] = [
      ['del', key],
      ['sadd', key, token],
      ['expire',key, this.jwtConfig.access_expires_in]
    ]

    await this.redisService.execMulti(commands);
  }
  public async deleteAccessToken(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const key = this.getKey(userId, deviceId);
    const commands: [string, ...any[]][] = [
      ['del', key],
    ]

    await this.redisService.execMulti(commands);
  }

  public async isAccessTokenExist(
    token: string,
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    const key = this.getKey(userId, deviceId);
    const setOfValues = await this.redisService.sMembers(key);
    return setOfValues.includes(token);
  }
  public async deleteAllAccessTokens(userId: string): Promise<void> {
    const pattern = `ACCESS_TOKEN:${userId}:*`;
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redisService.scan(cursor, pattern);
      if (keys.length > 0) {
        const commands: [string, ...any[]][] = keys.map((key) => ['del', key]);
        await this.redisService.execMulti(commands);
      }
      cursor = nextCursor;
    } while (cursor !== '0');
  }
  private getKey(userId: string, deviceId: string): string {
    return `ACCESS_TOKEN:${userId}:${deviceId}`;
  }
}
