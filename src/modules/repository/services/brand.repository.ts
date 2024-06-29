import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BrandEntity } from '../../../database/entities/brand.entity';
//
// @Injectable()
// export class BrandRepository extends Repository<BrandEntity> {
//   constructor(private readonly dataSource: DataSource) {
//     super(BrandEntity, dataSource.manager);
//   }
//   public async findBrandByName(brand: string): Promise<BrandEntity> {
//     const qb = this.createQueryBuilder('brand');
//     qb.leftJoinAndSelect('brand.models','model');
//     qb.where('LOWER(brand.name) = LOWER(:name)', { name: brand });
//
//     return await qb.getOne();
//   }
// }
export const BrandRepository = (dataSource: DataSource) =>
  dataSource.getRepository(BrandEntity).extend({
    async findBrandByName(brand: string): Promise<BrandEntity> {
      return this.createQueryBuilder('brand')
        .leftJoinAndSelect('brand.models', 'model')
        .where('LOWER(brand.name) = LOWER(:name)', { name: brand })
        .getOne();
    },
  });

export type BrandRepository = ReturnType<typeof BrandRepository>;
