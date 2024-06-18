// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   HttpException,
//   Param,
//   ParseUUIDPipe,
//   Patch,
//   Post,
//   Put,
//   UploadedFile,
//   UseInterceptors,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import {
//   ApiBadRequestResponse,
//   ApiBearerAuth,
//   ApiConsumes,
//   ApiForbiddenResponse,
//   ApiNotFoundResponse,
//   ApiTags,
//   ApiUnauthorizedResponse,
// } from '@nestjs/swagger';
//
// import { CurrentUser } from '../auth/decorators/current-user.decorator';
// import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
// import { IUserData } from '../auth/interfaces/user-data.interface';
// import { UpdateUserReqDto } from './dto/req/update-user-req.dto';
// import { PrivateUserResDto } from './dto/res/private-user-res.dto';
// import { UserService } from './services/user.service';
//
// @ApiTags('users')
// @Controller('users')
// export class UserController {
//   constructor(private readonly userService: UserService) {}
//
//   @Get('me')
//   @ApiBearerAuth()
//   @ApiForbiddenResponse({ description: ' Forbidden' })
//   @ApiUnauthorizedResponse({ description: 'Unauthorized' })
//   @ApiNotFoundResponse({ description: 'Not Found' })
//   public async getMe(@CurrentUser() userData: IUserData): Promise<PrivateUserResDto> {
//     return await this.userService.getMe(userData);
//   }
//
//   @Get(':id')
//   @SkipAuth()
//   @ApiNotFoundResponse({ description: 'Not Found' })
//   public async getById(
//     @Param('id', ParseUUIDPipe) id: string,
//   ): Promise<PrivateUserResDto> {
//     return await this.userService.getById(id);
//   }
//
//   @Patch('me')
//   @ApiBearerAuth()
//   @ApiForbiddenResponse({ description: ' Forbidden' })
//   @ApiUnauthorizedResponse({ description: 'Unauthorized' })
//   @ApiNotFoundResponse({ description: 'Not Found' })
//   public async updateMe(
//     @CurrentUser() userData: IUserData,
//     @Body() updateUserDto: UpdateUserReqDto,
//   ): Promise<PrivateUserResDto> {
//     return await this.userService.updateMe(userData, updateUserDto);
//   }
//
//   // @Post('me/avatar')
//   // @ApiBearerAuth()
//   // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
//   // @ApiNotFoundResponse({ description: 'Not Found' })
//   // @ApiConsumes('multipart/form-data')
//   // @ApiFile('avatar', false)
//   // @UseInterceptors(FileInterceptor('avatar'))
//   // public async uploadAvatar(
//   //   @CurrentUser() userData: IUserData,
//   //   @UploadedFile() avatar: Express.Multer.File,
//   // ): Promise<void> {
//   //   await this.userService.uploadAvatar(userData, avatar);
//   // }
//   //
//   // @Delete('me/avatar')
//   // @ApiBearerAuth()
//   // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
//   // @ApiNotFoundResponse({ description: 'Not Found' })
//   // public async deleteAvatar(@CurrentUser() userData: IUserData): Promise<void> {
//   //   await this.userService.deleteAvatar(userData);
//   // }
// }
