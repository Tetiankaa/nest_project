import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { CurrencyResDto } from '../dto/res/currency.res.dto';
import { CurrencyRepository } from '../../repository/services/currency.repository';
import { CurrencyMapper } from './mappers/currency.mapper';
import { BrandResDto } from '../dto/res/brand.res.dto';
import { BrandRepository } from '../../repository/services/brand.repository';
import { BrandMapper } from './mappers/brand.mapper';
import { MissingBrandModelReportReqDto } from '../dto/req/missing-brand-model-report.req.dto';
import { IUserData } from '../../auth/interfaces/user-data.interface';
import { MissingBrandModelReportResDto } from '../dto/res/missing-brand-model-report.res.dto';
import { InjectDataSource, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { UserEntity } from '../../../database/entities/user.entity';
import { MissingBrandModelReportEntity } from '../../../database/entities/missing-brand-model-report.entity';
import { errorMessages } from '../../../common/constants/error-messages.constant';
import { EmailService } from '../../email/email.service';
import { EEmailType } from '../../email/enums/email-type.enum';
import { Configs, SecurityConfig } from '../../../configs/configs.type';
import { ConfigService } from '@nestjs/config';
import { MissingBrandModelReportMapper } from './mappers/missing-brand-model-report.mapper';
import { CreateBrandModelReqDto } from '../dto/req/create-brand-model.req.dto';
import { EUserRole } from '../../../database/entities/enums/user-role.enum';
import { ModelEntity } from '../../../database/entities/model.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { MissingBrandModelReportRepository } from '../../repository/services/missing-brand-model-report.repository';
import { PaginationService } from '../../pagination/services/pagination.service';
import { QueryReqDto } from '../../pagination/dto/req/query.req.dto';
import { PaginationResDto } from '../../pagination/dto/res/pagination.res.dto';

@Injectable()
export class CarService {

  private readonly securityConfig: SecurityConfig;
  private readonly brandRepository: BrandRepository;

  constructor(
              private readonly currencyRepository: CurrencyRepository,
              private readonly missingBrandModelReportRepository: MissingBrandModelReportRepository,
              private readonly emailService: EmailService,
              private readonly paginationService: PaginationService,
              private readonly configService: ConfigService<Configs>,
              @InjectEntityManager()
              private readonly entityManager: EntityManager,
              @InjectDataSource()
              private readonly dataSource: DataSource
              ) {

    this.securityConfig = this.configService.get<SecurityConfig>('security');
    this.brandRepository = BrandRepository(this.dataSource);
  }
  public async getCurrencies(): Promise<CurrencyResDto[]> {
   const currencies = await this.currencyRepository.find();
   return CurrencyMapper.toListDto(currencies);
  }
  public async getBrands(): Promise<BrandResDto[]> {
    const brands = await this.brandRepository.find({ relations: ['models'] });
    return BrandMapper.toListDto(brands);
  }
  public async reportMissingBrandModel(dto: MissingBrandModelReportReqDto, userData: IUserData): Promise<MissingBrandModelReportResDto> {
    return await this.entityManager.transaction(async (entityManager) => {
      const userRepository = entityManager.getRepository(UserEntity);
      const missingBrandModelRepository = entityManager.getRepository(MissingBrandModelReportEntity);

      const user = await userRepository.findOneBy({id: userData.userId});

      if (user.email != dto.email) {
        throw new BadRequestException(
          errorMessages.NOT_AUTHENTICATED_EMAIL,
        );
      }

      const report = await missingBrandModelRepository.save(
        missingBrandModelRepository.create({
          ...dto, user_id: userData.userId
        })
      )
      await this.emailService.sendByEmailType(EEmailType.MISSING_BRAND_MODEL, {
        email: dto.email,
        brand: dto.brand,
        model: dto.model,
        fullName: dto.fullName,
        notes: dto.notes
      }, this.securityConfig.manager_email)

      return MissingBrandModelReportMapper.toDto(report, user);

    })
  }

  public async createBrandOrModel( userData: IUserData,  dto: CreateBrandModelReqDto): Promise<BrandResDto> {
    if (
      userData.role !== EUserRole.MANAGER &&
      userData.role !== EUserRole.ADMINISTRATOR
    ) {
      throw new UnauthorizedException(
        errorMessages.ACCESS_DENIED_USER_ROLE,
      );
    }
    return await this.entityManager.transaction(async (entityManager) => {
      const brandRepository = BrandRepository(entityManager.connection);
      const modelRepository = entityManager.getRepository(ModelEntity);

      const { brand, model } = dto;

      const existingBrand = await brandRepository.findBrandByName(brand);

      if (existingBrand) {
        const existingModel = existingBrand.models.find(m => m.name.toLowerCase() === model.toLowerCase());

        if (existingModel) {
          throw new BadRequestException(errorMessages.BRAND_MODEL_ALREADY_EXIST);
        }

        const newModel = await modelRepository.save(modelRepository.create({ name: model, brand_id: existingBrand.id }));
        existingBrand.models.push(newModel);

        return BrandMapper.toDto(existingBrand);
      } else {
        const newBrand = await brandRepository.save(brandRepository.create({ name: brand, models: [] }));
        const newModel =await modelRepository.save(modelRepository.create({ name: model, brand_id: newBrand.id }));
        newBrand.models.push(newModel);

        return BrandMapper.toDto(newBrand);
      }
    })

  }

  public async getReports(userData: IUserData, query: QueryReqDto): Promise<PaginationResDto<MissingBrandModelReportResDto>> {
    if (
      userData.role !== EUserRole.MANAGER &&
      userData.role !== EUserRole.ADMINISTRATOR
    ) {
      throw new UnauthorizedException(
        errorMessages.ACCESS_DENIED_USER_ROLE,
      );
    }

  const reports = await this.paginationService.paginate(this.missingBrandModelReportRepository, query,['user'])

    const mappedReports = MissingBrandModelReportMapper.toListDto(reports.data);

    return {
      data: mappedReports,
      limit: reports.limit,
      totalCount: reports.totalCount,
      page: reports.page
    }
  }

  public async getReportById(userData: IUserData, reportId:  string): Promise<MissingBrandModelReportResDto> {
    if (
      userData.role !== EUserRole.MANAGER &&
      userData.role !== EUserRole.ADMINISTRATOR
    ) {
      throw new UnauthorizedException(
        errorMessages.ACCESS_DENIED_USER_ROLE,
      );
    }
    const report = await this.missingBrandModelReportRepository.findOne({
      where: { id: reportId },
      relations: ['user'],
    });
    if (!report) {
      throw new NotFoundException(errorMessages.REPORT_NOT_FOUND)
    }
    return MissingBrandModelReportMapper.toDto(report, report.user)

  }

}
