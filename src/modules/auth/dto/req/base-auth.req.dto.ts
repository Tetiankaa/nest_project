import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { BaseUserReqDto } from '../../../user/dto/req/base-user-req.dto';
import { Transform } from 'class-transformer';
import { TransformHelper } from '../../../../common/helpers/transform.helper';

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
