import { ApiProperty, PickType } from '@nestjs/swagger';
import { BasePostResDto } from './base-post.res.dto';
import { IsOptional } from 'class-validator';
import { TokenPairResDto } from '../../../auth/dto/res/token-pair.res.dto';

export class PrivatePostResDto extends PickType(BasePostResDto,[
  'id',
  'createdAt',
  'updatedAt',
  'status',
  'profanityEdits',
  'isDeleted',
  'car',
  'user'
]) {
  @ApiProperty({
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    description: 'The pair of tokens if generated',
    required: false,
  })
  @IsOptional()
  public tokens?: TokenPairResDto;
}
