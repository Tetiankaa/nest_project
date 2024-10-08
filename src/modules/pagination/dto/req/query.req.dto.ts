import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { EOrder } from '../../models/enums/order.enum';
import { EPostOrderBy } from '../../models/enums/post-order.enum';
import { BasePaginationReqDto } from './base-pagination.req.dto';

export class QueryReqDto extends BasePaginationReqDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(TransformHelper.toBoolean)
  isResolved?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(TransformHelper.toBoolean)
  isDeleted?: boolean;

  @ApiProperty({ required: false, enum: EOrder })
  @IsOptional()
  @IsEnum(EOrder)
  order?: EOrder = EOrder.DESC;

  @ApiProperty({ required: false, enum: EPostOrderBy })
  @IsOptional()
  @IsEnum(EPostOrderBy)
  orderBy?: EPostOrderBy = EPostOrderBy.UPDATED_AT;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  profanityEdits?: number;
}
