import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { statusCodes } from '../../common/constants/status-codes.constant';
import { ApiFile } from '../../common/decorators/api-file.decorator';
import { EUserRole } from '../../database/entities/enums/user-role.enum';
import { Roles } from '../auth/decorators/admin-or-manager.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { IUserData } from '../auth/interfaces/user-data.interface';
import {
  PrivatePostPaginationResDto,
  PublicPostPaginationResDto,
} from '../pagination/dto/res/api-pagination.res.dto';
import { PaginationResDto } from '../pagination/dto/res/pagination.res.dto';
import { CreatePostReqDto } from './dto/req/create-post.req.dto';
import { QueryPostReqDto } from './dto/req/query-post.req.dto';
import { QueryPostProfanityReqDto } from './dto/req/query-post-profanity.req.dto';
import { UpdatePostReqDto } from './dto/req/update-post.req.dto';
import { UpdatePostAfterProfanityReqDto } from './dto/req/update-post-after-profanity.req.dto';
import { PostInfoResDto } from './dto/res/post-info.res.dto';
import { PrivatePostResDto } from './dto/res/private-post.res.dto';
import { PublicPostResDto } from './dto/res/public-post.res.dto';
import { PostService } from './services/post.service';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiCreatedResponse({
    description: 'Post created successfully',
    type: PrivatePostResDto,
  })
  @ApiBearerAuth()
  public async savePost(
    @Body() dto: CreatePostReqDto,
    @CurrentUser() userData: IUserData,
  ): Promise<PrivatePostResDto> {
    return await this.postService.savePost(dto, userData);
  }

  @Post(':id/view')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiNoContentResponse({ description: 'View recorded successfully' })
  @HttpCode(statusCodes.NO_CONTENT)
  public async saveView(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.postService.saveView(id);
  }

  @Get()
  @SkipAuth()
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiOkResponse({
    description: 'Posts retrieved successfully',
    type: PublicPostPaginationResDto,
  })
  public async getAll(
    @Query() query: QueryPostReqDto,
  ): Promise<PaginationResDto<PublicPostResDto>> {
    return await this.postService.getAll(query);
  }

  @Get('my')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiOkResponse({
    description: 'My posts retrieved successfully',
    type: PrivatePostPaginationResDto,
  })
  @ApiBearerAuth()
  public async getMyPosts(
    @CurrentUser() userData: IUserData,
    @Query() query: QueryPostReqDto,
  ): Promise<PaginationResDto<PrivatePostResDto>> {
    return await this.postService.getMyPosts(userData, query);
  }
  @Get('profanity-detected')
  @Roles(EUserRole.ADMINISTRATOR, EUserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiOkResponse({
    description: 'Posts with profanity detected retrieved successfully',
    type: PrivatePostPaginationResDto,
  })
  @ApiBearerAuth()
  public async getPostsWithProfanity(
    @Query() query: QueryPostProfanityReqDto,
  ): Promise<PaginationResDto<PrivatePostResDto>> {
    return await this.postService.getPostsWithProfanity(query);
  }

  @Get('profanity-detected/:id')
  @Roles(EUserRole.ADMINISTRATOR, EUserRole.MANAGER)
  @UseGuards(RolesGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({
    description: 'Post with profanity detected retrieved successfully',
    type: PrivatePostResDto,
  })
  @ApiBearerAuth()
  public async getPostWithProfanityById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PrivatePostResDto> {
    return await this.postService.getPostWithProfanityById(id);
  }

  @Get(':id')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({
    description: 'Public post retrieved successfully',
    type: PublicPostResDto,
  })
  public async getPublicPostById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PublicPostResDto> {
    return await this.postService.getPublicPostById(id);
  }
  @Get('my/archive')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiOkResponse({
    description: 'My archived posts retrieved successfully',
    type: PrivatePostPaginationResDto,
  })
  @ApiBearerAuth()
  public async getMyArchivePosts(
    @CurrentUser() userData: IUserData,
    @Query() query: QueryPostReqDto,
  ): Promise<PaginationResDto<PrivatePostResDto>> {
    return await this.postService.getMyArchivePosts(userData, query);
  }

  @Get('my/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiOkResponse({
    description: 'Private post retrieved successfully',
    type: PrivatePostResDto,
  })
  @ApiBearerAuth()
  public async getPrivatePostById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
  ): Promise<PrivatePostResDto> {
    return await this.postService.getPrivatePostById(id, userData);
  }

  @Delete('my/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNoContentResponse({ description: 'Post archived successfully' })
  @HttpCode(statusCodes.NO_CONTENT)
  @ApiBearerAuth()
  public async archivePostById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
  ): Promise<void> {
    return await this.postService.archivePostById(id, userData);
  }

  @Put('my/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiCreatedResponse({
    description: 'Post updated successfully',
    type: PrivatePostResDto,
  })
  @ApiBearerAuth()
  public async updatePost(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
    @Body() dto: UpdatePostReqDto,
  ): Promise<PrivatePostResDto> {
    return await this.postService.updatePost(id, userData, dto);
  }

  @Delete('my/forever/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiNoContentResponse({ description: 'Post deleted permanently' })
  @HttpCode(statusCodes.NO_CONTENT)
  @ApiBearerAuth()
  public async deleteForeverPostById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
  ): Promise<void> {
    return await this.postService.deleteForeverPostById(id, userData);
  }

  @Patch('my/restore/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiOkResponse({
    description: 'Post restored from archive successfully',
    type: PrivatePostResDto,
  })
  @ApiBearerAuth()
  public async restorePostFromArchive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
  ): Promise<PrivatePostResDto> {
    return await this.postService.restorePostFromArchive(id, userData);
  }

  @Patch('my/resubmit-after-profanity/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({
    description: 'Post resubmitted after profanity detected.',
    type: PrivatePostResDto,
  })
  @ApiBearerAuth()
  public async updatePostAfterProfanity(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
    @Body() dto: UpdatePostAfterProfanityReqDto,
  ): Promise<PrivatePostResDto> {
    return await this.postService.updatePostAfterProfanity(id, userData, dto);
  }

  @Get('my/info/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({
    description: 'Post info retrieved successfully',
    type: PostInfoResDto,
  })
  @ApiBearerAuth()
  public async getPostInfo(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() userData: IUserData,
  ): Promise<PostInfoResDto> {
    return await this.postService.getPostInfo(id, userData);
  }

  @Post('my/images/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid request' })
  @ApiNoContentResponse({ description: 'Images uploaded successfully' })
  @HttpCode(statusCodes.NO_CONTENT)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiFile('images')
  public async uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() images: Express.Multer.File[],
    @CurrentUser() userData: IUserData,
  ): Promise<void> {
    await this.postService.uploadImages(id, images, userData);
  }

  @Delete('my/images/:postId/:imageId')
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiNoContentResponse({ description: 'Image deleted successfully' })
  @HttpCode(statusCodes.NO_CONTENT)
  public async deleteImage(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @CurrentUser() userData: IUserData,
  ): Promise<void> {
    await this.postService.deleteImage(postId, imageId, userData);
  }
}
