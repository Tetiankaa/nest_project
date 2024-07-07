import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { PaginationModule } from '../pagination/pagination.module';
import { RepositoryModule } from '../repository/repository.module';
import { CarController } from './car.controller';
import { CarService } from './services/car.service';

@Module({
  imports: [RepositoryModule, EmailModule, PaginationModule],
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {}
