import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from './models/base.model';
import { ETableName } from './enums/table-name.enum';
import {  EUserRole } from './enums/user-role.enum';
import { EAccountType } from './enums/account-type.enum';
import { RefreshTokenEntity } from './refresh-token.entity';
import { ActionTokenEntity } from './action-token.entity';
import { PostEntity } from './post.entity';
import { MissingBrandModelReportEntity } from './missing-brand-model-report.entity';

@Entity({name: ETableName.USERS})
export class UserEntity extends BaseModel{

  @Column({unique: true})
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  phone: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column({type:'enum', enum: EUserRole, default: EUserRole.BUYER})
  role: EUserRole;

  @Column({type: 'enum', enum: EAccountType, default: EAccountType.BASIC})
  account_type: EAccountType;

  @OneToMany(()=>RefreshTokenEntity, (entity)=>entity.user)
  refreshTokens?: RefreshTokenEntity[];

  @OneToMany(()=>ActionTokenEntity, (entity)=>entity.user)
  actionTokens?: ActionTokenEntity[];

  @OneToMany(()=>PostEntity, (entity)=>entity.user)
  posts?: PostEntity[];

  @OneToMany(()=> MissingBrandModelReportEntity, (entity)=> entity.user)
  missing_brand_model_reports: MissingBrandModelReportEntity[];
}
