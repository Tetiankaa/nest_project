import { ApiProperty } from '@nestjs/swagger';
import { ECurrency } from '../../../../database/entities/enums/currency.enum';
import { PriceResDto } from '../../../post/dto/res/price.res.dto';

export class BaseCarResDto {
  @ApiProperty({
    example: '121324354678976543fdg',
    description: 'The unique identifier for the car',
  })
  id: string;

  @ApiProperty({
    example: 'BMW',
    description: 'The brand of the car',
  })
  brand: string;

  @ApiProperty({
    example: 'X5',
    description: 'The model of the car',
  })
  model: string;

  @ApiProperty({
    example: 2022,
    description: 'The manufacturing year of the car',
  })
  year: number;

  @ApiProperty({
    example: 15000,
    description: 'The mileage of the car in kilometers',
  })
  mileage: number;

  @ApiProperty({
    example: 'Ternopil',
    description: 'The region where the car is located',
  })
  region: string;

  @ApiProperty({
    example: 'Petrykiv',
    description: 'The city where the car is located',
  })
  city: string;

  @ApiProperty({
    example: 'Black',
    description: 'The color of the car',
  })
  color: string;

  @ApiProperty({
    example: 'USD',
    description: 'The currency in which the price is entered',
    enum: ECurrency,
  })
  enteredCurrency: ECurrency;

  @ApiProperty({
    example: 50000,
    description: 'The price of the car in the entered currency',
  })
  enteredPrice: number;

  @ApiProperty({
    example: 'A well-maintained car with no accidents.',
    description: 'A description of the car',
  })
  description: string;

  @ApiProperty({
    type: [PriceResDto],
    description: 'List of prices in different currencies',
  })
  prices: PriceResDto[];

}
