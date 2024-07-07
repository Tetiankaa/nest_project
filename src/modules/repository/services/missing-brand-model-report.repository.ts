import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { MissingBrandModelReportEntity } from '../../../database/entities/missing-brand-model-report.entity';

@Injectable()
export class MissingBrandModelReportRepository extends Repository<MissingBrandModelReportEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(MissingBrandModelReportEntity, dataSource.manager);
  }

  public async removeResolvedReports(
    updatedAt: Date,
    isResolved = true,
  ): Promise<void> {
    await this.createQueryBuilder()
      .delete()
      .from(MissingBrandModelReportEntity)
      .where('updatedAt <= :updatedAt', { updatedAt })
      .andWhere('isResolved = :isResolved', { isResolved })
      .execute();
  }
}
