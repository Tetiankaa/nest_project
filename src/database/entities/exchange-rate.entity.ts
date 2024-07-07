import { Column, Entity } from 'typeorm';

import { ECurrency } from './enums/currency.enum';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';

@Entity({ name: ETableName.EXCHANGE_RATES })
export class ExchangeRateEntity extends BaseModel {
  @Column({ type: 'enum', enum: ECurrency })
  ccy: ECurrency;

  @Column('text')
  base_ccy: string;

  @Column('float')
  buy: number;

  @Column('float')
  sale: number;
}
