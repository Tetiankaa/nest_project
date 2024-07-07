import { ApiProperty } from '@nestjs/swagger';

import { ECurrency } from '../../../../database/entities/enums/currency.enum';

export class PostInfoResDto {
  @ApiProperty({
    example: 'postId',
    description: 'The ID of the post.',
  })
  public readonly postId: string;

  @ApiProperty({
    example: 25000,
    description:
      'The average price of the car across Ukraine in the specified currency.',
  })
  public readonly averagePriceUkraine: number;

  @ApiProperty({
    example: 24000,
    description:
      'The average price of the car in the region where it is being sold, in the specified currency.',
  })
  public readonly avgPriceByCarRegion: number;

  @ApiProperty({
    example: 'USD',
    description: 'The currency in which the prices are provided.',
  })
  public readonly currency: ECurrency;

  @ApiProperty({
    example: 200,
    description: 'The total number of views the post has received.',
  })
  public readonly totalViews: number;

  @ApiProperty({
    example: 10,
    description: 'The number of views the post has received in the past day.',
  })
  public readonly viewsPerDay: number;

  @ApiProperty({
    example: 50,
    description: 'The number of views the post has received in the past week.',
  })
  public readonly viewsPerWeek: number;

  @ApiProperty({
    example: 150,
    description: 'The number of views the post has received in the past month.',
  })
  public readonly viewsPerMonth: number;
}
