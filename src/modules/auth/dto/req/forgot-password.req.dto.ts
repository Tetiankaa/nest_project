import { PickType } from '@nestjs/swagger';

import { BaseAuthReqDto } from './base-auth.req.dto';

export class ForgotPasswordReqDto extends PickType(BaseAuthReqDto, ['email']) {}
