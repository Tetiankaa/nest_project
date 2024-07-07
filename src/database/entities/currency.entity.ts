import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ECurrency } from './enums/currency.enum';
import { ETableName } from './enums/table-name.enum';

@Entity({ name: ETableName.CURRENCIES })
export class CurrencyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ECurrency })
  value: ECurrency;
}
