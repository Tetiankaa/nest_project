import { PickType } from '@nestjs/swagger';
import { BaseCarReqDto } from '../../../car/dto/req/base-car.req.dto';

export class BaseCreatePostReqDto extends PickType(BaseCarReqDto,[
'brand','model','region','city','color', 'description', 'enteredPrice','enteredCurrency','mileage','year'
]) {

}
