import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { ApiProperty } from '@nestjs/swagger';

export class BaseMissingBrandModelReportReqDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Brand must be at least 2 characters long.' })
  @MaxLength(40, { message: 'Brand must be at most 40 characters long.' })
  @Matches(/^[a-zA-Z0-9\s\-&\.]+$/, {
    message: 'Brand can only contain letters, numbers, spaces, hyphens, ampersands, and periods.',
  })
  @Transform(TransformHelper.trim)
  @Transform(TransformHelper.toUpperCase)
  @Type(() => String)
  @ApiProperty({ example: 'BMW'})
  brand: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Model must be at least 2 characters long.' })
  @MaxLength(40, { message: 'Model must be at most 40 characters long.' })
  @Matches(/^[a-zA-Z0-9\s\-&\.]+$/, {
    message: 'Model can only contain letters, numbers, spaces, hyphens, ampersands, and periods.',
  })
  @Transform(TransformHelper.trim)
  @Transform(TransformHelper.toUpperCase)
  @Type(() => String)
  @ApiProperty({ example: 'X5'})
  model: string;
}
