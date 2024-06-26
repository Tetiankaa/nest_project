import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { ImageEntity } from './image.entity';
import { ECurrency } from './enums/currency.enum';
import { PriceEntity } from './price.entity';
import { PostEntity } from './post.entity';

@Entity({name: ETableName.CARS})
export class CarEntity extends BaseModel {
@Column({type: 'text'})
  brand: string;

@Column({type: 'text'})
  model: string;

@Column({type: 'text'})
  region: string;

@Column({type: 'text'})
  city: string;

@Column({type: 'text'})
  color: string;

@Column({type: 'text'})
  description: string;

@Column({type: 'int'})
year: number;

@Column({ type: 'int'})
mileage: number

  @Column({type: 'float'})
  enteredPrice: number;

@Column({type: 'enum', enum: ECurrency})
enteredCurrency: ECurrency;

@OneToOne(()=> PriceEntity, (entity)=> entity.car)
  price?: PriceEntity;

@OneToMany(()=> ImageEntity, (entity)=> entity.car)
  images?: ImageEntity[]

  @OneToOne(() => PostEntity, (post) => post.car)
  post?: PostEntity;
}
