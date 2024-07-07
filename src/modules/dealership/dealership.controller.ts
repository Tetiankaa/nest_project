import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { EUserRole } from '../../database/entities/enums/user-role.enum';
import { Roles } from '../auth/decorators/admin-or-manager.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { CreateDealershipReqDto } from './dto/req/create-dealership.req.dto';
import { UpdateDealershipReqDto } from './dto/req/update-dealership.req.dto';
import { DealershipResDto } from './dto/res/dealership.res.dto';
import { DealershipService } from './services/dealership.service';

@Controller('dealerships')
@ApiTags('dealerships')
export class DealershipController {
  constructor(private readonly dealershipService: DealershipService) {}

  @Post()
  @Roles(EUserRole.ADMINISTRATOR)
  @UseGuards(RolesGuard)
  @ApiCreatedResponse({
    description: 'Successfully created.',
    type: DealershipResDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiBearerAuth()
  public async createDealership(
    @Body() dto: CreateDealershipReqDto,
    @CurrentUser() user: IUserData,
  ): Promise<DealershipResDto> {
    return await this.dealershipService.createDealership(dto, user);
  }

  @Patch(':id')
  @Roles(EUserRole.ADMINISTRATOR)
  @UseGuards(RolesGuard)
  @ApiOkResponse({
    description: 'Successfully updated.',
    type: DealershipResDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiBearerAuth()
  public async updateDealershipById(
    @Body() dto: UpdateDealershipReqDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DealershipResDto> {
    return await this.dealershipService.updateDealershipById(dto, id);
  }

  @Get(':id')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({
    description: 'Dealership info retrieved successfully',
    type: DealershipResDto,
  })
  public async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DealershipResDto> {
    return await this.dealershipService.getById(id);
  }
}
