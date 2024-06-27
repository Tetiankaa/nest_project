import { ApiProperty } from '@nestjs/swagger';

export class ModelResDto {
  @ApiProperty({
    example: '1a2b3c4d-5e6f-7g8h-9i0j',
    description: 'Unique identifier for the model',
  })
  id: string;

  @ApiProperty({
    example: 'X5',
    description: 'Name of the model',
  })
  name: string;
}
