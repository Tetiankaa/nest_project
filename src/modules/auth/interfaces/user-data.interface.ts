import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { EAccountType } from '../../../database/entities/enums/account-type.enum';

export interface IUserData {
  userId: string;
  email: string;
  deviceId: string;
  role: EUserRole;
  accountType?: EAccountType;
}
