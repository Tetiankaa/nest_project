import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { BaseMissingBrandModelReportReqDto } from './base-missing-brand-model-report.req.dto';

export class MissingBrandModelReportReqDto extends PickType(BaseMissingBrandModelReportReqDto, ['model', 'brand']){

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'example@gmail.com' })
  @Matches(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,{ message: 'Email address must be in a valid format (Example: user@example.com)'})
  @Transform(TransformHelper.toLowerCase)
  @Transform(TransformHelper.trim)
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long.' })
  @MaxLength(40, { message: 'Full name must be at most 40 characters long.' })
  @ApiProperty()
  @Transform(TransformHelper.trim)
  @Type(() => String)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Notes must be at most 300 characters long.' })
  @ApiProperty()
  @Transform(TransformHelper.trim)
  @Type(() => String)
  notes?: string;
}
