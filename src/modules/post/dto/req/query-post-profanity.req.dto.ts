import { PickType } from '@nestjs/swagger';

import { QueryReqDto } from '../../../pagination/dto/req/query.req.dto';

export class QueryPostProfanityReqDto extends PickType(QueryReqDto, [
  'page',
  'limit',
  'profanityEdits',
  'search',
  'order',
  'orderBy',
]) {}
