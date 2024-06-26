import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PriceEntity } from '../../../database/entities/price.entity';

@Injectable()
export class PriceRepository extends Repository<PriceEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PriceEntity, dataSource.manager);
  }
}
