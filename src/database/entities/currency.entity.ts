import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { ECurrency } from './enums/currency.enum';

@Entity({name: ETableName.CURRENCIES})
export class CurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'enum', enum: ECurrency})
  value: ECurrency;
}
