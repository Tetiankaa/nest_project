import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

import { errorMessages } from '../../../common/constants/error-messages.constant';
import { Configs, SecurityConfig } from '../../../configs/configs.type';
import { BrandEntity } from '../../../database/entities/brand.entity';
import { MissingBrandModelReportEntity } from '../../../database/entities/missing-brand-model-report.entity';
import { ModelEntity } from '../../../database/entities/model.entity';
import { UserEntity } from '../../../database/entities/user.entity';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { EEmailType } from '../../email/enums/email-type.enum';
import { EmailService } from '../../email/services/email.service';
import { PaginationResDto } from '../../pagination/dto/res/pagination.res.dto';
import { PaginationService } from '../../pagination/services/pagination.service';
import { BrandRepository } from '../../repository/services/brand.repository';
import { CurrencyRepository } from '../../repository/services/currency.repository';
import { MissingBrandModelReportRepository } from '../../repository/services/missing-brand-model-report.repository';
import { CreateBrandModelReqDto } from '../dto/req/create-brand-model.req.dto';
import { MissingBrandModelReportReqDto } from '../dto/req/missing-brand-model-report.req.dto';
import { QueryMissingBrandModelReportReqDto } from '../dto/req/query-missing-brand-model-report.req.dto';
import { BrandResDto } from '../dto/res/brand.res.dto';
import { CurrencyResDto } from '../dto/res/currency.res.dto';
import { MissingBrandModelReportResDto } from '../dto/res/missing-brand-model-report.res.dto';
import { BrandMapper } from './mappers/brand.mapper';
import { CurrencyMapper } from './mappers/currency.mapper';
import { MissingBrandModelReportMapper } from './mappers/missing-brand-model-report.mapper';

@Injectable()
export class CarService {
  private readonly securityConfig: SecurityConfig;

  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly brandRepository: BrandRepository,
    private readonly missingBrandModelReportRepository: MissingBrandModelReportRepository,
    private readonly emailService: EmailService,
    private readonly paginationService: PaginationService,
    private readonly configService: ConfigService<Configs>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security');
  }
  public async getCurrencies(): Promise<CurrencyResDto[]> {
    const currencies = await this.currencyRepository.find();
    return CurrencyMapper.toListDto(currencies);
  }
  public async getBrands(): Promise<BrandResDto[]> {
    const brands = await this.brandRepository.find({ relations: ['models'] });
    return BrandMapper.toListDto(brands);
  }
  public async reportMissingBrandModel(
    dto: MissingBrandModelReportReqDto,
    userData: IUserData,
  ): Promise<MissingBrandModelReportResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const missingBrandModelRepository = entityManager.getRepository(
        MissingBrandModelReportEntity,
      );

      const user = await userRepository.findOneBy({ id: userData.userId });

      if (user.email != dto.email) {
        throw new BadRequestException(errorMessages.NOT_AUTHENTICATED_EMAIL);
      }

      const report = await missingBrandModelRepository.save(
        missingBrandModelRepository.create({
          ...dto,
          user_id: userData.userId,
        }),
      );
      await this.emailService.sendByEmailType(
        EEmailType.MISSING_BRAND_MODEL,
        {
          email: dto.email,
          brand: dto.brand,
          model: dto.model,
          fullName: dto.fullName,
          notes: dto.notes,
        },
        this.securityConfig.manager_email,
      );

      return MissingBrandModelReportMapper.toDto(report, user);
    });
  }

  public async createBrandOrModel(
    dto: CreateBrandModelReqDto,
  ): Promise<BrandResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const brandRepository = entityManager.getRepository(BrandEntity);
      const modelRepository = entityManager.getRepository(ModelEntity);

      const { brand, model } = dto;

      let existingBrand = await brandRepository.findOne({
        where: { name: brand },
        relations: ['models'],
      });
      if (!existingBrand) {
        existingBrand = await brandRepository.save(
          brandRepository.create({ name: brand, models: [] }),
        );
      }
      if (
        existingBrand.models.some(
          (m) => m.name.toLowerCase() === model.toLowerCase(),
        )
      ) {
        throw new BadRequestException(errorMessages.BRAND_MODEL_ALREADY_EXIST);
      }
      const newModel = await modelRepository.save(
        modelRepository.create({ name: model, brand_id: existingBrand.id }),
      );
      existingBrand.models.push(newModel);

      return BrandMapper.toDto(existingBrand);
    });
  }

  public async getReports(
    query: QueryMissingBrandModelReportReqDto,
  ): Promise<PaginationResDto<MissingBrandModelReportResDto>> {
    const reports =
      await this.paginationService.paginate<MissingBrandModelReportEntity>(
        this.missingBrandModelReportRepository,
        { ...query, isResolved: Boolean(query.isResolved) },
        ['user'],
        null,
        null,
        false,
      );

    const mappedReports = MissingBrandModelReportMapper.toListDto(reports);

    return {
      data: mappedReports.data,
      limit: mappedReports.limit,
      totalCount: mappedReports.totalCount,
      page: mappedReports.page,
    };
  }

  public async getReportById(
    reportId: string,
  ): Promise<MissingBrandModelReportResDto> {
    const report = await this.missingBrandModelReportRepository.findOne({
      where: { id: reportId },
      relations: ['user'],
    });
    if (!report) {
      throw new NotFoundException(errorMessages.REPORT_NOT_FOUND);
    }
    return MissingBrandModelReportMapper.toDto(report, report.user);
  }

  public async toggleReportResolved(
    reportId: string,
  ): Promise<MissingBrandModelReportResDto> {
    const report = await this.missingBrandModelReportRepository.findOne({
      where: { id: reportId },
      relations: ['user'],
    });

    if (!report) {
      throw new NotFoundException(errorMessages.REPORT_NOT_FOUND);
    }
    const wasResolvedBefore = report.isResolved;

    report.isResolved = !report.isResolved;

    await this.missingBrandModelReportRepository.save(report);

    if (!wasResolvedBefore) {
      await this.emailService.sendByEmailType(
        EEmailType.MISSING_BRAND_MODEL_ADDED,
        {
          brand: report.brand,
          model: report.model,
          fullName: report.fullName,
        },
        report.email,
      );
    }
    return MissingBrandModelReportMapper.toDto(report, report.user);
  }
}
