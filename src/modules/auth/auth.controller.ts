import {
  Body,
  Controller,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { statusCodes } from '../../common/constants/status-codes.constant';
import { EUserRole } from '../../database/entities/enums/user-role.enum';
import { PrivateUserResDto } from '../user/dto/res/private-user-res.dto';
import { ActionTokenType } from './decorators/action-token-type.decorator';
import { Roles } from './decorators/admin-or-manager.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipAuth } from './decorators/skip-auth.decorator';
import { ChangePasswordReqDto } from './dto/req/change-password.req.dto';
import { CreateDealershipWorkerReqDto } from './dto/req/create-dealership-worker.req.dto';
import { CreateManagerReqDto } from './dto/req/create-manager.req.dto';
import { ForgotPasswordReqDto } from './dto/req/forgot-password.req.dto';
import { SetPasswordReqDto } from './dto/req/set-password.req.dto';
import { SignInReqDto } from './dto/req/sign-in.req.dto';
import { SignUpReqDto } from './dto/req/sign-up.req.dto';
import { AuthResDto } from './dto/res/auth.res.dto';
import { TokenPairResDto } from './dto/res/token-pair.res.dto';
import { EActionTokenType } from './enums/action-token-type.enum';
import { ActionGuard } from './guards/action.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { IUserData } from './interfaces/user-data.interface';
import { AuthService } from './services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @SkipAuth()
  @ApiConflictResponse({ description: 'Conflict' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({ description: 'Created successfully', type: AuthResDto })
  public async signUp(@Body() dto: SignUpReqDto): Promise<AuthResDto> {
    return await this.authService.signUp(dto);
  }

  @Post('sign-in')
  @SkipAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Signed in successfully',
    type: AuthResDto,
  })
  public async signIn(@Body() dto: SignInReqDto): Promise<AuthResDto> {
    return await this.authService.signIn(dto);
  }

  @Post('refresh')
  @SkipAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiCreatedResponse({
    description: 'Token refreshed successfully',
    type: TokenPairResDto,
  })
  public async refresh(
    @CurrentUser() userData: IUserData,
  ): Promise<TokenPairResDto> {
    return await this.authService.refresh(userData);
  }

  @Post('sign-out')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNoContentResponse({
    description: 'Signed out successfully',
  })
  @HttpCode(statusCodes.NO_CONTENT)
  public async signOut(@CurrentUser() userData: IUserData): Promise<void> {
    return await this.authService.signOut(userData);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Password changed successfully',
  })
  public async changePassword(
    @CurrentUser() userData: IUserData,
    @Body() dto: ChangePasswordReqDto,
  ): Promise<void> {
    return await this.authService.changePassword(userData, dto);
  }

  @Post('forgot-password')
  @SkipAuth()
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Password reset process initiated.',
  })
  public async forgotPassword(
    @Body() dto: ForgotPasswordReqDto,
  ): Promise<void> {
    await this.authService.forgotPassword(dto);
  }

  @Put('forgot-password')
  @SkipAuth()
  @ActionTokenType(EActionTokenType.FORGOT_PASSWORD)
  @UseGuards(ActionGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Password changed successfully',
  })
  @ApiBearerAuth()
  public async setForgotPassword(
    @Body() dto: SetPasswordReqDto,
    @CurrentUser() userData: IUserData,
  ): Promise<void> {
    await this.authService.setForgotPassword(dto, userData);
  }

  @Post('create-manager')
  @Roles(EUserRole.ADMINISTRATOR)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiConflictResponse({ description: 'Conflict' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Created successfully',
    type: PrivateUserResDto,
  })
  @ApiBearerAuth()
  public async createManagerAccount(
    @Body() dto: CreateManagerReqDto,
  ): Promise<PrivateUserResDto> {
    return await this.authService.createManagerAccount(dto);
  }

  @Put('setup-password-manager')
  @SkipAuth()
  @ActionTokenType(EActionTokenType.SETUP_MANAGER)
  @UseGuards(ActionGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Password created successfully',
  })
  @ApiBearerAuth()
  public async setManagerPassword(
    @CurrentUser() userData: IUserData,
    @Body() dto: SetPasswordReqDto,
  ): Promise<void> {
    await this.authService.setManagerPassword(userData, dto);
  }

  @Post('create-dealership-worker')
  @Roles(EUserRole.ADMINISTRATOR)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiConflictResponse({ description: 'Conflict' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'User successfully created.',
    type: PrivateUserResDto,
  })
  @ApiBearerAuth()
  public async createDealershipWorkerAccount(
    @Body() dto: CreateDealershipWorkerReqDto,
    @CurrentUser() userData: IUserData,
  ): Promise<PrivateUserResDto> {
    return await this.authService.createDealershipWorkerAccount(dto, userData);
  }

  @Put('setup-password-worker')
  @SkipAuth()
  @ActionTokenType(EActionTokenType.SETUP_DEALERSHIP_WORKER_PASSWORD)
  @UseGuards(ActionGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Password successfully created.',
  })
  @ApiBearerAuth()
  public async setWorkerPassword(
    @CurrentUser() userData: IUserData,
    @Body() dto: SetPasswordReqDto,
  ): Promise<void> {
    await this.authService.setWorkerPassword(userData, dto);
  }
}
