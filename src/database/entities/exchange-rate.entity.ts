import { Column, Entity } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { ECurrency } from './enums/currency.enum';
import { Type } from 'class-transformer';

@Entity({name: ETableName.EXCHANGE_RATES})
export class ExchangeRateEntity extends BaseModel {
  @Column({type:'enum', enum: ECurrency})
  ccy: ECurrency;

  @Column('text')
  base_ccy: string;

  @Column('float')
  buy: number;

  @Column('float')
  sale: number;

}
