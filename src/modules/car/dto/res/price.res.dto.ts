import { ApiProperty } from '@nestjs/swagger';

import { ECurrency } from '../../../../database/entities/enums/currency.enum';
import { BaseExchangeRateResDto } from '../../../exchange-rate/dto/res/base-exchange-rate.res.dto';

export class PriceResDto {
  @ApiProperty({
    example: 'USD',
    description: 'The currency code',
    enum: ECurrency,
  })
  currency?: ECurrency;

  @ApiProperty({
    example: 20200.0,
    description: 'The exchange rate value for the specified currency',
  })
  value?: number;

  @ApiProperty({
    type: BaseExchangeRateResDto,
    description: 'The exchange rate details used for EUR price calculation',
    required: false,
  })
  exchangeRateEUR?: BaseExchangeRateResDto;

  @ApiProperty({
    type: BaseExchangeRateResDto,
    description: 'The exchange rate details used for USD price calculation',
    required: false,
  })
  exchangeRateUSD?: BaseExchangeRateResDto;
}
