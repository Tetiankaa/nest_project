import { PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { BaseUserReqDto } from './base-user-req.dto';

export class UpdateUserReqDtoBase extends PickType(BaseUserReqDto, [
  'phone',
  'firstName',
  'lastName',
]) {}

export class UpdateUserReqDto extends UpdateUserReqDtoBase {
  @IsOptional()
  firstName: string;

  @IsOptional()
  phone: string;
}
