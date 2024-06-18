import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { TransformHelper } from '../../../../common/helpers/transform.helper';

export class ChangePasswordReqDto {
  @ApiProperty({ example: '123qwe!@#QWE' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,{message: 'Password must have minimum 8 characters, at least one lowercase  letter, one uppercase letter and at least one digit'})
  @Transform(TransformHelper.trim)
  oldPassword: string;

  @ApiProperty({ example: '123qwe!@#QWE' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,{ message: 'Password must have minimum 8 characters, at least one lowercase  letter, one uppercase letter and at least one digit'})
  @Transform(TransformHelper.trim)
  newPassword: string;
}
