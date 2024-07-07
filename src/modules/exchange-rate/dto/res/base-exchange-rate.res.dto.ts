import { ApiProperty } from '@nestjs/swagger';

export class BaseExchangeRateResDto {
  @ApiProperty({
    example: 27.32,
    description: 'The buy exchange rate for the currency',
  })
  buy: number;

  @ApiProperty({
    example: 27.98,
    description: 'The sale exchange rate for the currency',
  })
  sale: number;
}
