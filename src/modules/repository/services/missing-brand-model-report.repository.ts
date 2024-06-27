import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { MissingBrandModelReportEntity } from '../../../database/entities/missing-brand-model-report.entity';

@Injectable()
export class MissingBrandModelReportRepository extends Repository<MissingBrandModelReportEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MissingBrandModelReportEntity, dataSource.manager);
  }
}
