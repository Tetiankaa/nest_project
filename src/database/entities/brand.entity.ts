import { Column, Entity, OneToMany } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { ModelEntity } from './model.entity';

@Entity({name: ETableName.BRANDS})
export class BrandEntity extends BaseModel {
  @Column({ unique: true})
  name: string;

  @OneToMany(()=>ModelEntity, (entity)=>entity.brand)
  models?: ModelEntity[]
}
