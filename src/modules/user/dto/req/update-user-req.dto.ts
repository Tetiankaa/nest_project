import { ApiProperty, PickType } from '@nestjs/swagger';

import { BaseUserReqDto } from './base-user-req.dto';
import { IsOptional} from 'class-validator';

export class UpdateUserReqDtoBase extends PickType(BaseUserReqDto, [
  'phone',
  'firstName',
  'lastName'
]) {}

export class UpdateUserReqDto extends UpdateUserReqDtoBase {
  @IsOptional()
  firstName: string;

  @IsOptional()
  phone: string;
}

