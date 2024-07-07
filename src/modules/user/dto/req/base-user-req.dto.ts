import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';

export class BaseUserReqDto {
  @IsString()
  @Length(2, 50)
  @IsNotEmpty()
  @Transform(TransformHelper.trim)
  @Type(() => String)
  @ApiProperty()
  firstName: string;

  @IsOptional()
  @IsString()
  @Length(2, 50)
  @Transform(TransformHelper.trim)
  @Type(() => String)
  @ApiProperty()
  lastName: string;

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

  @ApiProperty({ example: '123qwe!@#QWE' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must have minimum 8 characters, at least 1 lowercase  letter, 1 uppercase letter and at least 1 digit',
  })
  @Transform(TransformHelper.trim)
  password: string;

  @ApiProperty({ example: '+380 12 345 67 89' })
  @IsString()
  @IsNotEmpty()
  @Transform(TransformHelper.trim)
  @Matches(/^\+\d{3}\s\d{2}\s\d{3}\s\d{2}\s\d{2}$/, {
    message: 'Invalid phone number. (Example: +380 12 345 67 89)',
  })
  phone: string;
}
