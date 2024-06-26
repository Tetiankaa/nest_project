import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { UpdateUserReqDto } from './dto/req/update-user-req.dto';
import { PrivateUserResDto } from './dto/res/private-user-res.dto';
import { UserService } from './services/user.service';
import { PublicUserResDto } from './dto/res/public-user-res.dto';
import { AuthResDto } from '../auth/dto/res/auth.res.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  public async getMe(@CurrentUser() userData: IUserData): Promise<PrivateUserResDto> {
    return await this.userService.getMe(userData);
  }
  @Delete('me')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  public async deleteMe(@CurrentUser() userData: IUserData): Promise<void> {
     await this.userService.deleteMe(userData);
  }
  @Get(':id')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  public async getById(@Param('id', ParseUUIDPipe) id:  string): Promise<PublicUserResDto> {
    return await this.userService.getById(id);
  }

  @Put("me")
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: "Bad Request"})
  public async updateMe(@CurrentUser() userData: IUserData, @Body() dataToUpdate:UpdateUserReqDto): Promise<PrivateUserResDto> {
    return await this.userService.updateMe(userData, dataToUpdate);
  }

  @Put("me/upgrade-premium")
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  public async upgradeToPremium(@CurrentUser() userData: IUserData): Promise<AuthResDto> {
    return await this.userService.upgradeToPremium(userData);
  }

  // @Post('me/avatar')
  // @ApiBearerAuth()
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @ApiNotFoundResponse({ description: 'Not Found' })
  // @ApiConsumes('multipart/form-data')
  // @ApiFile('avatar', false)
  // @UseInterceptors(FileInterceptor('avatar'))
  // public async uploadAvatar(
  //   @CurrentUser() userData: IUserData,
  //   @UploadedFile() avatar: Express.Multer.File,
  // ): Promise<void> {
  //   await this.userService.uploadAvatar(userData, avatar);
  // }
  //
  // @Delete('me/avatar')
  // @ApiBearerAuth()
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @ApiNotFoundResponse({ description: 'Not Found' })
  // public async deleteAvatar(@CurrentUser() userData: IUserData): Promise<void> {
  //   await this.userService.deleteAvatar(userData);
  // }
}
