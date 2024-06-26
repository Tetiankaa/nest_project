import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { CarEntity } from './car.entity';

@Entity({name: ETableName.IMAGES})
export class ImageEntity extends BaseModel {

  @Column({nullable: true})
  name: string;

  @Column()
  car_id: string;

  @ManyToOne(()=> CarEntity,(entity)=>entity.images)
  @JoinColumn({ name: 'car_id'})
  car?: CarEntity;
}
