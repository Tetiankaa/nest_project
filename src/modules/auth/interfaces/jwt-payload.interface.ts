import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';

export interface IJwtPayload {
  userId: string;
  deviceId: string;
  role: EUserRole;
  accountType?: EAccountType;
}
