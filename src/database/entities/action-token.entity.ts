import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { EActionTokenType } from '../../modules/auth/enums/action-token-type.enum';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { UserEntity } from './user.entity';

@Entity({ name: ETableName.ACTION_TOKENS })
export class ActionTokenEntity extends BaseModel {
  @Column('text')
  user_id: string;

  @Column('text')
  actionToken: string;

  @Column({ type: 'enum', enum: EActionTokenType })
  tokenType: EActionTokenType;

  @ManyToOne(() => UserEntity, (entity) => entity.actionTokens)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
