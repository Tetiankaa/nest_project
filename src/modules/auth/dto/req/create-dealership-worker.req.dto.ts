import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { EUserRole } from '../../../../database/entities/enums/user-role.enum';
import { BaseAuthReqDto } from './base-auth.req.dto';

export class CreateDealershipWorkerReqDto extends PickType(BaseAuthReqDto, [
  'email',
  'phone',
  'firstName',
  'lastName',
]) {
  @ApiProperty({
    example: 'SALES_PERSON',
    description: 'Role of the worker',
    enum: EUserRole,
  })
  @IsEnum(EUserRole)
  role: EUserRole;
}
