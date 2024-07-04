import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ETableName } from './enums/table-name.enum';
import { BaseModel } from './models/base.model';
import { PostEntity } from './post.entity';

@Entity({name: ETableName.VIEWS})
export class ViewEntity extends BaseModel {

  @Column()
  post_id: string;

  @ManyToOne(()=> PostEntity, (entity)=> entity.views)
  @JoinColumn({name: 'post_id'})
  post?: PostEntity;
}
