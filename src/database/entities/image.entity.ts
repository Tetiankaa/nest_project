import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { CarEntity } from './car.entity';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';

@Entity({ name: ETableName.IMAGES })
export class ImageEntity extends BaseModel {
  @Column()
  name: string;

  @Column()
  car_id: string;

  @ManyToOne(() => CarEntity, (entity) => entity.images)
  @JoinColumn({ name: 'car_id' })
  car?: CarEntity;
}
