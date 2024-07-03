import { ECurrency } from '../../../database/entities/enums/currency.enum';

export interface IExchangeRate {
  base_ccy: string;
  ccy: ECurrency;
  buy: number;
  sale: number;
}
