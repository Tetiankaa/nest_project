import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ActionTokenEntity } from '../../../database/entities/action-token.entity';

@Injectable()
export class ActionTokenRepository extends Repository<ActionTokenEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ActionTokenEntity, dataSource.manager);
  }
  public async isTokenExist(actionToken: string): Promise<boolean> {
    return await this.exists({ where: { actionToken } });
  }

}
