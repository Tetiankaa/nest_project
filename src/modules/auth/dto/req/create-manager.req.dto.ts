import { PickType } from '@nestjs/swagger';

import { BaseAuthReqDto } from './base-auth.req.dto';

export class CreateManagerReqDto extends PickType(BaseAuthReqDto, [
  'email',
  'phone',
  'firstName',
  'lastName',
]) {}
