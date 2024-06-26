import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse, ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from './decorators/current-user.decorator';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { SignInReqDto } from './dto/req/sign-in.req.dto';
import { SignUpReqDto } from './dto/req/sign-up.req.dto';
import { AuthResDto } from './dto/res/auth.res.dto';
import { TokenPairResDto } from './dto/res/token-pair.res.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { IUserData } from './interfaces/user-data.interface';
import { AuthService } from './services/auth.service';
import { ChangePasswordReqDto } from './dto/req/change-password.req.dto';
import { ForgotPasswordReqDto } from './dto/req/forgot-password.req.dto';
import { SetPasswordReqDto } from './dto/req/set-password.req.dto';
import { ActionTokenType } from './decorators/action-token-type.decorator';
import { EActionTokenType } from './enums/action-token-type.enum';
import { ActionGuard } from './guards/action.guard';
import { CreateManagerReqDto } from './dto/req/create-manager.req.dto';
import { PrivateUserResDto } from '../user/dto/res/private-user-res.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @SkipAuth()
  @ApiConflictResponse({ description: 'Conflict'})
  public async signUp(@Body() dto: SignUpReqDto): Promise<AuthResDto> {
    return await this.authService.signUp(dto);
  }

  @Post('sign-in')
  @SkipAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  public async signIn(@Body() dto: SignInReqDto): Promise<AuthResDto> {
    return await this.authService.signIn(dto);
  }

  @Post('refresh')
  @SkipAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  public async refresh(
    @CurrentUser() userData: IUserData,
  ): Promise<TokenPairResDto> {
    return await this.authService.refresh(userData);
  }

  @Post('sign-out')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized'} )
  public async signOut(@CurrentUser() userData: IUserData): Promise<void> {
    return await this.authService.signOut(userData);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBadRequestResponse({ description: 'Bad Request'})
  public async changePassword(@CurrentUser() userData: IUserData, @Body() dto: ChangePasswordReqDto): Promise<void> {
    return await this.authService.changePassword(userData, dto);
  }

  @Post('forgot-password')
  @SkipAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  public async forgotPassword(@Body() dto: ForgotPasswordReqDto): Promise<void> {
    await this.authService.forgotPassword(dto);
  }

  @Put('forgot-password')
  @SkipAuth()
  @ActionTokenType(EActionTokenType.FORGOT_PASSWORD)
  @UseGuards(ActionGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBearerAuth()
  public async setForgotPassword(@Body() dto: SetPasswordReqDto, @CurrentUser() userData: IUserData): Promise<void> {
    await this.authService.setForgotPassword(dto, userData);
  }

  @Post('create-manager')
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiConflictResponse({ description: 'Conflict'})
  @ApiBearerAuth()
  public async createManagerAccount(@CurrentUser() userData: IUserData, @Body() dto: CreateManagerReqDto):Promise<PrivateUserResDto> {
    return await this.authService.createManagerAccount(userData, dto);
  }

  @Put('setup-password-manager')
  @SkipAuth()
  @ActionTokenType(EActionTokenType.SETUP_MANAGER)
  @UseGuards(ActionGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized'})
  @ApiBearerAuth()
  public async setManagerPassword(@CurrentUser() userData: IUserData, @Body() dto: SetPasswordReqDto ): Promise<void> {
    await this.authService.setManagerPassword(userData, dto);
  }
}
