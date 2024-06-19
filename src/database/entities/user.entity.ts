import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from './models/base.model';
import { ETableName } from './enums/table-name.enum';
import {  EUserRole } from './enums/user-role.enum';
import { EAccountType } from './enums/account-type.enum';
import { RefreshTokenEntity } from './refresh-token.entity';
import { ActionTokenEntity } from './action-token.entity';

@Entity({name: ETableName.USERS})
export class UserEntity extends BaseModel{

  @Column({unique: true})
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({type:'enum', enum: EUserRole, default: EUserRole.BUYER})
  role: EUserRole;

  @Column({type: 'enum', enum: EAccountType, default: EAccountType.BASIC})
  account_type: EAccountType;

  @OneToMany(()=>RefreshTokenEntity, (entity)=>entity.user)
  refreshTokens?: RefreshTokenEntity[];

  @OneToMany(()=>ActionTokenEntity, (entity)=>entity.user)
  actionTokens?: ActionTokenEntity[];
}
