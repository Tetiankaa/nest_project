import { Injectable } from '@nestjs/common';
import { CurrencyResDto } from '../dto/res/currency.res.dto';
import { CurrencyRepository } from '../../repository/services/currency.repository';
import { CurrencyMapper } from './currency.mapper';

@Injectable()
export class CarService {
  constructor(private readonly currencyRepository: CurrencyRepository) {
  }
  public async getCurrencies(): Promise<CurrencyResDto[]> {
   const currencies = await this.currencyRepository.find();
   return CurrencyMapper.toListDto(currencies);
  }
}
