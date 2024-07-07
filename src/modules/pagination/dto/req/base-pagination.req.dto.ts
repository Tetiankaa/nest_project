import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';

export class BasePaginationReqDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Transform(TransformHelper.toLowerCase)
  @Transform(TransformHelper.trim)
  search?: string;
}
