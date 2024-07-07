import { Module } from '@nestjs/common';

import { DealershipController } from './dealership.controller';
import { DealershipService } from './services/dealership.service';

@Module({
  imports: [],
  providers: [DealershipService],
  controllers: [DealershipController],
})
export class DealershipModule {}
