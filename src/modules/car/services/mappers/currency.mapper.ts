import { CurrencyEntity } from '../../../../database/entities/currency.entity';
import { CurrencyResDto } from '../../dto/res/currency.res.dto';

export class CurrencyMapper {
  public static toDto(currency: CurrencyEntity): CurrencyResDto {
    return {
      id: currency.id,
      value: currency.value,
    };
  }

  public static toListDto(currencies: CurrencyEntity[]): CurrencyResDto[] {
    return currencies.map((currency) => this.toDto(currency));
  }
}
