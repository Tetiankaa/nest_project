import { Module } from '@nestjs/common';
import { CarController } from './car.controller';
import { CarService } from './services/car.service';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports:[RepositoryModule],
  controllers: [CarController],
  providers: [CarService]
})

export class CarModule {}
