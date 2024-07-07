import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

import { TransformHelper } from '../../../../common/helpers/transform.helper';
import { BaseUserReqDto } from '../../../user/dto/req/base-user-req.dto';

export class BaseAuthReqDto extends PickType(BaseUserReqDto, [
  'email',
  'password',
  'phone',
  'firstName',
  'lastName',
]) {
  @IsNotEmpty()
  @IsString()
  @Transform(TransformHelper.trim)
  readonly deviceId: string;
}
