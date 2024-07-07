import { SetMetadata } from '@nestjs/common';

import { ACTION_TOKEN_TYPE } from '../constants/constants';
import { EActionTokenType } from '../enums/action-token-type.enum';

export const ActionTokenType = (type: EActionTokenType) =>
  SetMetadata(ACTION_TOKEN_TYPE, type);
