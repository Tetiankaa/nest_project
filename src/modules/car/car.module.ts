import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './services/car.service';
import { RepositoryModule } from '../repository/repository.module';
import { EmailModule } from '../email/email.module';
import { PaginationModule } from '../pagination/pagination.module';

@Module({
  imports:[RepositoryModule, EmailModule, PaginationModule],
  controllers: [CarController],
  providers: [CarService]
})

export class CarModule {}
