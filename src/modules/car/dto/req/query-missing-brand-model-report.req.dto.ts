import { PickType } from '@nestjs/swagger';
import { QueryReqDto } from '../../../pagination/dto/req/query.req.dto';

export class QueryMissingBrandModelReportReqDto extends PickType(QueryReqDto,[
  'page',
  'limit',
  'isResolved',
  'order',
  'orderBy',
  'search'
]) {}
