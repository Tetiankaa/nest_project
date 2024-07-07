import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { ECurrency } from '../../../database/entities/enums/currency.enum';
import { EPostStatus } from '../../../database/entities/enums/post-status.enum';
import { PostEntity } from '../../../database/entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(PostEntity, dataSource.manager);
  }

  public async getAveragePrice(
    enteredCurrency: ECurrency,
    brand: string,
    model: string,
    region?: string,
  ): Promise<number> {
    const qb = this.createQueryBuilder('post');
    qb.leftJoinAndSelect('post.car', 'car');
    qb.andWhere('car.model = :model', { model });
    qb.andWhere('car.brand = :brand', { brand });
    if (region) {
      qb.andWhere('car.region = :region', { region });
    }
    qb.leftJoinAndSelect('car.price', 'price');

    let currencyColumn: string;

    switch (enteredCurrency) {
      case ECurrency.EUR:
        currencyColumn = 'price.eur';
        break;
      case ECurrency.USD:
        currencyColumn = 'price.usd';
        break;
      case ECurrency.UAH:
        currencyColumn = 'price.uah';
        break;
      default:
        throw new BadRequestException(errorMessages.INVALID_CURRENCY_TYPE);
    }

    qb.select(`AVG(${currencyColumn})`, 'avgPrice');
    const result = await qb.getRawOne();
    return +result.avgPrice.toFixed(2);
  }

  public async getPostsByDateAndStatus(
    updatedAt: Date,
    status: EPostStatus,
    skip: number,
    take: number,
  ): Promise<PostEntity[]> {
    const qb = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.car', 'car')
      .leftJoinAndSelect('car.price', 'price')
      .leftJoinAndSelect('car.images', 'images')
      .leftJoinAndSelect('post.views', 'views')
      .where('post.updatedAt <= :updatedAt', { updatedAt })
      .andWhere('post.status = :status', { status })
      .skip(skip)
      .take(take);

    return await qb.getMany();
  }
}
