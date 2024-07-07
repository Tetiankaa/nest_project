import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';

export class ChangePasswordReqDto {
  @ApiProperty({ example: '123qwe!@#QWE' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must have minimum 8 characters, at least 1 lowercase  letter, 1 uppercase letter and at least 1 digit',
  })
  @Transform(TransformHelper.trim)
  oldPassword: string;

  @ApiProperty({ example: '123qwe!@#QWE' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message:
      'Password must have minimum 8 characters, at least 1 lowercase  letter, 1 uppercase letter and at least 1 digit',
  })
  @Transform(TransformHelper.trim)
  newPassword: string;
}
