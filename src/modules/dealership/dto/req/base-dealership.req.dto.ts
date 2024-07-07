import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';

export class BaseDealershipReqDto {
  @ApiProperty({ example: 'Best Cars' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(100, { message: 'Name must be at most 100 characters long.' })
  @Transform(TransformHelper.trim)
  @Type(() => String)
  name: string;

  @ApiProperty({
    example: '123 Main St, Springfield, IL',
    description: 'The address of the dealership',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Address must be at least 5 characters long.' })
  @MaxLength(200, { message: 'Address must be at most 200 characters long.' })
  @Transform(TransformHelper.trim)
  @Type(() => String)
  address: string;

  @ApiProperty({ example: '+380 12 345 67 89' })
  @IsString()
  @IsNotEmpty()
  @Transform(TransformHelper.trim)
  @Matches(/^\+\d{3}\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/, {
    message: 'Invalid phone number. (Example: +380 12 345 67 89)',
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'example@gmail.com' })
  @Matches(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, {
    message:
      'Email address must be in a valid format (Example: user@example.com)',
  })
  @Transform(TransformHelper.toLowerCase)
  @Transform(TransformHelper.trim)
  email: string;
}
