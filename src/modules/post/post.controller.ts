import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import { PostService } from './services/post.service';
import { BaseCreatePostReqDto } from './dto/req/base-create-post.req.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IUserData } from '../auth/interfaces/user-data.interface';
import { PrivatePostResDto } from './dto/res/private-post.res.dto';

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
  public async saveCar(@Body() dto: BaseCreatePostReqDto, @CurrentUser() userData: IUserData): Promise<PrivatePostResDto> {
   return await this.postService.saveCar(dto, userData)
  }
}
