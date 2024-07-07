import { PickType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { BaseDealershipReqDto } from './base-dealership.req.dto';

export class UpdateDealershipReqDto extends PickType(BaseDealershipReqDto, [
  'phone',
  'address',
]) {
  @IsOptional()
  phone: string;

  @IsOptional()
  address: string;
}
