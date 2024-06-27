import { BaseModel } from './models/base.model';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { UserEntity } from './user.entity';

@Entity({ name: ETableName.MISSING_BRAND_MODEL_REPORTS})
export class MissingBrandModelReportEntity extends BaseModel {
  @Column('text')
  email: string;

  @Column({ nullable: true, type: 'text' })
  fullName?: string;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column('text')
  brand: string;

  @Column('text')
  model: string;

  @Column({ default: false })
  isResolved: boolean;

  @Column()
  user_id: string;

  @ManyToOne(() => UserEntity, (entity)=> entity.missing_brand_model_reports, {lazy: true})
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
