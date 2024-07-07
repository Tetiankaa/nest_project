import { Column, Entity, OneToMany } from 'typeorm';

import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { UserEntity } from './user.entity';

@Entity({ name: ETableName.DEALERSHIPS })
export class DealershipEntity extends BaseModel {
  @Column('text', { unique: true })
  name: string;

  @Column('text')
  address: string;

  @Column('text')
  phone: string;

  @Column('text', { unique: true })
  email: string;

  @OneToMany(() => UserEntity, (user) => user.dealership)
  users?: UserEntity[];
}
