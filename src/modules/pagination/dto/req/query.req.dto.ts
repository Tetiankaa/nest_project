import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional } from 'class-validator';
import { BasePaginationReqDto } from './base-pagination.req.dto';
import { EOrder } from '../../enums/order.enum';
import { EPostOrderBy } from '../../enums/post-order.enum';
import { Transform, Type } from 'class-transformer';

export class QueryReqDto extends BasePaginationReqDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(()=> Boolean)
  isResolved?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Transform(()=> Date)
  updatedAt?: Date;

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
