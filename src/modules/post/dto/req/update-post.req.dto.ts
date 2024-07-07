import { PartialType, PickType } from '@nestjs/swagger';

import { BaseCarReqDto } from '../../../car/dto/req/base-car.req.dto';

export class UpdatePostReqDto extends PartialType(
  PickType(BaseCarReqDto, [
    'description',
    'mileage',
    'model',
    'brand',
    'city',
    'region',
    'color',
    'enteredPrice',
    'enteredCurrency',
    'year',
  ]),
) {}
