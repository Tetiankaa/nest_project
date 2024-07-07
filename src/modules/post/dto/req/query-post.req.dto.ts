import { PickType } from '@nestjs/swagger';

import { QueryReqDto } from '../../../pagination/dto/req/query.req.dto';

export class QueryPostReqDto extends PickType(QueryReqDto, [
  'page',
  'limit',
  'isDeleted',
  'order',
  'orderBy',
  'profanityEdits',
  'search',
]) {}
