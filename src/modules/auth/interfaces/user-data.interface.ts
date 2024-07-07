import { EAccountType } from '../../../database/entities/enums/account-type.enum';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';

export interface IUserData {
  userId: string;
  email: string;
  deviceId: string;
  role: EUserRole;
  dealershipId?: string;
  accountType?: EAccountType;
}
