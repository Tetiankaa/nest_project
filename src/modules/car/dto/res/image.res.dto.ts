import { ApiProperty } from '@nestjs/swagger';

export class ImageResDto {
  @ApiProperty({
    example: 'edee04b4-a4cd-4ef2-b61b-3ec28ccca998',
    description: 'The ID for the image',
  })
  id: string;

  @ApiProperty({
    example:
      'http://localhost:8000/autoria-clone/images/acae02cc-fdf9-7ee8091b3f01/1754e322-9fcd-4593-9a55-80e26185b9cb.jpg',
    description: 'The URL of the image',
  })
  url: string;
}
