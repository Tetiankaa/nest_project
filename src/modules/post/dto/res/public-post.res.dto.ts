import { ApiProperty, PickType } from '@nestjs/swagger';

import { PublicUserResDto } from '../../../user/dto/res/public-user-res.dto';
import { BasePostResDto } from './base-post.res.dto';

export class PublicPostResDto extends PickType(BasePostResDto, [
  'id',
  'createdAt',
  'updatedAt',
  'car',
  'user',
]) {
  @ApiProperty({
    description: 'The user who created the post.',
    type: PublicUserResDto,
  })
  public readonly user: PublicUserResDto;
}
