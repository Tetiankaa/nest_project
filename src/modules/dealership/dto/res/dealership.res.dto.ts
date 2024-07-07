import { ApiProperty } from '@nestjs/swagger';

export class DealershipResDto {
  @ApiProperty({
    example: '1fdg-gfdsg-65y645-v43',
    description: 'The ID for the dealership',
  })
  id: string;

  @ApiProperty({
    example: 'Best Cars Dealership',
    description: 'The name of the dealership',
  })
  name: string;

  @ApiProperty({
    example: 'str Budivelnykiv 4, Kyiv 85412',
    description: 'The address of the dealership',
  })
  address: string;

  @ApiProperty({
    example: '+380 12 345 67 89',
    description: 'The phone number of the dealership',
  })
  phone: string;

  @ApiProperty({
    example: 'info@bestcars.com',
    description: 'The email of the dealership',
  })
  email: string;
}
