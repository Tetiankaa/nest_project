import { PrivateUserResDto } from '../../../user/dto/res/private-user-res.dto';
import { TokenPairResDto } from './token-pair.res.dto';

export class AuthResDto {
  tokens: TokenPairResDto;
  user: PrivateUserResDto;
}
