import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { BrandEntity } from './brand.entity';


@Entity({name: ETableName.MODELS})
export class ModelEntity extends BaseModel{

  @Column()
  name: string;

  @ManyToOne(()=>BrandEntity, (entity)=> entity.models)
  @JoinColumn({ name: 'brand_id'})
  brand: BrandEntity;
}
