import { PickType } from '@nestjs/swagger';

import { BaseAuthReqDto } from './base-auth.req.dto';

export class SetPasswordReqDto extends PickType(BaseAuthReqDto, ['password']) {}
