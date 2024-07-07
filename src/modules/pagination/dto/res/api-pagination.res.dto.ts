import { ApiProperty } from '@nestjs/swagger';

import { MissingBrandModelReportResDto } from '../../../car/dto/res/missing-brand-model-report.res.dto';
import { PrivatePostResDto } from '../../../post/dto/res/private-post.res.dto';
import { PublicPostResDto } from '../../../post/dto/res/public-post.res.dto';
import { PaginationResDto } from './pagination.res.dto';

export class PublicPostPaginationResDto extends PaginationResDto<PublicPostResDto> {
  @ApiProperty({
    type: PublicPostResDto,
    isArray: true,
  })
  data: PublicPostResDto[];
}

export class PrivatePostPaginationResDto extends PaginationResDto<PrivatePostResDto> {
  @ApiProperty({
    type: PrivatePostResDto,
    isArray: true,
  })
  data: PrivatePostResDto[];
}

export class MissingBrandModelReportPaginationResDto extends PaginationResDto<MissingBrandModelReportResDto> {
  @ApiProperty({
    type: MissingBrandModelReportResDto,
    isArray: true,
  })
  data: MissingBrandModelReportResDto[];
}
