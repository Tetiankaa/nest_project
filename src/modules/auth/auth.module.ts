import { forwardRef, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from '../email/email.module';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthService } from './services/auth.service';
import { AuthCacheService } from './services/auth-cache.service';
import { TokenService } from './services/token.service';
import { TokenUtilityService } from './services/token-utility.service';

@Module({
  imports: [JwtModule, RedisModule, forwardRef(() => UserModule), EmailModule],
  providers: [
    AuthService,
    TokenService,
    AuthCacheService,
    TokenUtilityService,
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    JwtRefreshGuard,
  ],
  controllers: [AuthController],
  exports: [AuthCacheService, AuthService, TokenUtilityService],
})
export class AuthModule {}
