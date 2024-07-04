import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse, ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { PostService } from './services/post.service';
import { CreatePostReqDto } from './dto/req/create-post.req.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { PrivatePostResDto } from './dto/res/private-post.res.dto';
import { SkipAuth } from '../auth/decorators/skip-auth.decorator';
import { QueryReqDto } from '../pagination/dto/req/query.req.dto';
import { PaginationResDto } from '../pagination/dto/res/pagination.res.dto';
import { PublicPostResDto } from './dto/res/public-post.res.dto';
import { QueryPostReqDto } from './dto/req/query-post.req.dto';
import { UpdatePostReqDto } from './dto/req/update-post.req.dto';
import { UpdatePostAfterProfanityReqDto } from './dto/req/update-post-after-profanity.req.dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {
  }

  @Post()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiForbiddenResponse({description: 'Forbidden'})
  @ApiBearerAuth()
  public async saveCar(@Body() dto: CreatePostReqDto, @CurrentUser() userData: IUserData): Promise<PrivatePostResDto> {
   return await this.postService.saveCar(dto, userData)
  }

  @Post(':id/view')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  public async saveView(@Param('id', ParseUUIDPipe) id:  string): Promise<void> {
    await this.postService.saveView(id);
  }

  @Get()
  @SkipAuth()
  @ApiBadRequestResponse({ description: 'Bad Request'})
  public async getAll(@Query() query: QueryPostReqDto): Promise<PaginationResDto<PublicPostResDto>> {
    return await this.postService.getAll(query);
  }

  @Get('my')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async getMyPosts(@CurrentUser() userData: IUserData, @Query() query: QueryPostReqDto): Promise<PaginationResDto<PrivatePostResDto>> {
    return await this.postService.getMyPosts(userData, query);
  }

  @Get(':id')
  @SkipAuth()
  @ApiNotFoundResponse({ description: 'Not Found' })
  public async getPublicPostById(@Param('id', ParseUUIDPipe) id:  string): Promise<PublicPostResDto> {
    return await this.postService.getPublicPostById(id);
  }
  @Get('my/archive')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async getMyArchivePosts(@CurrentUser() userData: IUserData, @Query() query: QueryPostReqDto): Promise<PaginationResDto<PrivatePostResDto>> {
    return await this.postService.getMyArchivePosts(userData, query);
  }

  @Get('my/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async getPrivatePostById(@Param('id', ParseUUIDPipe, ) id:  string, @CurrentUser() userData: IUserData): Promise<PrivatePostResDto> {
    return await this.postService.getPrivatePostById(id, userData);
  }

  @Delete('my/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async archivePostById(@Param('id', ParseUUIDPipe, ) id:  string, @CurrentUser() userData: IUserData): Promise<void> {
    return await this.postService.archivePostById(id, userData);
  }

  @Put('my/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async updatePost(
    @Param('id', ParseUUIDPipe, ) id:  string,
    @CurrentUser() userData: IUserData,
    @Body() dto: UpdatePostReqDto
  ):Promise<PrivatePostResDto> {
    return await this.postService.updatePost(id, userData, dto);
  }

  @Delete('my/forever/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async deleteForeverPostById(@Param('id', ParseUUIDPipe, ) id:  string, @CurrentUser() userData: IUserData): Promise<void> {
    return await this.postService.deleteForeverPostById(id, userData);
  }

  @Patch('my/restore/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiBearerAuth()
  public async restorePost(@Param('id', ParseUUIDPipe, ) id:  string, @CurrentUser() userData: IUserData): Promise<PrivatePostResDto> {
    return await this.postService.restorePost(id, userData);
  }

  @Patch('my/resubmit-after-profanity/:id')
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Bad Request'})
  @ApiForbiddenResponse({ description: 'Forbidden'})
  @ApiBearerAuth()
  public async updatePostAfterProfanity(
    @Param('id', ParseUUIDPipe, ) id:  string,
    @CurrentUser() userData: IUserData,
    @Body() dto: UpdatePostAfterProfanityReqDto
  ): Promise<PrivatePostResDto> {
    return await this.postService.updatePostAfterProfanity(id, userData, dto);
  }
}
