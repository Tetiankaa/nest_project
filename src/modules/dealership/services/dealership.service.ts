import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { DealershipEntity } from '../../../database/entities/dealership.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { DealershipRepository } from '../../repository/services/dealership.repository';
import { CreateDealershipReqDto } from '../dto/req/create-dealership.req.dto';
import { UpdateDealershipReqDto } from '../dto/req/update-dealership.req.dto';
import { DealershipResDto } from '../dto/res/dealership.res.dto';
import { DealershipMapper } from './dealership.mapper';

@Injectable()
export class DealershipService {
  constructor(
    private readonly dealershipRepository: DealershipRepository,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}
  public async createDealership(
    dto: CreateDealershipReqDto,
    userData: IUserData,
  ): Promise<DealershipResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const dealershipRepository =
        entityManager.getRepository(DealershipEntity);
      const userRepository = entityManager.getRepository(UserEntity);

      const isDealershipNameExists = await dealershipRepository.findOne({
        where: { name: dto.name },
      });
      if (isDealershipNameExists) {
        throw new ForbiddenException(errorMessages.DEALERSHIP_ALREADY_EXISTS);
      }

      const isDealershipEmailExists = await dealershipRepository.findOne({
        where: { email: dto.email },
      });
      if (isDealershipEmailExists) {
        throw new ForbiddenException(
          errorMessages.DEALERSHIP_EMAIL_ALREADY_EXISTS,
        );
      }
      const user = await userRepository.findOneBy({ id: userData.userId });

      const dealership = await dealershipRepository.save(
        dealershipRepository.create({ ...dto }),
      );

      await userRepository.save({ ...user, dealership_id: dealership.id });

      return DealershipMapper.toDto(dealership);
    });
  }

  public async updateDealershipById(
    dto: UpdateDealershipReqDto,
    id: string,
  ): Promise<DealershipResDto> {
    const dealership = await this.findDealershipByIdOrThrow(id);

    const updatedDealership = await this.dealershipRepository.save({
      ...dealership,
      ...dto,
    });
    return DealershipMapper.toDto(updatedDealership);
  }

  public async getById(id: string): Promise<DealershipResDto> {
    const dealership = await this.findDealershipByIdOrThrow(id);
    return DealershipMapper.toDto(dealership);
  }

  private async findDealershipByIdOrThrow(
    id: string,
  ): Promise<DealershipEntity> {
    const dealership = await this.dealershipRepository.findOne({
      where: { id },
    });

    if (!dealership) {
      throw new NotFoundException(errorMessages.DEALERSHIP_NOT_FOUND);
    }

    return dealership;
  }
}
