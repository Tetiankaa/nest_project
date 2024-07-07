import { PickType } from '@nestjs/swagger';

import { BaseCarReqDto } from './base-car.req.dto';

export class BaseMissingBrandModelReportReqDto extends PickType(BaseCarReqDto, [
  'brand',
  'model',
]) {}
