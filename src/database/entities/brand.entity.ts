import { Column, Entity, OneToMany } from 'typeorm';

import { ETableName } from './enums/table-name.enum';
import { ModelEntity } from './model.entity';
import { BaseModel } from './models/base.model';

@Entity({ name: ETableName.BRANDS })
export class BrandEntity extends BaseModel {
  @Column({ unique: true, type: 'text' })
  name: string;

  @OneToMany(() => ModelEntity, (entity) => entity.brand)
  models?: ModelEntity[];
}
