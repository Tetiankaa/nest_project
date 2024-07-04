import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BasePaginationReqDto } from './base-pagination.req.dto';
import { EOrder } from '../../enums/order.enum';
import { EPostOrderBy } from '../../enums/post-order.enum';
import { Transform, Type } from 'class-transformer';
import { TransformHelper } from '../../../../common/helpers/transform.helper';

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
  @Transform(()=> Number)
  profanityEdits?: number;
}
