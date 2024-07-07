import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { AuthResDto } from '../auth/dto/res/auth.res.dto';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { UpdateUserReqDto } from './dto/req/update-user-req.dto';
import { PrivateUserResDto } from './dto/res/private-user-res.dto';
import { PublicUserResDto } from './dto/res/public-user-res.dto';
import { UserService } from './services/user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiOkResponse({
    description: 'Retrieve current user successfully',
    type: PrivateUserResDto,
  })
  public async getMe(
    @CurrentUser() userData: IUserData,
  ): Promise<PrivateUserResDto> {
    return await this.userService.getMe(userData);
  }
  @Delete('me')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({ description: 'User successfully deleted.' })
  public async deleteMe(@CurrentUser() userData: IUserData): Promise<void> {
    await this.userService.deleteMe(userData);
  }
  @Get(':id')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({
    description: 'Retrieve user information successfully',
    type: PublicUserResDto,
  })
  public async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicUserResDto> {
    return await this.userService.getById(id);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'The user profile has been successfully updated.',
    type: PrivateUserResDto,
  })
  public async updateMe(
    @CurrentUser() userData: IUserData,
    @Body() dataToUpdate: UpdateUserReqDto,
  ): Promise<PrivateUserResDto> {
    return await this.userService.updateMe(userData, dataToUpdate);
  }

  @Put('me/upgrade-premium')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    description: 'The user profile has been successfully updated to Premium.',
    type: AuthResDto,
  })
  public async upgradeToPremium(
    @CurrentUser() userData: IUserData,
  ): Promise<AuthResDto> {
    return await this.userService.upgradeToPremium(userData);
  }
}
