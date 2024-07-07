import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostgresConnectService } from './services/postgres-connect.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: PostgresConnectService,
    }),
  ],
})
export class PostgresModule {}
