import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { TimeHelper } from '../../../../common/helpers/time.helper';
import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { ECurrency } from '../../../../database/entities/enums/currency.enum';

export class BaseCarReqDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Brand must be at least 2 characters long.' })
  @MaxLength(40, { message: 'Brand must be at most 40 characters long.' })
  @Matches(/^[a-zA-Z0-9\s\-&\.]+$/, {
    message:
      'Brand can only contain letters, numbers, spaces, hyphens, ampersands, and periods.',
  })
  @Transform(TransformHelper.trim)
  @Transform(TransformHelper.toUpperCase)
  @Type(() => String)
  @ApiProperty({ example: 'BMW' })
  brand: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Model must be at least 2 characters long.' })
  @MaxLength(40, { message: 'Model must be at most 40 characters long.' })
  @Matches(/^[a-zA-Z0-9\s\-&\.]+$/, {
    message:
      'Model can only contain letters, numbers, spaces, hyphens, ampersands, and periods.',
  })
  @Transform(TransformHelper.trim)
  @Transform(TransformHelper.toUpperCase)
  @Type(() => String)
  @ApiProperty({ example: 'X5' })
  model: string;

  @IsString()
  @IsNotEmpty({ message: 'Region cannot be empty' })
  @MinLength(2, { message: 'Region must be at least 2 characters long' })
  @MaxLength(40, { message: 'Region must be at most 40 characters long' })
  @Transform(TransformHelper.trim)
  @Type(() => String)
  @ApiProperty({ example: 'Ternopil' })
  region: string;

  @IsString()
  @IsNotEmpty({ message: 'City cannot be empty' })
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(40, { message: 'City must be at most 40 characters long' })
  @Transform(TransformHelper.trim)
  @Type(() => String)
  @ApiProperty({ example: 'Petrykiv' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Color cannot be empty' })
  @MinLength(2, { message: 'Color must be at least 2 characters long' })
  @MaxLength(40, { message: 'Color must be at most 40 characters long' })
  @Transform(TransformHelper.trim)
  @Type(() => String)
  @ApiProperty({ example: 'Yellow' })
  color: string;

  @IsString()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MinLength(20, { message: 'Description must be at least 20 characters long' })
  @MaxLength(300, {
    message: 'Description must be at most 300 characters long',
  })
  @Transform(TransformHelper.trim)
  @Type(() => String)
  @ApiProperty({
    example: 'Installation of additional aluminum engine protection.',
  })
  description: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Entered Price must be a number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Entered Price must be a positive number' })
  @IsNotEmpty({ message: 'Entered Price cannot be empty' })
  @Type(() => Number)
  @ApiProperty({ example: 20000.0 })
  enteredPrice: number;

  @IsString()
  @IsNotEmpty({ message: 'Entered Currency is a required field' })
  @IsEnum(ECurrency, {
    message: `Entered Currency must be one of the following values: ${Object.values(ECurrency)}`,
  })
  @ApiProperty({ example: 'USD' })
  enteredCurrency: ECurrency;

  @IsNumber()
  @IsPositive({ message: 'Mileage must be a positive number' })
  @IsNotEmpty({ message: 'Mileage is a required field' })
  @Type(() => Number)
  @ApiProperty({ example: 33549 })
  mileage: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Year is a required field' })
  @Type(() => Number)
  @Min(1990, { message: 'Year must be greater than or equal to 1990' })
  @Max(TimeHelper.getCurrentYear(), {
    message: `Year must be less than or equal to ${TimeHelper.getCurrentYear()}`,
  })
  @ApiProperty({ example: 2018 })
  year: number;
}
