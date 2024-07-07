import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { statusCodes } from '../../common/constants/status-codes.constant';
import { EUserRole } from '../../database/entities/enums/user-role.enum';
import { Roles } from '../auth/decorators/admin-or-manager.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { MissingBrandModelReportPaginationResDto } from '../pagination/dto/res/api-pagination.res.dto';
import { PaginationResDto } from '../pagination/dto/res/pagination.res.dto';
import { CreateBrandModelReqDto } from './dto/req/create-brand-model.req.dto';
import { MissingBrandModelReportReqDto } from './dto/req/missing-brand-model-report.req.dto';
import { QueryMissingBrandModelReportReqDto } from './dto/req/query-missing-brand-model-report.req.dto';
import { BrandResDto } from './dto/res/brand.res.dto';
import { CurrencyResDto } from './dto/res/currency.res.dto';
import { MissingBrandModelReportResDto } from './dto/res/missing-brand-model-report.res.dto';
import { CarService } from './services/car.service';

@Controller('cars')
@ApiTags('cars')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get('currencies')
  @SkipAuth()
  @ApiOkResponse({
    description: 'Retrieve currencies successfully',
    type: CurrencyResDto,
    isArray: true,
  })
  public async getCurrencies(): Promise<CurrencyResDto[]> {
    return await this.carService.getCurrencies();
  }
  @Get('brands')
  @SkipAuth()
  @ApiOkResponse({
    description: 'Retrieve brands successfully',
    type: BrandResDto,
    isArray: true,
  })
  public async getBrands(): Promise<BrandResDto[]> {
    return await this.carService.getBrands();
  }

  @Post('report-missing-brand-model')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Report successfully created.',
    type: MissingBrandModelReportResDto,
  })
  @ApiBearerAuth()
  public async reportMissingBrandModel(
    @Body() dto: MissingBrandModelReportReqDto,
    @CurrentUser() userData: IUserData,
  ): Promise<MissingBrandModelReportResDto> {
    return await this.carService.reportMissingBrandModel(dto, userData);
  }

  @Post('brands')
  @Roles(EUserRole.ADMINISTRATOR, EUserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Brand and model successfully created.',
    type: BrandResDto,
  })
  @ApiBearerAuth()
  public async createBrandOrModel(
    @Body() dto: CreateBrandModelReqDto,
  ): Promise<BrandResDto> {
    return await this.carService.createBrandOrModel(dto);
  }

  @Get('reports')
  @Roles(EUserRole.ADMINISTRATOR, EUserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiOkResponse({
    description: 'Retrieve reports successfully',
    type: MissingBrandModelReportPaginationResDto,
  })
  @ApiBearerAuth()
  public async getReports(
    @Query() query: QueryMissingBrandModelReportReqDto,
  ): Promise<PaginationResDto<MissingBrandModelReportResDto>> {
    return await this.carService.getReports(query);
  }
  @Get('reports/:id')
  @Roles(EUserRole.ADMINISTRATOR, EUserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({
    description: 'Retrieve report successfully',
    type: MissingBrandModelReportResDto,
  })
  @ApiBearerAuth()
  public async getReportById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MissingBrandModelReportResDto> {
    return await this.carService.getReportById(id);
  }

  @Patch('reports/:id')
  @Roles(EUserRole.ADMINISTRATOR, EUserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiCreatedResponse({
    description: 'Successfully toggled the status of the report',
    type: MissingBrandModelReportResDto,
  })
  @HttpCode(statusCodes.CREATED)
  @ApiBearerAuth()
  public async toggleReportResolved(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MissingBrandModelReportResDto> {
    return await this.carService.toggleReportResolved(id);
  }
}
