import { SetMetadata } from '@nestjs/common';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { ADMIN_OR_MANAGER } from '../constants/constants';

export const AdminOrManager = () => SetMetadata(ADMIN_OR_MANAGER, [EUserRole.MANAGER, EUserRole.ADMINISTRATOR]);
