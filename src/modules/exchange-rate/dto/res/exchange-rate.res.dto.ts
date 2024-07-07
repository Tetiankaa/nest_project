import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { BaseExchangeRateResDto } from './base-exchange-rate.res.dto';

export class ExchangeRateResDto {
  @ApiProperty({
    description: 'Exchange rate details for EUR',
    type: BaseExchangeRateResDto,
  })
  @ValidateNested()
  @Type(() => BaseExchangeRateResDto)
  eur: BaseExchangeRateResDto;

  @ApiProperty({
    description: 'Exchange rate details for USD',
    type: BaseExchangeRateResDto,
  })
  @ValidateNested()
  @Type(() => BaseExchangeRateResDto)
  usd: BaseExchangeRateResDto;
}
