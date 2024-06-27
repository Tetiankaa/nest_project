import { PickType } from '@nestjs/swagger';
import { BaseReportMissingBrandModelReqDto } from './base-report-missing-brand-model.req.dto';

export class CreateBrandModelReqDto extends PickType(BaseReportMissingBrandModelReqDto,['brand','model']) {}
