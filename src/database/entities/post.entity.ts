import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { CarEntity } from './car.entity';
import { EPostStatus } from './enums/post-status.enum';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { UserEntity } from './user.entity';
import { ViewEntity } from './view.entity';

@Entity({ name: ETableName.POSTS })
export class PostEntity extends BaseModel {
  @Column({ type: 'enum', enum: EPostStatus })
  status: EPostStatus;

  @Column({ type: 'int' })
  profanityEdits: number;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column()
  user_id: string;

  @Column()
  car_id: string;

  @OneToOne(() => CarEntity, (car) => car.post)
  @JoinColumn({ name: 'car_id' })
  car?: CarEntity;

  @ManyToOne(() => UserEntity, (entity) => entity.posts)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @OneToMany(() => ViewEntity, (entity) => entity.post)
  views?: ViewEntity[];
}
