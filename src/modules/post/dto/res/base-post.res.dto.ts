import { ApiProperty } from '@nestjs/swagger';

import { EPostStatus } from '../../../../database/entities/enums/post-status.enum';
import { BaseCarResDto } from '../../../car/dto/res/base-car.res.dto';
import { PrivateUserResDto } from '../../../user/dto/res/private-user-res.dto';
import { PublicUserResDto } from '../../../user/dto/res/public-user-res.dto';

export class BasePostResDto {
  @ApiProperty({
    example: '121324354678976543fdg',
    description: 'The id of the Post',
  })
  public readonly id: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The date and time when the post was created.',
  })
  public readonly createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T12:00:00.000Z',
    description: 'The date and time when the post was last updated.',
  })
  public readonly updatedAt: Date;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the post has been deleted.',
  })
  public readonly isDeleted: boolean;

  @ApiProperty({
    description: 'The user who created the post.',
    type: PrivateUserResDto,
  })
  public readonly user: PrivateUserResDto | PublicUserResDto;

  @ApiProperty({
    description: 'The car associated with the post.',
    type: BaseCarResDto,
  })
  public readonly car: BaseCarResDto;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'The status of the post.',
    enum: EPostStatus,
  })
  public readonly status: EPostStatus;

  @ApiProperty({
    example: 1,
    description:
      'The number of times profanity edits have been made to the post.',
  })
  public readonly profanityEdits: number;
}
