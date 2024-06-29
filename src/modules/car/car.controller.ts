import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CarService } from './services/car.service';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { CurrencyResDto } from './dto/res/currency.res.dto';
import { BrandResDto } from './dto/res/brand.res.dto';
import { MissingBrandModelReportReqDto } from './dto/req/missing-brand-model-report.req.dto';
import { MissingBrandModelReportResDto } from './dto/res/missing-brand-model-report.res.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { CreateBrandModelReqDto } from './dto/req/create-brand-model.req.dto';
import { QueryReqDto } from '../pagination/dto/req/query.req.dto';
import { PaginationResDto } from '../pagination/dto/res/pagination.res.dto';

@Controller('cars')
@ApiTags('cars')
export class CarController {
  constructor(private readonly carService: CarService) {
  }

  @Get('currencies')
  @SkipAuth()
  public async getCurrencies(): Promise<CurrencyResDto[]> {
    return await this.carService.getCurrencies();
  }
  @Get('brands')
  @SkipAuth()
  public async getBrands(): Promise<BrandResDto[]> {
    return await this.carService.getBrands();
  }

  @Post('report-missing-brand-model')
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async reportMissingBrandModel(@Body() dto: MissingBrandModelReportReqDto, @CurrentUser() userData: IUserData): Promise<MissingBrandModelReportResDto> {
      return await this.carService.reportMissingBrandModel(dto, userData);
  }

  @Post('brands')
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async createBrandOrModel(@CurrentUser() userData: IUserData, @Body() dto: CreateBrandModelReqDto): Promise<BrandResDto> {
    return await this.carService.createBrandOrModel(userData, dto);
  }

  @Get('reports')
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async getReports(@CurrentUser() userData: IUserData, @Query() query: QueryReqDto): Promise<PaginationResDto<MissingBrandModelReportResDto>> {
    return await this.carService.getReports(userData, query);
  }
  @Get('reports/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiNotFoundResponse({ description: 'Not Found'})
  @ApiBearerAuth()
  public async getReportById(@CurrentUser() userData: IUserData, @Param('id', ParseUUIDPipe) id:  string): Promise<MissingBrandModelReportResDto> {
    return await this.carService.getReportById(userData, id);
  }
}
