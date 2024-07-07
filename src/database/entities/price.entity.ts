import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { CarEntity } from './car.entity';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';

@Entity({ name: ETableName.PRICES })
export class PriceEntity extends BaseModel {
  @Column({ type: 'float' })
  eur: number;

  @Column({ type: 'float' })
  usd: number;

  @Column({ type: 'float' })
  uah: number;

  @Column()
  car_id: string;

  @OneToOne(() => CarEntity, (entity) => entity.price)
  @JoinColumn({ name: 'car_id' })
  car?: CarEntity;
}
