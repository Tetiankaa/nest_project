import { Injectable } from '@nestjs/common';
import { Repository, FindOptions, FindOptionsWhere, FindManyOptions, EntityTarget } from 'typeorm';
import { PaginationResDto } from './dto/res/pagination.res.dto';
import { QueryReqDto } from './dto/req/query.req.dto';
import { EPostStatus } from '../../database/entities/enums/post-status.enum';

@Injectable()
export class PaginationService {

  public async paginate<T>(
    repository: Repository<T>,
    paginationDto: QueryReqDto,
    relations: string[] = [],
    userId?: string,
    status?: EPostStatus,
    applyDefaultPostFilter: boolean = true,
  ): Promise<PaginationResDto<T>> {
    const { page, limit, isResolved,  isDeleted,order, orderBy, profanityEdits, search } = paginationDto;

    const qb = repository.createQueryBuilder('entity');

    if (relations.length) {
      relations.forEach(relation => {
        qb.leftJoinAndSelect(`entity.${relation}`, relation);
        if (relation === 'car') {
          qb.leftJoinAndSelect(`car.price`, 'car_price');

        }
      });
    }
    if (applyDefaultPostFilter) {
      qb.andWhere('entity.isDeleted = :isDeleted', { isDeleted: false });
      qb.andWhere('entity.status = :status', { status: EPostStatus.ACTIVE });
    }

    if (status) qb.andWhere('entity.status = :status', { status });
    if (userId) qb.andWhere('user.id = :userId', { userId });
    if ('isResolved' in paginationDto) qb.andWhere('entity.isResolved = :isResolved', { isResolved });
    if ('isDeleted' in paginationDto) qb.andWhere('entity.isDeleted = :isDeleted', { isDeleted });
    if (profanityEdits) qb.andWhere('entity.profanityEdits = :profanityEdits', { profanityEdits });

    if (search) {
      const { condition, parameters} = this.getSearchCondition(search,repository.target as any);
      qb.andWhere(condition, parameters);
    }

    if (orderBy) {
      qb.orderBy(`entity.${orderBy}`, order );
    }

    const [data, totalCount] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      page,
      limit,
      totalCount
    }
  }
  private getSearchCondition(search: string, entityType: Function): { condition: string, parameters: any } {
    const searchTerm = `%${search.toLowerCase()}%`;

    if (entityType.name === 'PostEntity') {
      return {
        condition: `CONCAT(
          LOWER(car.region),
          LOWER(car.city),
          LOWER(car.description),
          LOWER(user.email),
          LOWER(user.firstName),
          LOWER(user.lastName),
          LOWER(car.brand),
          LOWER(car.model),
          LOWER(car.color)
        ) LIKE :search`,
        parameters: { search: searchTerm }
      };
    } else if (entityType.name === 'MissingBrandModelReportEntity') {
      return {
        condition: `CONCAT(
          LOWER(entity.email),
          LOWER(entity.fullName),
          LOWER(entity.notes),
          LOWER(entity.brand),
          LOWER(entity.model)
        ) LIKE :search`,
        parameters: { search: searchTerm }
      };
    }

    return { condition: '1=1', parameters: {} };
  }
}
