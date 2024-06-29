import { Injectable } from '@nestjs/common';
import { Repository, FindOptions, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { PaginationResDto } from '../dto/res/pagination.res.dto';
import { QueryReqDto } from '../dto/req/query.req.dto';

@Injectable()
export class PaginationService {

  public async paginate<T>(
    repository: Repository<T>,
    paginationDto: QueryReqDto,
    relations: string[] = []
  ): Promise<PaginationResDto<T>> {
    const { page, limit, isResolved, isDeleted, updatedAt, order, orderBy, profanityEdits } = paginationDto;

    const where: any = {};
    if (isResolved) where.isResolved = isResolved;
    if (isDeleted) where.isDeleted = isDeleted;
    if (updatedAt) where.updatedAt = updatedAt;
    if (profanityEdits) where.profanityEdits = profanityEdits;

    const orderOptions: any = {};
    if (orderBy && order) {
      orderOptions[orderBy] = order;
    }

    const findOptions: FindManyOptions<T> = {
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations,
      order: orderOptions,
    };

    const [data, totalCount] = await repository.findAndCount(findOptions);
    return {
      data,
      page,
      limit,
      totalCount
    }
  }
}
