import { ApiProperty } from '@nestjs/swagger';

import { ModelResDto } from './model.res.dto';

export class BrandResDto {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j',
    description: 'Unique identifier for the brand',
  })
  id: string;

  @ApiProperty({
    example: 'BMW',
    description: 'Name of the brand',
  })
  name: string;

  @ApiProperty({
    type: [ModelResDto],
    description: 'List of models associated with the brand',
  })
  models: ModelResDto[];
}
