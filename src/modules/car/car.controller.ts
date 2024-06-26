import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CarService } from './services/car.service';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { CurrencyResDto } from './dto/res/currency.res.dto';

@Controller('cars')
@ApiTags('cars')
export class CarController {
  constructor(private readonly carService: CarService) {
  }

  @Get('currencies')
  @SkipAuth()
  public async getCurrencies(): Promise<CurrencyResDto[]> {
    return await this.carService.getCurrencies();
  }

}
