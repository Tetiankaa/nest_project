import { ECurrency } from '../../../../database/entities/enums/currency.enum';
import { ApiProperty } from '@nestjs/swagger';

export class PriceResDto {
  @ApiProperty({
    example: 'USD',
    description: 'The currency code',
    enum: ECurrency,
  })
  currency: ECurrency;

  @ApiProperty({
    example: 20200.00,
    description: 'The exchange rate value for the specified currency',
  })
  value: number;
}
