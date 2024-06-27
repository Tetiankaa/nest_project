import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CarService } from './services/car.service';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { CurrencyResDto } from './dto/res/currency.res.dto';
import { BrandResDto } from './dto/res/brand.res.dto';
import { ReportMissingBrandModelReqDto } from './dto/req/report-missing-brand-model.req.dto';
import { ReportMissingBrandModelResDto } from './dto/res/report-missing-brand-model.res.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { CreateBrandModelReqDto } from './dto/req/create-brand-model.req.dto';

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
  public async reportMissingBrandModel(@Body() dto: ReportMissingBrandModelReqDto, @CurrentUser() userData: IUserData): Promise<ReportMissingBrandModelResDto> {
      return await this.carService.reportMissingBrandModel(dto, userData);
  }

  @Post('brands')
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async createBrandOrModel(@CurrentUser() userData: IUserData, @Body() dto: CreateBrandModelReqDto): Promise<BrandResDto> {
    return await this.carService.createBrandOrModel(userData, dto);
  }
}
