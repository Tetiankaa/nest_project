import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BrandEntity } from './brand.entity';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';

@Entity({ name: ETableName.MODELS })
export class ModelEntity extends BaseModel {
  @Column({ type: 'text' })
  name: string;

  @Column()
  brand_id: string;

  @ManyToOne(() => BrandEntity, (entity) => entity.models)
  @JoinColumn({ name: 'brand_id' })
  brand?: BrandEntity;
}
