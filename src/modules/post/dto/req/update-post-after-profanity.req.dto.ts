import { PartialType, PickType } from '@nestjs/swagger';
import { BaseCarReqDto } from '../../../car/dto/req/base-car.req.dto';

export class UpdatePostAfterProfanityReqDto extends PartialType(
  PickType(BaseCarReqDto, ['brand', 'model', 'description','city','region','color'])
) {}
