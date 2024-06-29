import { ApiProperty } from '@nestjs/swagger';

export class PaginationResDto<T> {
  @ApiProperty({
    isArray: true,
    description: 'Array of data items',
  })
  data: T[];

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    example: 100,
    description: 'Total number of items',
  })
  totalCount: number;
}
