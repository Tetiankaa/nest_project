import { SetMetadata } from '@nestjs/common';

import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { ROLES } from '../constants/constants';

export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES, roles);
