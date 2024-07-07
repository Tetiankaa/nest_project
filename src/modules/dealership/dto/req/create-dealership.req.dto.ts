import { PickType } from '@nestjs/swagger';

import { BaseDealershipReqDto } from './base-dealership.req.dto';

export class CreateDealershipReqDto extends PickType(BaseDealershipReqDto, [
  'address',
  'name',
  'email',
  'phone',
]) {}
