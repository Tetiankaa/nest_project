import { Injectable } from '@nestjs/common';
import Filter from "bad-words";
import { BaseCreatePostReqDto } from '../dto/req/base-create-post.req.dto';

@Injectable()
export class ProfanityService {
  private readonly filter: Filter;
  constructor() {
    this.filter = new Filter();
  }
  public checkForProfanity(car: Partial<BaseCreatePostReqDto>): boolean {
    const fieldsToCheck = [
      car.description,
      car.model,
      car.brand,
      car.city,
      car.region,
      car.color,
    ];
    return fieldsToCheck.some((field) => field && this.filter.isProfane(field));
  }
}
