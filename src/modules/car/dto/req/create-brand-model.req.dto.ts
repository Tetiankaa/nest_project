import { PickType } from '@nestjs/swagger';

import { BaseMissingBrandModelReportReqDto } from './base-missing-brand-model-report.req.dto';

export class CreateBrandModelReqDto extends PickType(
  BaseMissingBrandModelReportReqDto,
  ['brand', 'model'],
) {}
