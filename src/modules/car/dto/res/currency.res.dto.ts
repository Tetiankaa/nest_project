import { ApiProperty } from '@nestjs/swagger';

export class CurrencyResDto {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j',
    description: 'Unique identifier for the currency',
  })
  id: string;

  @ApiProperty({
    example: 'USD',
    description: 'Value of the currency',
  })
  value: string;
}
